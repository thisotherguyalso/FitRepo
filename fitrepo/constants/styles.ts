import { StyleSheet, useColorScheme } from 'react-native'

export const LightColors = {
  background: '#f2f2f7',
  surface: '#ffffff',
  surfaceAlt: '#e5e5ea',
  panel: '#f2f2f7',
  panelAlt: '#e5e5ea',
  text: '#11181C',
  textMuted: '#6b6b6b',
  textSubtle: '#6b7280',
  textAccent: '#0a7ea4',
  primary: '#0a7ea4',
  secondary: 'rgb(30,133,247)',
  danger: 'rgb(241,106,111)',
  warning: '#f59e0b',
  signOut: '#a81a1a',
} as const

export const DarkColors = {
  background: '#0d0d12',
  surface: '#1a1a1a',
  surfaceAlt: '#232323',
  panel: '#111827',
  panelAlt: '#0f172a',
  text: '#fff',
  textMuted: '#888',
  textSubtle: '#9ca3af',
  textAccent: '#93c5fd',
  primary: '#020975fb',
  secondary: 'rgb(30,133,247)',
  danger: 'rgb(241,106,111)',
  warning: '#f59e0b',
  signOut: '#7f1d1d',
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
