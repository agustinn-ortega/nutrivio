export const colors = {
  bg: {
    primary: '#0B0D12',
    secondary: '#10131A',
    tertiary: '#151820',
  },
  surface: {
    base: '#1A1D28',
    elevated: '#1F2330',
    hover: '#252938',
  },
  border: {
    subtle: '#2A2D3A',
    medium: '#353848',
    strong: '#454860',
  },
  text: {
    primary: '#F0F0F5',
    secondary: '#8B8FA3',
    tertiary: '#5D6175',
    inverse: '#0B0D12',
  },
  accent: {
    primary: '#00D4AA',
    primaryMuted: 'rgba(0, 212, 170, 0.15)',
    secondary: '#7B61FF',
    secondaryMuted: 'rgba(123, 97, 255, 0.15)',
  },
  semantic: {
    success: '#34D399',
    successMuted: 'rgba(52, 211, 153, 0.15)',
    warning: '#FBBF24',
    warningMuted: 'rgba(251, 191, 36, 0.15)',
    error: '#F87171',
    errorMuted: 'rgba(248, 113, 113, 0.15)',
    info: '#60A5FA',
    infoMuted: 'rgba(96, 165, 250, 0.15)',
  },
  macro: {
    carbs: '#60A5FA',
    carbsMuted: 'rgba(96, 165, 250, 0.15)',
    protein: '#A78BFA',
    proteinMuted: 'rgba(167, 139, 250, 0.15)',
    fat: '#FBBF24',
    fatMuted: 'rgba(251, 191, 36, 0.15)',
    calories: '#00D4AA',
    caloriesMuted: 'rgba(0, 212, 170, 0.15)',
  },
  gradient: {
    premium: ['#7B61FF', '#00D4AA'] as const,
    accent: ['#00D4AA', '#00B4D8'] as const,
    surface: ['#1A1D28', '#151820'] as const,
  },
} as const;

export type Colors = typeof colors;
