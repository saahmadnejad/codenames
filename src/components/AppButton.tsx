import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  /** Solid background colour. Ignored when `outline` is set. */
  bg?: string;
  textColor?: string;
  outline?: boolean;
  disabled?: boolean;
}

export function AppButton({
  label,
  onPress,
  bg = theme.colors.text,
  textColor = '#fff',
  outline = false,
  disabled = false,
}: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        outline
          ? { backgroundColor: 'transparent', borderColor: bg, borderWidth: 2 }
          : { backgroundColor: bg },
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.4 },
      ]}
    >
      <Text style={[styles.label, { color: outline ? bg : textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.button,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
