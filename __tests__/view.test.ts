import { Board, TileOwner } from '../src/game/board';
import { createInitialState, gameReducer, GameState } from '../src/state/gameReducer';
import { handoffFor, outcomeFeedback, viewToken } from '../src/state/view';

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

describe('viewToken', () => {
  it('flags a handoff at start and after every turn, but not between guesses', () => {
    let s = start();
    expect(viewToken(s)).toBe('clue:red:0');

    // Spymaster gives a clue — device must go to the field team.
    s = gameReducer(s, { type: 'giveClue', word: 'animal', number: 3 });
    expect(viewToken(s)).toBe('guessing:red:0');

    // Correct guess: same team keeps guessing, no handoff.
    s = gameReducer(s, { type: 'guess', index: 0 });
    expect(viewToken(s)).toBe('guessing:red:0');

    // Bystander ends the turn — hand off to the blue spymaster.
    s = gameReducer(s, { type: 'guess', index: 17 });
    expect(viewToken(s)).toBe('clue:blue:1');
  });

  it('is null at game over so no handoff screen shows', () => {
    let s = gameReducer(start(), { type: 'giveClue', word: 'animal', number: 3 });
    s = gameReducer(s, { type: 'guess', index: 24 }); // assassin
    expect(viewToken(s)).toBeNull();
  });
});

describe('handoffFor', () => {
  it('sends the clue along to the field team', () => {
    const s = gameReducer(start(), { type: 'giveClue', word: 'animal', number: 2 });
    const h = handoffFor(s);
    expect(h.team).toBe('red');
    expect(h.role).toBe('field');
    expect(h.clue).toEqual({ word: 'animal', number: 2, team: 'red' });
    expect(h.lastGuess).toBeNull();
  });

  it('recaps the last guess when handing to the next spymaster', () => {
    let s = gameReducer(start(), { type: 'giveClue', word: 'animal', number: 3 });
    s = gameReducer(s, { type: 'guess', index: 9 }); // blue agent — red's turn ends
    const h = handoffFor(s);
    expect(h.team).toBe('blue');
    expect(h.role).toBe('spymaster');
    expect(h.clue).toBeNull();
    expect(h.lastGuess).toEqual({ word: 'word9', outcome: 'enemy', by: 'red' });
  });
});

describe('outcomeFeedback', () => {
  it('names the right teams for enemy hits', () => {
    expect(outcomeFeedback('enemy', 'red')).toContain('blue');
    expect(outcomeFeedback('enemy', 'blue')).toContain('red');
    expect(outcomeFeedback('agent', 'red')).toContain("red's");
    expect(outcomeFeedback('assassin', 'blue')).toMatch(/loss/i);
    expect(outcomeFeedback('bystander', 'red')).toMatch(/bystander/i);
  });
});
