import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Team } from '../game/board';
import { theme, teamColor } from '../theme';

export interface TurnHeaderProps {
  currentTeam: Team;
  progress: Record<Team, { found: number; total: number }>;
  turnsTaken: number;
  maxTurns: number;
}

function TeamBadge({
  team,
  found,
  total,
  active,
}: {
  team: Team;
  found: number;
  total: number;
  active: boolean;
}) {
  const color = teamColor(team);
  return (
    <View
      style={[
        styles.badge,
        { borderColor: color, backgroundColor: active ? color : 'transparent' },
      ]}
    >
      <Text style={[styles.badgeTeam, { color: active ? '#fff' : color }]}>
        {team.toUpperCase()}
      </Text>
      <Text style={[styles.badgeScore, { color: active ? '#fff' : theme.colors.text }]}>
        {found}/{total}
      </Text>
    </View>
  );
}

export function TurnHeader({ currentTeam, progress, turnsTaken, maxTurns }: TurnHeaderProps) {
  return (
    <View style={styles.row}>
      <TeamBadge
        team="red"
        found={progress.red.found}
        total={progress.red.total}
        active={currentTeam === 'red'}
      />
      <View style={styles.turnWrap}>
        <Text style={styles.turnLabel}>
          {turnsTaken}/{maxTurns} turns
        </Text>
        <Text style={[styles.turnTeam, { color: teamColor(currentTeam) }]}>
          {currentTeam.toUpperCase()} to clue
        </Text>
      </View>
      <TeamBadge
        team="blue"
        found={progress.blue.found}
        total={progress.blue.total}
        active={currentTeam === 'blue'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 6,
  },
  badgeTeam: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeScore: {
    fontSize: 13,
    fontWeight: '700',
  },
  turnWrap: {
    alignItems: 'center',
  },
  turnLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  turnTeam: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
