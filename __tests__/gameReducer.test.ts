import { Board, TileOwner } from '../src/game/board';
import {
  agentProgress,
  createInitialState,
  gameReducer,
  GameState,
  MAX_TURNS,
  otherTeam,
  remainingAgents,
  validateClue,
} from '../src/state/gameReducer';

/**
 * Fixed board for tests: red owns 0..8 (9 agents), blue 9..16 (8),
 * neutral 17..23, assassin 24. Red starts with the clue.
 */
function fixedBoard(): Board {
  const owners: TileOwner[] = [
    ...Array<TileOwner>(9).fill('red'),
    ...Array<TileOwner>(8).fill('blue'),
    ...Array<TileOwner>(7).fill('neutral'),
    'assassin',
  ];
  return {
    words: Array.from({ length: 25 }, (_, i) => `word${i}`),
    owners,
    startingTeam: 'red',
  };
}

function start(): GameState {
  return createInitialState(fixedBoard());
}

function giveClue(state: GameState, word: string, number: number): GameState {
  return gameReducer(state, { type: 'giveClue', word, number });
}

function guess(state: GameState, index: number): GameState {
  return gameReducer(state, { type: 'guess', index });
}

describe('initial state', () => {
  it('starts in the clue phase with the starting team', () => {
    const s = start();
    expect(s.phase).toBe('clue');
    expect(s.currentTeam).toBe('red');
    expect(s.turnsTaken).toBe(0);
    expect(s.winner).toBeNull();
    expect(s.revealed.every(r => !r)).toBe(true);
  });
});

describe('validateClue', () => {
  it('accepts a valid clue', () => {
    expect(validateClue(start(), 'animal', 2)).toBeNull();
  });

  it('rejects empty words, bad numbers, board words, repeats, and wrong phase', () => {
    const s = start();
    expect(validateClue(s, '   ', 2)).toMatch(/needs a word/);
    expect(validateClue(s, 'animal', 0)).toMatch(/positive whole number/);
    expect(validateClue(s, 'animal', 1.5)).toMatch(/positive whole number/);
    expect(validateClue(s, 'animal', 99)).toMatch(/exceed/);
    expect(validateClue(s, 'word3', 1)).toMatch(/on the board/);

    const after = giveClue(s, 'animal', 2);
    expect(validateClue(after, 'animal', 1)).toMatch(/not the clue phase/);
    const nextClue = guess(giveClue(after, 'candy', 1), 17); // bystander ends red's turn
    expect(validateClue(nextClue, 'ANIMAL', 1)).toMatch(/already been used/);
  });
});

describe('giveClue', () => {
  it('moves to guessing with number + 1 guesses', () => {
    const s = giveClue(start(), 'animal', 2);
    expect(s.phase).toBe('guessing');
    expect(s.clue).toEqual({ word: 'animal', number: 2, team: 'red' });
    expect(s.guessesLeft).toBe(3);
    expect(s.clueHistory).toHaveLength(1);
  });

  it('ignores invalid clues', () => {
    const s = start();
    expect(giveClue(s, 'word0', 1)).toBe(s); // board word — same reference back
    expect(giveClue(s, '', 1)).toBe(s);
    expect(giveClue(s, 'animal', 0)).toBe(s);
  });
});

describe('guessing', () => {
  it('reveals an agent, decrements guesses, and stays in the turn', () => {
    const s = guess(giveClue(start(), 'animal', 3), 0);
    expect(s.revealed[0]).toBe(true);
    expect(s.phase).toBe('guessing');
    expect(s.guessesLeft).toBe(3); // 4 granted, 1 used
    expect(s.lastGuess).toEqual({ index: 0, outcome: 'agent', by: 'red' });
    expect(s.currentTeam).toBe('red');
  });

  it('ignores guesses outside the board, onto revealed tiles, or without a clue', () => {
    const s = giveClue(start(), 'animal', 2);
    expect(guess(s, -1)).toEqual(s);
    expect(guess(s, 99)).toEqual(s);
    const afterFirst = guess(s, 0);
    expect(afterFirst.revealed[0]).toBe(true);
    expect(guess(afterFirst, 0)).toEqual(afterFirst); // already revealed
    expect(guess(start(), 0)).toEqual(start()); // still clue phase
  });

  it('ends the turn on a bystander', () => {
    const s = guess(giveClue(start(), 'animal', 3), 17);
    expect(s.revealed[17]).toBe(true);
    expect(s.lastGuess?.outcome).toBe('bystander');
    expect(s.phase).toBe('clue');
    expect(s.currentTeam).toBe('blue');
    expect(s.turnsTaken).toBe(1);
  });

  it('ends the turn on an enemy agent, which now counts for the other team', () => {
    const s = guess(giveClue(start(), 'animal', 3), 9);
    expect(s.lastGuess?.outcome).toBe('enemy');
    expect(s.phase).toBe('clue');
    expect(s.currentTeam).toBe('blue');
    expect(agentProgress(s).blue.found).toBe(1);
  });

  it('ends the turn when the allowed guesses run out', () => {
    // clue number 1 => 2 guesses: two correct guesses then the turn ends
    let s = giveClue(start(), 'animal', 1);
    s = guess(s, 0);
    expect(s.phase).toBe('guessing');
    s = guess(s, 1);
    expect(s.phase).toBe('clue');
    expect(s.currentTeam).toBe('blue');
    expect(s.turnsTaken).toBe(1);
  });

  it('lets the field team stop voluntarily', () => {
    const s = gameReducer(giveClue(start(), 'animal', 3), { type: 'endTurn' });
    expect(s.phase).toBe('clue');
    expect(s.currentTeam).toBe('blue');
  });

  it('ignores endTurn outside the guessing phase', () => {
    expect(gameReducer(start(), { type: 'endTurn' })).toEqual(start());
  });
});

describe('winning', () => {
  it('wins when all 9 own agents are revealed', () => {
    let s = giveClue(start(), 'animal', 9);
    for (let i = 0; i < 8; i++) {
      s = guess(s, i);
    }
    expect(s.phase).toBe('guessing');
    s = guess(s, 8);
    expect(s.phase).toBe('gameOver');
    expect(s.winner).toBe('red');
    expect(s.winReason).toBe('agents');
  });

  it('loses instantly on the assassin', () => {
    const s = guess(giveClue(start(), 'animal', 3), 24);
    expect(s.phase).toBe('gameOver');
    expect(s.winner).toBe('blue');
    expect(s.winReason).toBe('assassin');
    expect(s.lastGuess).toEqual({ index: 24, outcome: 'assassin', by: 'red' });
  });

  it('the enemy wins if their last agent is revealed accidentally', () => {
    let s = start();
    // Red keeps revealing blue agents (turn ends), then blue wastes a turn
    // on a bystander, until only blue agent at index 16 remains.
    for (let i = 0; i < 7; i++) {
      s = guess(giveClue(s, `c${i}`, 1), 9 + i);
      s = guess(giveClue(s, `r${i}`, 1), 17 + i);
    }
    expect(s.currentTeam).toBe('red');
    // Red's clue, but red accidentally reveals blue's last agent — blue wins.
    s = guess(giveClue(s, 'spy', 1), 16);
    expect(s.phase).toBe('gameOver');
    expect(s.winner).toBe('blue');
    expect(s.winReason).toBe('agents');
  });

  it('stops accepting guesses after game over', () => {
    const over = guess(giveClue(start(), 'animal', 3), 24);
    expect(guess(over, 0)).toEqual(over);
    expect(giveClue(over, 'animal', 1)).toEqual(over);
  });
});

describe('turn limit', () => {
  it('draws after 40 turns', () => {
    let s = start();
    for (let i = 0; i < MAX_TURNS - 1 && s.phase !== 'gameOver'; i++) {
      // end each turn immediately with a voluntary pass
      s = gameReducer(giveClue(s, `clue${i}`, 1), { type: 'endTurn' });
      expect(s.phase).not.toBe('gameOver');
    }
    s = gameReducer(giveClue(s, 'lastclue', 1), { type: 'endTurn' });
    expect(s.phase).toBe('gameOver');
    expect(s.winner).toBe('draw');
    expect(s.winReason).toBe('timeout');
    expect(s.turnsTaken).toBe(MAX_TURNS);
  });
});

describe('helpers', () => {
  it('otherTeam flips', () => {
    expect(otherTeam('red')).toBe('blue');
    expect(otherTeam('blue')).toBe('red');
  });

  it('remainingAgents counts only unrevealed tiles', () => {
    const board = fixedBoard();
    const s = start();
    expect(remainingAgents(board.owners, s.revealed, 'red')).toBe(9);
    const after = guess(giveClue(s, 'animal', 3), 0);
    expect(remainingAgents(board.owners, after.revealed, 'red')).toBe(8);
  });

  it('agentProgress reports found/total', () => {
    const p = agentProgress(start());
    expect(p.red).toEqual({ found: 0, total: 9 });
    expect(p.blue).toEqual({ found: 0, total: 8 });
  });
});

describe('newGame', () => {
  it('resets everything', () => {
    let s = guess(giveClue(start(), 'animal', 3), 24);
    expect(s.phase).toBe('gameOver');
    s = gameReducer(s, { type: 'newGame', board: fixedBoard() });
    expect(s).toEqual(createInitialState(fixedBoard()));
  });
});
