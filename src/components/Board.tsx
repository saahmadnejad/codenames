import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { WordCard } from './WordCard';

export interface BoardProps {
  words: string[];
  owners: readonly (string | null)[];
  revealed: readonly boolean[];
  showKey: boolean;
  revealAll?: boolean;
  tappable?: boolean;
  onWordPress?: (index: number) => void;
  /** Grid aspect: cards are slightly wider than tall, like the physical game. */
  gap?: number;
}

export function Board({
  words,
  owners,
  revealed,
  showKey,
  revealAll = false,
  tappable = false,
  onWordPress,
  gap = 6,
}: BoardProps) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - gap * 4) / 5;

  const rows: number[][] = [];
  for (let i = 0; i < 25; i += 5) {
    rows.push([i, i + 1, i + 2, i + 3, i + 4]);
  }

  return (
    <View style={styles.board}>
      {rows.map(row => (
        <View key={row[0]} style={[styles.row, { height: cardWidth * 0.72 }]}>
          {row.map(i => (
            <View key={i} style={{ width: cardWidth }}>
              <WordCard
                word={words[i]}
                owner={owners[i] as never}
                revealed={revealed[i]}
                showKey={showKey}
                revealAll={revealAll}
                tappable={tappable}
                onPress={() => onWordPress?.(i)}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
});
