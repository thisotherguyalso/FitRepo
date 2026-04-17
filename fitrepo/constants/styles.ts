import { StyleSheet, useColorScheme } from 'react-native'

export const LightColors = {
  primary: '#0B3D91',
  secondary: '#153E75',

  background: '#F5F2EA',
  backgroundAlt: '#ECE7DB',
  backgroundStrong: '#D7C6A0',

  surface: '#FFFCF6',
  surfaceAlt: '#F2ECE0',
  surfaceStrong: '#E5D7BD',

  panel: '#FFFFFF',
  panelAlt: 'rgba(11, 61, 145, 0.08)',
  panelStrong: 'rgba(199, 166, 88, 0.18)',
  border: 'rgba(16, 44, 88, 0.12)',
  borderStrong: 'rgba(199, 166, 88, 0.34)',

  text: '#10224A',
  textMuted: '#5F6D85',
  textSubtle: '#8793A8',
  textAccent: '#0B3D91',
  textAccent2: '#FFF6DF',
  textChatbotTitle: '#0B3D91',
  textChatbot: '#10224A',

  danger: '#D14B3E',
  warning: '#B9861E',
  success: '#1F9A70',

  signOut: '#31415F',

  active: '#0B3D91',
  inactive: '#7987A0',

  accent1: '#DDF2E6',
  accent1Alt: '#ECF8F0',
  accent1Border: '#7BC69A',

  accent2: '#F4E7BE',
  accent2Alt: '#FBF4DB',
  accent2Border: '#C7A658',

  tabBar: 'rgba(255, 252, 246, 0.94)',
  shadow: 'rgba(14, 32, 64, 0.16)',
  overlay: 'rgba(11, 61, 145, 0.05)',

  mode: 'light',
} as const

export const DarkColors = {
  primary: '#1E5CC6',
  secondary: '#0F274F',

  background: '#071122',
  backgroundAlt: '#0C1B35',
  backgroundStrong: '#17356A',

  surface: '#0F1B31',
  surfaceAlt: '#152542',
  surfaceStrong: '#1A325E',

  panel: '#0B162A',
  panelAlt: 'rgba(255, 255, 255, 0.08)',
  panelStrong: 'rgba(199, 166, 88, 0.22)',
  border: 'rgba(221, 231, 255, 0.1)',
  borderStrong: 'rgba(199, 166, 88, 0.42)',

  text: '#F7F6F1',
  textMuted: '#A5B3C8',
  textSubtle: '#7487A7',
  textAccent: '#D6BB77',
  textAccent2: '#FFF4D6',
  textChatbotTitle: '#D6BB77',
  textChatbot: '#F7F6F1',

  danger: '#F06A5B',
  warning: '#F2B544',
  success: '#49C58A',

  signOut: '#3B2C33',

  active: '#F7F6F1',
  inactive: '#6E84A8',

  accent1: '#173126',
  accent1Alt: '#1E4132',
  accent1Border: '#45B37A',

  accent2: '#3E3218',
  accent2Alt: '#53431E',
  accent2Border: '#C7A658',

  tabBar: 'rgba(8, 18, 35, 0.9)',
  shadow: 'rgba(0, 0, 0, 0.38)',
  overlay: 'rgba(214, 187, 119, 0.06)',

  mode: 'dark',
} as const

export const AppColors = DarkColors

export function useAppColors() {
  const scheme = useColorScheme()
  return scheme === 'light' ? LightColors : DarkColors
}

export const AppRadius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const

export const AppSpacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
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
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  input: {
    backgroundColor: AppColors.surfaceAlt,
    color: AppColors.text,
    borderRadius: AppRadius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: 15,
    fontSize: 16,
  },
  background: {
    position: 'absolute',
    left: -40,
    right: -40,
    top: -10,
    height: 260,
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
  },
  button: {
    borderRadius: AppRadius.md,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  buttonText: {
    color: '#FFF8F1',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  title: {
    color: AppColors.text,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  sectionTitle: {
    color: AppColors.text,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  mutedText: {
    color: AppColors.textMuted,
  },
  emptyText: {
    color: AppColors.textSubtle,
    fontSize: 16,
  },
})
