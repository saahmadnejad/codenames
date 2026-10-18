# Codenames

Pass-and-play digital version of the classic word-association party game, built with React Native (bare CLI) + TypeScript.

Two teams — **Red** and **Blue** — race to identify their secret agents using one-word clues. Each team has a **spymaster** (who sees the key card) and **field agents** (who tap words on the board). The lone **assassin** ends the game instantly for whoever touches it.

## How play works on one device

The app is built around secure handoffs between roles. A full-screen overlay covers the board whenever the device changes hands, so no role ever sees another's information:

1. **Handoff → Red spymaster**: overlay covers everything, spymaster taps *"I'm the spymaster"*.
2. **Clue phase**: spymaster sees the board with owner colors revealed, enters a one-word clue + number.
3. **Handoff → Red field agents**: overlay shows the clue (`animal : 3`) and guesses allowed (`3 + 1`).
4. **Guessing phase**: board hides owner colors; agents tap words. Turn ends on a bystander, enemy agent, spent guesses, or voluntary *"End turn"*.
5. **Handoff → Blue spymaster**: overlay recaps the previous guess (`"bank" — That was red's agent`).
6. Repeat until someone wins, or 40 turns produce a draw.

## Rules implemented

- Classic keycard: **9** agents for the starting team, **8** for the other, **7** bystanders, **1** assassin.
- Guess limit is **clue number + 1**; correct guesses keep the turn alive.
- Bystander or enemy agent → turn ends (enemy agent counts for its team).
- Assassin → instant loss for the guessing team.
- First team to reveal all their agents wins — including when the *other* team reveals their last one by accident.
- 40 turns → draw.
- Clue validation: one word, not on the board, never repeated, number ≤ tiles still face down.

## Architecture

```
src/
  game/          Pure game domain — no React, fully unit-tested
    board.ts       keycard generation (injectable RNG, optional forced starter)
    words.ts       200+ word list
    rng.ts         seeded PRNG (mulberry32) for reproducible boards
  state/
    gameReducer.ts game state machine (clue → guessing → turn/end/win)
    view.ts        derives the pass-and-play handoff from state (tokens)
  components/     Board, WordCard, ClueEntry, HandoffOverlay, TurnHeader, GameOverScreen
  screens/        HomeScreen, GameScreen
  theme.ts        kraft-paper palette, team colors
__tests__/       board, gameReducer, view suites (34 tests)
```

The reducer and view layers are pure functions, so all game logic is testable without rendering anything.

## Development

```bash
npm install
npm test          # jest
npm run lint      # eslint
npx tsc --noEmit  # type check
npx react-native run-android
```

If port 8081 is taken by another project's Metro, use `npx react-native start --port 8083` and `npx react-native run-android --port 8083`.

## Conventions

- Conventional Commits enforced via husky + commitlint (`feat:`, `fix:`, `chore:`…).
- Pre-commit hook runs `npm run lint`.
