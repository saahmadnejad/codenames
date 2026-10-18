/**
 * Codenames palette — kraft-paper table, team-colored cards.
 */
export const theme = {
  colors: {
    background: '#f2e9d8',
    surface: '#fffaf0',
    border: '#c9bda3',
    text: '#2f2519',
    textMuted: '#8a7a63',
    error: '#b91c1c',
    errorSoft: '#fee2e2',

    // Cards
    cardFace: '#e9d9ae', // face-down kraft card
    cardFaceText: '#3a2f1d',
    bystander: '#d8c795', // revealed innocent civilian

    // Teams
    red: '#c62828',
    redSoft: '#f3d9d9',
    blue: '#1565c0',
    blueSoft: '#d7e5f7',
    assassin: '#1c1c1c',
    assassinText: '#f5f5f5',
  },
  fontSize: {
    word: 13,
    caption: 9,
    clue: 18,
  },
  radius: {
    card: 6,
    button: 12,
  },
} as const;

export function teamColor(team: 'red' | 'blue'): string {
  return team === 'red' ? theme.colors.red : theme.colors.blue;
}
