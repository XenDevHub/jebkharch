// Design tokens — Neon Obsidian theme
export const colors = {
  // Core backgrounds
  background: '#070d1a',
  surface: '#0d1526',
  surfaceElevated: '#111d33',

  // Brand
  primary: '#00e5a0',       // Neon Emerald
  primaryDim: '#00b87d',    // Dimmed primary for gradients
  primaryGlow: '#00e5a020', // Glow overlay
  onPrimary: '#002a1e',

  secondary: '#fbbf24',     // Warm Gold
  secondaryDim: '#d97706',
  secondaryGlow: '#fbbf2420',
  onSecondary: '#3b1a00',

  // Surface variants
  surfaceVariant: '#1a2540',
  surfaceCard: '#0f1a2e',
  onSurface: '#e2eaff',
  onSurfaceVariant: '#8899bb',
  onSurfaceMuted: '#4a5568',

  // Semantic
  error: '#ff5757',
  errorGlow: '#ff575720',
  success: '#00e5a0',
  warning: '#fbbf24',

  // Misc
  white: '#ffffff',
  neonBorder: '#00e5a040',
  glassBorder: '#ffffff10',
  glassBorderBright: '#ffffff20',

  // Podium colors
  gold: '#fbbf24',
  silver: '#94a3b8',
  bronze: '#c07c3a',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  container: 20,
};

export const typography = {
  displayLg: { fontFamily: 'Sora_700Bold', fontSize: 40, fontWeight: '700' as const, lineHeight: 48 },
  displayMd: { fontFamily: 'Sora_700Bold', fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  headlineMd: { fontFamily: 'Sora_600SemiBold', fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  headlineSm: { fontFamily: 'Sora_600SemiBold', fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  bodyLg: { fontFamily: 'Inter_400Regular', fontSize: 18, fontWeight: '400' as const, lineHeight: 28 },
  bodyMd: { fontFamily: 'Inter_400Regular', fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  labelMd: { fontFamily: 'Inter_600SemiBold', fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  labelSm: { fontFamily: 'Inter_600SemiBold', fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

export const shadows = {
  neonGreen: {
    shadowColor: '#00e5a0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  neonGold: {
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};
