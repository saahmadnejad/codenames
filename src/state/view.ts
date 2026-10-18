import { Team } from '../game/board';
import { Clue, GameState, GuessOutcome, otherTeam } from './gameReducer';

export type HandoffRole = 'spymaster' | 'field';

/**
 * What the pass-and-play "pass the device" screen must show, derived
 * purely from game state so the UI can't get out of sync.
 */
export interface Handoff {
  team: Team;
  role: HandoffRole;
  /** The clue to display when handing off to the field operatives. */
  clue: Clue | null;
  /** Result of the last guess, shown when a turn just ended. */
  lastGuess: { word: string; outcome: GuessOutcome; by: Team } | null;
}

/**
 * A token identifying the current "screen" of the handoff dance:
 * which team, which role, which turn. It changes exactly when the
 * device must change hands (or null at game over). Stable across
 * ordinary guesses so the field team is never interrupted mid-turn.
 */
export function viewToken(state: GameState): string | null {
  if (state.phase === 'gameOver') {
    return null;
  }
  return `${state.phase}:${state.currentTeam}:${state.turnsTaken}`;
}

export function handoffFor(state: GameState): Handoff {
  const role: HandoffRole = state.phase === 'guessing' ? 'field' : 'spymaster';
  return {
    team: state.currentTeam,
    role,
    clue: role === 'field' ? state.clue : null,
    lastGuess:
      role === 'spymaster' && state.lastGuess
        ? {
            word: state.board.words[state.lastGuess.index],
            outcome: state.lastGuess.outcome,
            by: state.lastGuess.by,
          }
        : null,
  };
}

export function outcomeFeedback(outcome: GuessOutcome, guesser: Team): string {
  switch (outcome) {
    case 'agent':
      return `One of ${guesser}'s agents!`;
    case 'bystander':
      return 'An innocent bystander — the turn ends.';
    case 'enemy':
      return `That was ${otherTeam(guesser)}'s agent — the turn ends.`;
    case 'assassin':
      return 'The assassin! Instant loss.';
  }
}
