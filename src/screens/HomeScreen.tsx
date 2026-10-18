import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../components/AppButton';
import { theme } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            CODE<Text style={styles.titleAccent}>NAMES</Text>
          </Text>
          <Text style={styles.subtitle}>
            One word clues. Two teams. One assassin.
          </Text>
        </View>

        <View style={styles.rules}>
          <Text style={styles.rule}>
            🕵️ <Text style={styles.ruleTeam}>Spymasters</Text> give a one-word
            clue plus a number.
          </Text>
          <Text style={styles.rule}>
            👥 <Text style={styles.ruleTeam}>Field agents</Text> tap the words
            they think it points to.
          </Text>
          <Text style={styles.rule}>
            💀 Tap the <Text style={styles.assassin}>assassin</Text> and your
            team loses instantly.
          </Text>
        </View>

        <View style={styles.buttons}>
          <AppButton label="New game" bg={theme.colors.red} onPress={() => navigation.navigate('Game')} />
          <Text style={styles.footer}>
            Pass the device between roles each turn.
          </Text>
        </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 2,
    color: theme.colors.text,
  },
  titleAccent: {
    color: theme.colors.blue,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textMuted,
    marginTop: 10,
    textAlign: 'center',
  },
  rules: {
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
  },
  rule: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
  },
  ruleTeam: {
    fontWeight: '700',
  },
  assassin: {
    fontWeight: '700',
    color: theme.colors.assassin,
  },
  buttons: {
    gap: 12,
  },
  footer: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
