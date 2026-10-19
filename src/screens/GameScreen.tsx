import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useReducer, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../components/AppButton';
import { Board } from '../components/Board';
import { ClueEntry } from '../components/ClueEntry';
import { GameOverScreen } from '../components/GameOverScreen';
import { HandoffOverlay } from '../components/HandoffOverlay';
import { TurnHeader } from '../components/TurnHeader';
import { generateBoard } from '../game/board';
import {
  agentProgress,
  createInitialState,
  gameReducer,
  MAX_TURNS,
  validateClue,
} from '../state/gameReducer';
import { handoffFor, outcomeFeedback, viewToken } from '../state/view';
import { theme, teamColor } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export function GameScreen({ navigation }: Props) {
  const [game, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialState(generateBoard()),
  );

  // The handoff overlay stays up until the arriving role acknowledges it,
  // so the previous role's information is never shown to the wrong team.
  const token = viewToken(game);
  const [confirmedToken, setConfirmedToken] = useState<string | null>(null);
  const needsHandoff = token !== null && token !== confirmedToken;

  const progress = agentProgress(game);
  const maxNumber = game.revealed.filter(r => !r).length;

  const startNewGame = () => {
    dispatch({ type: 'newGame', board: generateBoard() });
    setConfirmedToken(null);
  };

  if (game.phase === 'gameOver' && game.winner !== null && game.winReason !== null) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <Board
            words={game.board.words}
            owners={game.board.owners}
            revealed={game.revealed}
            showKey
            revealAll
          />
          <GameOverScreen
            winner={game.winner}
            winReason={game.winReason}
            turnsTaken={game.turnsTaken}
            onRematch={startNewGame}
            onExit={() => navigation.navigate('Home')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <TurnHeader
          currentTeam={game.currentTeam}
          progress={progress}
          turnsTaken={game.turnsTaken}
          maxTurns={MAX_TURNS}
          phase={game.phase === 'guessing' ? 'guessing' : 'clue'}
        />

        <Board
          words={game.board.words}
          owners={game.board.owners}
          revealed={game.revealed}
          showKey={!needsHandoff && game.phase === 'clue'}
          tappable={!needsHandoff && game.phase === 'guessing'}
          onWordPress={index => dispatch({ type: 'guess', index })}
        />

        <View style={styles.footer}>
          {game.phase === 'guessing' && game.clue ? (
            <View style={styles.guessPanel}>
              <View style={styles.clueRow}>
                <Text style={[styles.clueWord, { color: teamColor(game.clue.team) }]}>
                  {game.clue.word} : {game.clue.number}
                </Text>
                <Text style={styles.guessesLeft}>
                  {game.guessesLeft} {game.guessesLeft === 1 ? 'guess' : 'guesses'} left
                </Text>
              </View>
              {game.lastGuess ? (
                <Text style={styles.feedback}>
                  “{game.board.words[game.lastGuess.index]}” —{' '}
                  {outcomeFeedback(game.lastGuess.outcome, game.lastGuess.by)}
                </Text>
              ) : null}
              <AppButton
                label="End turn"
                bg={theme.colors.text}
                outline
                onPress={() => dispatch({ type: 'endTurn' })}
              />
            </View>
          ) : game.phase === 'clue' ? (
            <ClueEntry
              team={game.currentTeam}
              maxNumber={maxNumber}
              validate={(word, number) => validateClue(game, word, number)}
              onSubmit={(word, number) => dispatch({ type: 'giveClue', word, number })}
            />
          ) : null}
        </View>

        {needsHandoff && token !== null ? (
          <HandoffOverlay handoff={handoffFor(game)} onReady={() => setConfirmedToken(token)} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  footer: {
    padding: 12,
    gap: 8,
  },
  guessPanel: {
    gap: 8,
  },
  clueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  clueWord: {
    fontSize: theme.fontSize.clue + 4,
    fontWeight: '900',
  },
  guessesLeft: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  feedback: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
