import type { PropsWithChildren } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated'

import { AppRadius, AppSpacing, useAppColors } from '@/constants/styles'

const HEADER_HEIGHT = 220

type Props = PropsWithChildren<object>

export default function ParallaxScrollView({ children }: Props) {
  const colors = useAppColors()
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const scrollOffset = useScrollOffset(scrollRef)

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.42]
        ),
      },
      {
        scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [1.18, 1, 0.96]),
      },
    ],
  }))

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <LinearGradient
            colors={[colors.backgroundStrong, colors.backgroundAlt, colors.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerGradient, { borderBottomLeftRadius: 42, borderBottomRightRadius: 42 }]}
          />
          <View style={[styles.glowLarge, { backgroundColor: colors.panelStrong }]} />
          <View style={[styles.glowSmall, { backgroundColor: colors.overlay }]} />
          <View style={[styles.brandChip, { backgroundColor: colors.tabBar, borderColor: colors.border }]}>
            <Text style={[styles.brandText, { color: colors.textAccent }]}>FITREPO</Text>
          </View>
        </Animated.View>
        <View style={styles.content}>{children}</View>
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: AppSpacing.xxl + 32,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  glowLarge: {
    position: 'absolute',
    top: 26,
    right: -38,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.95,
  },
  glowSmall: {
    position: 'absolute',
    top: 88,
    left: -26,
    width: 128,
    height: 128,
    borderRadius: 64,
    opacity: 0.9,
  },
  brandChip: {
    position: 'absolute',
    top: 62,
    left: AppSpacing.page,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: AppRadius.pill,
    borderWidth: 1,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.4,
  },
  content: {
    flex: 1,
    marginTop: -58,
    paddingHorizontal: AppSpacing.page,
    gap: 16,
  },
})
