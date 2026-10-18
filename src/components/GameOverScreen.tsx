import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Team } from '../game/board';
import { WinReason, Winner } from '../state/gameReducer';
import { theme, teamColor } from '../theme';
import { AppButton } from './AppButton';

export interface GameOverScreenProps {
  winner: Winner;
  winReason: WinReason;
  turnsTaken: number;
  onRematch: () => void;
  onExit: () => void;
}

const REASONS: Record<WinReason, (w: Winner) => string> = {
  agents: w => `${String(w).toUpperCase()} found all of their agents!`,
  assassin: w => `${String(w).toUpperCase()} wins — the assassin was found!`,
  timeout: () => `Time's up after 40 turns — it's a draw.`,
};

export function GameOverScreen({
  winner,
  winReason,
  turnsTaken,
  onRematch,
  onExit,
}: GameOverScreenProps) {
  const isDraw = winner === 'draw';
  const color = isDraw ? theme.colors.textMuted : teamColor(winner as Team);

  return (
    <View style={styles.overlay}>
      <View style={[styles.card, { borderColor: color }]}>
        <Text style={[styles.title, { color }]}>
          {isDraw ? 'DRAW' : `${String(winner).toUpperCase()} WINS`}
        </Text>
        <Text style={styles.reason}>{REASONS[winReason](winner)}</Text>
        <Text style={styles.meta}>
          Game lasted {turnsTaken} {turnsTaken === 1 ? 'turn' : 'turns'}
        </Text>

        <View style={styles.buttons}>
          <AppButton label="Rematch" bg={color} onPress={onRematch} />
          <AppButton label="Main menu" bg={theme.colors.text} outline onPress={onExit} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 3,
    padding: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 1,
  },
  reason: {
    fontSize: 17,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  meta: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  buttons: {
    marginTop: 24,
    width: '100%',
    gap: 10,
  },
});
