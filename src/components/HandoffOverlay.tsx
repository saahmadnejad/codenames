import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { teamColor } from '../theme';
import { AppButton } from './AppButton';
import { Handoff, outcomeFeedback } from '../state/view';

export interface HandoffOverlayProps {
  handoff: Handoff;
  onReady: () => void;
}

/**
 * Full-screen interstitial shown whenever the device must change hands.
 * It covers the board completely so the next role never sees the old one's
 * information (the whole point of pass-and-play Codenames).
 */
export function HandoffOverlay({ handoff, onReady }: HandoffOverlayProps) {
  const { team, role, clue, lastGuess } = handoff;
  const color = teamColor(team);
  const isSpymaster = role === 'spymaster';

  return (
    <View style={[styles.overlay, { backgroundColor: color }]}>
      <View style={styles.content}>
        <Text style={styles.teamLabel}>{team.toUpperCase()} TEAM</Text>
        <Text style={styles.role}>{isSpymaster ? 'SPYMASTER' : 'FIELD AGENTS'}</Text>

        {lastGuess ? (
          <View style={styles.recap}>
            <Text style={styles.recapWord}>"{lastGuess.word}"</Text>
            <Text style={styles.recapOutcome}>
              {outcomeFeedback(lastGuess.outcome, lastGuess.by)}
            </Text>
          </View>
        ) : null}

        <Text style={styles.instruction}>
          {isSpymaster
            ? 'Pass the device to the ' +
              team +
              ' spymaster only. Field agents, look away!'
            : 'Pass the device to the ' + team + ' field agents.'}
        </Text>

        {clue ? (
          <View style={styles.clueBox}>
            <Text style={styles.clueLabel}>The clue is</Text>
            <Text style={styles.clueWord}>
              {clue.word} : {clue.number}
            </Text>
            <Text style={styles.clueHint}>
              You may make up to {clue.number + 1} guesses.
            </Text>
          </View>
        ) : isSpymaster ? (
          <Text style={styles.spymasterHint}>
            You see the key card. Give a one-word clue and a number — then hand
            the device over.
          </Text>
        ) : null}

        <View style={styles.buttonWrap}>
          <AppButton
            label={isSpymaster ? "I'm the spymaster" : "I'm a field agent"}
            bg="#fff"
            textColor={color}
            onPress={onReady}
          />
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  teamLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
  },
  role: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 4,
    textAlign: 'center',
  },
  recap: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 24,
    alignItems: 'center',
  },
  recapWord: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  recapOutcome: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    marginTop: 4,
    textAlign: 'center',
  },
  instruction: {
    color: '#fff',
    fontSize: 17,
    marginTop: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  clueBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  clueLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  clueWord: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 6,
  },
  clueHint: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 8,
  },
  spymasterHint: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonWrap: {
    marginTop: 28,
    width: '100%',
  },
});
