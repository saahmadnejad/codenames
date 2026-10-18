import { Board, GRID_SIZE, Team, TileOwner } from '../game/board';

export type Phase = 'clue' | 'guessing' | 'gameOver';

export type Winner = Team | 'draw';

export type WinReason = 'agents' | 'assassin' | 'timeout';

export type GuessOutcome = 'agent' | 'bystander' | 'enemy' | 'assassin';

export interface Clue {
  /** The single word spoken by the spymaster. */
  word: string;
  /** How many words the clue relates to; allows `number + 1` guesses. */
  number: number;
  team: Team;
}

export interface GameState {
  board: Board;
  /** Whether tile i has been revealed. Parallel to board.words/owners. */
  revealed: boolean[];
  /** The team currently giving a clue or guessing. */
  currentTeam: Team;
  phase: Phase;
  /** Set while phase is 'guessing'. */
  clue: Clue | null;
  /** Guesses the current team may still make this turn. */
  guessesLeft: number;
  /** Completed team turns; the game draws at MAX_TURNS. */
  turnsTaken: number;
  winner: Winner | null;
  winReason: WinReason | null;
  /** Result of the most recent guess, kept across turn handoff for UI feedback. */
  lastGuess: { index: number; outcome: GuessOutcome; by: Team } | null;
  clueHistory: Clue[];
}

export const MAX_TURNS = 40;

export type GameAction =
  | { type: 'newGame'; board: Board }
  | { type: 'giveClue'; word: string; number: number }
  | { type: 'guess'; index: number }
  /** Field team voluntarily stops guessing before guesses run out. */
  | { type: 'endTurn' };

export function createInitialState(board: Board): GameState {
  return {
    board,
    revealed: new Array<boolean>(GRID_SIZE).fill(false),
    currentTeam: board.startingTeam,
    phase: 'clue',
    clue: null,
    guessesLeft: 0,
    turnsTaken: 0,
    winner: null,
    winReason: null,
    lastGuess: null,
    clueHistory: [],
  };
}

export function otherTeam(team: Team): Team {
  return team === 'red' ? 'blue' : 'red';
}

function outcomeOf(owner: TileOwner, guesser: Team): GuessOutcome {
  switch (owner) {
    case 'assassin':
      return 'assassin';
    case 'neutral':
      return 'bystander';
    default:
      return owner === guesser ? 'agent' : 'enemy';
  }
}

export function remainingAgents(
  owners: readonly TileOwner[],
  revealed: readonly boolean[],
  team: Team,
): number {
  let total = 0;
  for (let i = 0; i < owners.length; i++) {
    if (owners[i] === team && !revealed[i]) {
      total++;
    }
  }
  return total;
}

/** Unrevealed tile count, for validating clue numbers. */
function unrevealedCount(revealed: readonly boolean[]): number {
  let total = 0;
  for (const r of revealed) {
    if (!r) {
      total++;
    }
  }
  return total;
}

export interface AgentProgress {
  found: number;
  total: number;
}

export function agentProgress(state: GameState): Record<Team, AgentProgress> {
  const progress = {} as Record<Team, AgentProgress>;
  for (const team of ['red', 'blue'] as const) {
    const total = state.board.owners.filter(o => o === team).length;
    progress[team] = { found: total - remainingAgents(state.board.owners, state.revealed, team), total };
  }
  return progress;
}

/**
 * Returns an error message if the clue is illegal, else null.
 * Kept separate from the reducer so the UI can show inline validation
 * while the reducer just ignores invalid actions.
 */
export function validateClue(state: GameState, word: string, number: number): string | null {
  if (state.phase !== 'clue') {
    return 'It is not the clue phase';
  }
  const trimmed = word.trim();
  if (trimmed.length === 0) {
    return 'A clue needs a word';
  }
  if (!Number.isInteger(number) || number < 1) {
    return 'The number must be a positive whole number';
  }
  if (number > unrevealedCount(state.revealed)) {
    return 'The number cannot exceed the words still face down';
  }
  const lower = trimmed.toLowerCase();
  if (state.board.words.some(w => w.toLowerCase() === lower)) {
    return 'The clue cannot be a word on the board';
  }
  if (state.clueHistory.some(c => c.word.toLowerCase() === lower)) {
    return 'That clue word has already been used';
  }
  return null;
}

function advanceTurn(state: GameState): GameState {
  const turnsTaken = state.turnsTaken + 1;
  const base: GameState = {
    ...state,
    currentTeam: otherTeam(state.currentTeam),
    clue: null,
    guessesLeft: 0,
    turnsTaken,
  };
  if (turnsTaken >= MAX_TURNS) {
    return { ...base, phase: 'gameOver', winner: 'draw', winReason: 'timeout' };
  }
  return { ...base, phase: 'clue' };
}

function applyGuess(state: GameState, index: number): GameState {
  const owner = state.board.owners[index];
  const revealed = state.revealed.slice();
  revealed[index] = true;
  const outcome = outcomeOf(owner, state.currentTeam);
  const guessed: GameState = {
    ...state,
    revealed,
    lastGuess: { index, outcome, by: state.currentTeam },
  };

  if (owner === 'assassin') {
    return {
      ...guessed,
      phase: 'gameOver',
      winner: otherTeam(state.currentTeam),
      winReason: 'assassin',
      guessesLeft: 0,
    };
  }

  const progress = { red: 0, blue: 0 };
  progress.red = remainingAgents(state.board.owners, revealed, 'red');
  progress.blue = remainingAgents(state.board.owners, revealed, 'blue');
  if (progress[state.currentTeam] === 0) {
    return {
      ...guessed,
      phase: 'gameOver',
      winner: state.currentTeam,
      winReason: 'agents',
      guessesLeft: 0,
    };
  }
  // Revealing the enemy's last agent also ends the game in their favour.
  if (progress[otherTeam(state.currentTeam)] === 0) {
    return {
      ...guessed,
      phase: 'gameOver',
      winner: otherTeam(state.currentTeam),
      winReason: 'agents',
      guessesLeft: 0,
    };
  }

  if (outcome !== 'agent') {
    // Bystander or enemy agent: the turn ends immediately.
    return advanceTurn(guessed);
  }

  const guessesLeft = state.guessesLeft - 1;
  if (guessesLeft === 0) {
    return advanceTurn({ ...guessed, guessesLeft });
  }
  return { ...guessed, guessesLeft };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'newGame':
      return createInitialState(action.board);

    case 'giveClue': {
      if (validateClue(state, action.word, action.number) !== null) {
        return state;
      }
      const trimmed = action.word.trim();
      const clue: Clue = {
        word: trimmed,
        number: action.number,
        team: state.currentTeam,
      };
      return {
        ...state,
        phase: 'guessing',
        clue,
        guessesLeft: action.number + 1,
        clueHistory: [...state.clueHistory, clue],
        lastGuess: null,
      };
    }

    case 'guess': {
      if (state.phase !== 'guessing' || state.guessesLeft <= 0) {
        return state;
      }
      if (action.index < 0 || action.index >= GRID_SIZE || state.revealed[action.index]) {
        return state;
      }
      return applyGuess(state, action.index);
    }

    case 'endTurn':
      if (state.phase !== 'guessing') {
        return state;
      }
      return advanceTurn(state);

    default:
      return state;
  }
}
