import { StyleSheet, useColorScheme } from 'react-native'

export const LightColors = {
  primary: '#1e85f7',
  secondary: '#021327',
  
  background: '#f5f5f8',

  surface: '#fff',
  surfaceAlt: '#e5e5ea',

  panel: '#fff',
  panelAlt: '#e5e5ea',

  text: '#273035',
  textMuted: '#6b6b6b',
  textSubtle: '#6b7280',
  textAccent: '#93c5fd',
  textChatbotTitle: 'rgb(30,133,247)',
  textChatbot: '',
  
  danger: 'rgb(241,106,111)',
  warning: '#f59e0b',

  signOut: '#a81a1a',

  active: '#3a3a3a',
  inactive: '#999',

  accent1: '#5a8b5a',
  accent1Alt: '#99cc99',
  accent1Border: '#aad3aa',

  accent2: '#8b6e5a',
  accent2Alt: '#ccc099',
  accent2Border: '#d3c0aa',

  mode: 'light'
} as const

export const DarkColors = {
  primary: '#020975fb',
  secondary: '#1e85f7',

  background: '#0d0d12',

  surface: '#1a1a1a',
  surfaceAlt: '#2c2c2c',

  panel: '#1c1c1f',
  panelAlt: 'rgba(255, 255, 255, 0.1)',

  text: '#fff',
  textMuted: '#888',
  textSubtle: '#9ca3af',
  textAccent: '#93c5fd',
  textChatbotTitle: '#1e85f7',
  textChatbot: '#fff',

  danger: 'rgb(241,106,111)',
  warning: '#f59e0b',
  
  signOut: '#7f1d1d',
  
  active: '#fff',
  inactive: '#6b6b6b',
  
  accent1: '#1a2e1a',
  accent1Alt: '#2d4a2d',
  accent1Border: '#507750',

  accent2: '#493020',
  accent2Alt: '#684e27',
  accent2Border: '#8f6e49',

  mode: 'dark'
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
