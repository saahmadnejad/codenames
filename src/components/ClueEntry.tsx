import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Team } from '../game/board';
import { theme, teamColor } from '../theme';
import { AppButton } from './AppButton';

export interface ClueEntryProps {
  team: Team;
  /** Max allowed number (unrevealed tiles left). */
  maxNumber: number;
  validate: (word: string, number: number) => string | null;
  onSubmit: (word: string, number: number) => void;
}
export function ClueEntry({ team, maxNumber, validate, onSubmit }: ClueEntryProps) {
  const [word, setWord] = useState('');
  const [number, setNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const color = teamColor(team);

  const submit = () => {
    const err = validate(word, number);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onSubmit(word.trim(), number);
    setWord('');
    setNumber(1);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.wrap}
    >
      <Text style={[styles.title, { color }]}>
        {team.toUpperCase()} spymaster: give a clue
      </Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={word}
          onChangeText={t => {
            setWord(t);
            if (error) {
              setError(null);
            }
          }}
          placeholder="One word only…"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepButton}
            onPress={() => setNumber(n => Math.max(1, n - 1))}
            accessibilityLabel="Decrease number"
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>{number}</Text>
          <Pressable
            style={styles.stepButton}
            onPress={() => setNumber(n => Math.min(maxNumber, n + 1))}
            accessibilityLabel="Increase number"
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton label="Give clue" bg={color} onPress={submit} />
      <Text style={styles.hint}>
        Your team may guess up to {number + 1} words ({number} + 1).
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
  },
  stepButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stepText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  stepValue: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
  },
  error: {
    fontSize: 13,
    color: theme.colors.error,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
