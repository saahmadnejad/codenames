import { generateBoard, GRID_SIZE, TileOwner } from '../src/game/board';
import { mulberry32 } from '../src/game/rng';
import { WORDS } from '../src/game/words';

describe('word list', () => {
  it('contains at least 200 unique words', () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(200);
    expect(new Set(WORDS).size).toBe(WORDS.length);
  });

  it('has single lowercase words only', () => {
    for (const w of WORDS) {
      expect(w).toMatch(/^[a-z]+$/);
    }
  });
});

describe('generateBoard', () => {
  it('produces 25 distinct words drawn from the pool', () => {
    const board = generateBoard(mulberry32(1));
    expect(board.words).toHaveLength(GRID_SIZE);
    expect(new Set(board.words).size).toBe(GRID_SIZE);
    for (const w of board.words) {
      expect(WORDS).toContain(w);
    }
  });

  it('deals exactly 9/8/7/1 agents, bystanders, assassin', () => {
    const counts: Record<TileOwner, number> = {
      red: 0,
      blue: 0,
      neutral: 0,
      assassin: 0,
    };
    for (const owner of generateBoard(mulberry32(42)).owners) {
      counts[owner]++;
    }
    expect(counts.assassin).toBe(1);
    expect(counts.neutral).toBe(7);
    // The starting team always holds 9, the other 8.
    expect(Math.max(counts.red, counts.blue)).toBe(9);
    expect(Math.min(counts.red, counts.blue)).toBe(8);
    expect(counts.red + counts.blue + counts.neutral + counts.assassin).toBe(GRID_SIZE);
  });

  it('is deterministic for a given seed', () => {
    const a = generateBoard(mulberry32(7));
    const b = generateBoard(mulberry32(7));
    expect(a).toEqual(b);
  });

  it('assigns 9 agents to whichever team starts', () => {
    for (let seed = 0; seed < 20; seed++) {
      const board = generateBoard(mulberry32(seed));
      const count = (team: string) =>
        board.owners.filter(o => o === (team as TileOwner)).length;
      expect(count(board.startingTeam)).toBe(9);
      expect(count(board.startingTeam === 'red' ? 'blue' : 'red')).toBe(8);
    }
  });

  it('throws when the word pool is too small', () => {
    expect(() => generateBoard(mulberry32(1), ['a', 'b'])).toThrow();
  });
});
