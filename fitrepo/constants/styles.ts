import { StyleSheet } from 'react-native'

export const AppColors = {
  background: '#0f0f0f',
  surface: '#1a1a1a',
  surfaceAlt: '#232323',
  panel: '#111827',
  panelAlt: '#0f172a',
  text: '#fff',
  textMuted: '#888',
  textSubtle: '#9ca3af',
  textAccent: '#93c5fd',
  primary: '#0a7ea4',
  primaryDark: 'rgb(0,65,90)',
  secondary: 'rgb(30,133,247)',
  danger: 'rgb(241,106,111)',
  warning: '#f59e0b',
} as const

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
