import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TileOwner } from '../game/board';
import { theme } from '../theme';

export interface WordCardProps {
  word: string;
  owner: TileOwner;
  revealed: boolean;
  /** Spymaster view (or game over): face-down cards show their owner. */
  showKey: boolean;
  /** Game-over reveal: render every card as if it had been guessed. */
  revealAll?: boolean;
  /** Whether the card can be tapped (field team, guessing phase). */
  tappable?: boolean;
  onPress?: () => void;
}

const CAPTIONS: Record<TileOwner, string> = {
  red: 'RED',
  blue: 'BLUE',
  neutral: 'CIVILIAN',
  assassin: 'ASSASSIN',
};

interface Look {
  bg: string;
  word: string;
  border: string;
  caption: string;
}

function faceDown(): Look {
  return {
    bg: theme.colors.cardFace,
    word: theme.colors.cardFaceText,
    border: '#d3c08d',
    caption: 'transparent',
  };
}

function solid(owner: TileOwner): Look {
  switch (owner) {
    case 'red':
      return { bg: theme.colors.red, word: '#fff', border: theme.colors.red, caption: 'rgba(255,255,255,0.9)' };
    case 'blue':
      return { bg: theme.colors.blue, word: '#fff', border: theme.colors.blue, caption: 'rgba(255,255,255,0.9)' };
    case 'assassin':
      return { bg: theme.colors.assassin, word: theme.colors.assassinText, border: theme.colors.assassin, caption: 'rgba(255,255,255,0.75)' };
    default:
      return { bg: theme.colors.bystander, word: theme.colors.cardFaceText, border: '#c4b077', caption: '#7a6a4f' };
  }
}

function tinted(owner: TileOwner): Look {
  switch (owner) {
    case 'red':
      return { bg: theme.colors.redSoft, word: theme.colors.cardFaceText, border: theme.colors.red, caption: theme.colors.red };
    case 'blue':
      return { bg: theme.colors.blueSoft, word: theme.colors.cardFaceText, border: theme.colors.blue, caption: theme.colors.blue };
    case 'assassin':
      return { bg: '#e5e5e5', word: theme.colors.cardFaceText, border: theme.colors.assassin, caption: theme.colors.assassin };
    default:
      return { bg: '#efe7d2', word: theme.colors.cardFaceText, border: '#b9a677', caption: '#8a7a63' };
  }
}

export function WordCard({
  word,
  owner,
  revealed,
  showKey,
  revealAll = false,
  tappable = false,
  onPress,
}: WordCardProps) {
  const isOpen = revealed || revealAll;
  const look = isOpen ? solid(owner) : showKey ? tinted(owner) : faceDown();
  const caption = isOpen || showKey ? CAPTIONS[owner] : null;

  return (
    <Pressable
      onPress={tappable && !isOpen ? onPress : undefined}
      disabled={!tappable || isOpen}
      accessibilityRole={tappable && !isOpen ? 'button' : undefined}
      accessibilityLabel={`${word}${caption ? `, ${caption.toLowerCase()}` : ''}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: look.bg,
          borderColor: look.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View style={styles.wordWrap}>
        <Text
          style={[styles.word, { color: look.word }]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {word}
        </Text>
      </View>
      {caption ? (
        <Text style={[styles.caption, { color: look.caption }]}>{caption}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 2.5,
    borderWidth: 1.5,
    borderRadius: theme.radius.card,
    paddingHorizontal: 3,
    paddingVertical: 4,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  wordWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 1,
  },
  word: {
    fontSize: theme.fontSize.word,
    fontWeight: '700',
    textAlign: 'center',
  },
  caption: {
    fontSize: theme.fontSize.caption,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.4,
    marginTop: 1,
  },
});
