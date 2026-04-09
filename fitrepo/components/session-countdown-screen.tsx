import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient'

import { AppColors, AppRadius, AppSpacing } from '@/constants/styles'

type SessionCountdownScreenProps = {
  mode: 'rest' | 'exercise'
  title: string // Exercise name (shown in "Up Next" for rest, or as header for exercise)
  onComplete: () => void
  skipLabel: string
  duration?: number
  autoStart?: boolean // For testing
}

export function SessionCountdownScreen({
  mode,
  title,
  onComplete,
  skipLabel,
  duration = 20,
  autoStart = false,
}: SessionCountdownScreenProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration)
  const [isRunning, setIsRunning] = useState(autoStart)

  useEffect(() => {
    setTimeRemaining(duration)
    setIsRunning(false)
  }, [duration])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeRemaining((previous) => {
        if (previous <= 1) {
          clearInterval(interval)
          onComplete()
          return 0
        }
        return previous - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, onComplete])

  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      setIsRunning((prev) => !prev)
    })
    .runOnJS(true)

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => onComplete())
    .runOnJS(true)

  // Double tap takes priority over single tap
  const composedGesture = Gesture.Exclusive(doubleTap, singleTap)

  const headerText = mode === 'rest' ? 'Breathe' : title
  const showUpNext = mode === 'rest'

  return (
    <GestureHandlerRootView style={styles.root}>
      <GestureDetector gesture={composedGesture}>
        <LinearGradient
          colors={mode === 'rest' ? ['#0a4a2e', '#151718'] : ['#020975', '#151718']}
          style={styles.container}
        >
          {/* Header */}
          <Text style={styles.header}>{headerText}</Text>

          {/* Centered Timer Section */}
          <View style={styles.timerSection}>
            <Text style={styles.timer}>{timeRemaining}</Text>
            <Text style={styles.timerLabel}>
              {!isRunning ? 'tap to start' : 'seconds'}
            </Text>

            {/* Paused indicator */}
            {!isRunning && timeRemaining < duration && (
              <View style={styles.pausedBadge}>
                <Text style={styles.pausedText}>PAUSED</Text>
              </View>
            )}
          </View>

          {/* Up Next Card (rest mode only) */}
          {showUpNext && (
            <View style={styles.upNextCard}>
              <Text style={styles.upNextLabel}>UP NEXT</Text>
              <Text style={styles.upNextTitle}>{title}</Text>
            </View>
          )}

          {/* Skip Hint */}
          <Text style={styles.skipHint}>{skipLabel}</Text>
        </LinearGradient>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: AppSpacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    color: AppColors.text,
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
    opacity: 0.9,
    textAlign: 'center',
  },
  timerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    color: AppColors.text,
    fontSize: 120,
    fontWeight: '200',
    lineHeight: 130,
  },
  timerLabel: {
    color: AppColors.text,
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: -10,
  },
  pausedBadge: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: AppRadius.md,
  },
  pausedText: {
    color: AppColors.text,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    opacity: 0.7,
  },
  upNextCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: AppSpacing.md,
    paddingHorizontal: AppSpacing.lg,
    borderRadius: AppRadius.md,
    alignItems: 'center',
    width: '100%',
    marginBottom: AppSpacing.lg,
  },
  upNextLabel: {
    color: AppColors.text,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    opacity: 0.5,
    marginBottom: 4,
  },
  upNextTitle: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  skipHint: {
    color: AppColors.text,
    fontSize: 14,
    opacity: 0.4,
  },
})