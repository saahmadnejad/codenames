import { randInt, shuffle } from './rng';
import { WORDS } from './words';

export type Team = 'red' | 'blue';

export type TileOwner = Team | 'neutral' | 'assassin';

export const GRID_SIZE = 25;

/**
 * The classic keycard distribution: the starting team has 9 agents, the
 * other team 8, plus 7 bystanders and 1 assassin.
 */
export const STARTING_TEAM_AGENTS = 9;
export const TRAILING_TEAM_AGENTS = 8;
export const BYSTANDERS = 7;

export interface Board {
  /** Exactly GRID_SIZE distinct words, in grid order. */
  words: string[];
  /** Parallel to words: who owns each tile before it is revealed. */
  owners: TileOwner[];
  /** The team that gives the first clue (and has 9 agents instead of 8). */
  startingTeam: Team;
}

/**
 * Generates a shuffled 25-word board with a random keycard.
 * The RNG is injectable so tests can make the board deterministic.
 */
export function generateBoard(
  rng: () => number = Math.random,
  wordPool: readonly string[] = WORDS,
): Board {
  if (wordPool.length < GRID_SIZE) {
    throw new Error(`Word pool needs at least ${GRID_SIZE} words`);
  }

  const startingTeam: Team = randInt(rng, 2) === 0 ? 'red' : 'blue';
  const otherTeam: Team = startingTeam === 'red' ? 'blue' : 'red';

  const owners = shuffle(
    [
      ...Array<TileOwner>(STARTING_TEAM_AGENTS).fill(startingTeam),
      ...Array<TileOwner>(TRAILING_TEAM_AGENTS).fill(otherTeam),
      ...Array<TileOwner>(BYSTANDERS).fill('neutral'),
      'assassin' as const,
    ],
    rng,
  );

  return {
    words: shuffle(wordPool, rng).slice(0, GRID_SIZE),
    owners,
    startingTeam,
  };
}
