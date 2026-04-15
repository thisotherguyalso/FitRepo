import { StyleSheet, useColorScheme } from 'react-native'

export const LightColors = {
  background: '#f1f1f7',
  surface: '#fff',
  surfaceAlt: '#e5e5ea',
  panel: '#fff',
  panelAlt: '#e5e5ea',
  text: '#11181C',
  textMuted: '#6b6b6b',
  textSubtle: '#6b7280',
  textAccent: '#93c5fd',
  primary: '#3daace',
  secondary: 'rgb(105, 158, 219)',
  danger: 'rgb(241,106,111)',
  warning: '#f59e0b',
  signOut: '#a81a1a',
  active: '#3a3a3a',
  inactive: '#999999',
} as const

export const DarkColors = {
  background: '#0d0d12',
  surface: '#1a1a1a',
  surfaceAlt: '#2c2c2c',
  panel: '#1c1c1f',
  panelAlt: 'rgba(255, 255, 255, 0.1)',
  text: '#fff',
  textMuted: '#888',
  textSubtle: '#9ca3af',
  textAccent: '#93c5fd',
  primary: '#020975fb',
  secondary: 'rgb(30,133,247)',
  danger: 'rgb(241,106,111)',
  warning: '#f59e0b',
  signOut: '#7f1d1d',
  active: '#fff',
  inactive: '#6b6b6b',
} as const

// Keep AppColors as dark for static styles (StyleSheet.create)
export const AppColors = DarkColors

export function useAppColors() {
  const scheme = useColorScheme()
  return scheme === 'light' ? LightColors : DarkColors
}

export const AppRadius = {
  md: 12,
  lg: 16,
} as const

export const AppSpacing = {
  md: 16,
  lg: 18,
  xl: 20,
  page: 24,
} as const

export const sharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  screenContent: {
    flex: 1,
    padding: AppSpacing.page,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: AppColors.surface,
    padding: AppSpacing.xl,
    borderRadius: AppRadius.lg,
  },
  input: {
    backgroundColor: AppColors.surface,
    color: AppColors.text,
    borderRadius: AppRadius.md,
    padding: AppSpacing.md,
    fontSize: 16,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 200,
  },
  button: {
    borderRadius: AppRadius.md,
    padding: AppSpacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: AppColors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionTitle: {
    color: AppColors.text,
    fontWeight: '700',
  },
  mutedText: {
    color: AppColors.textMuted,
  },
  emptyText: {
    color: AppColors.textSubtle,
    fontSize: 16,
  },
})
