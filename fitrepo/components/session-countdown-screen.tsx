import { useEffect, useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient'

import { AppColors, AppRadius, AppSpacing } from '@/constants/styles'

type SessionCountdownScreenProps = {
  mode: 'rest' | 'exercise'
  title: string
  onComplete: () => void
  duration?: number
  autoStart?: boolean
  onDurationChange?: (newDuration: number) => void
}

export function SessionCountdownScreen({
  mode,
  title,
  onComplete,
  duration = 20,
  autoStart = false,
  onDurationChange,
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
          return 0
        }
        return previous - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (timeRemaining === 0) {
      onComplete()
    }
  }, [timeRemaining, onComplete])

  const adjustTime = (delta: number) => {
    setTimeRemaining((prev) => {
      const newTime = Math.max(5, prev + delta)
      onDurationChange?.(newTime)
      return newTime
    })
  }

  // Single tap to start/pause
  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => setIsRunning((prev) => !prev))
    .runOnJS(true)

  const headerText = mode === 'rest' ? 'Breathe' : title
  const showUpNext = mode === 'rest'

  return (
    <GestureHandlerRootView style={styles.root}>
      <LinearGradient
        colors={mode === 'rest' ? ['#0a4a2e', '#151718'] : ['#020975', '#151718']}
        style={styles.container}
      >
        {/* Header */}
        <Text style={styles.header}>{headerText}</Text>

        {/* Centered Timer Section */}
        <View style={styles.timerSection}>
          <View style={styles.timerRow}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => adjustTime(-5)}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustButtonText}>−5</Text>
            </TouchableOpacity>

            {/* Tap timer to start/pause */}
            <GestureDetector gesture={singleTap}>
              <View>
                <Text style={styles.timer}>{timeRemaining}</Text>
              </View>
            </GestureDetector>

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => adjustTime(5)}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustButtonText}>+5</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.timerLabel}>
            {!isRunning ? 'tap timer to start' : 'seconds'}
          </Text>

          {/* Paused indicator */}
          {!isRunning && timeRemaining < duration && (
            <View style={styles.pausedBadge}>
              <Text style={styles.pausedText}>PAUSED</Text>
            </View>
          )}
        </View>

        {/* Up Next Card (rest mode) - tappable to skip */}
        {showUpNext && (
          <TouchableOpacity
            style={styles.upNextCard}
            onPress={onComplete}
            activeOpacity={0.7}
          >
            <Text style={styles.upNextLabel}>UP NEXT</Text>
            <Text style={styles.upNextTitle}>{title}</Text>
            <Text style={styles.skipHint}>Tap to skip</Text>
          </TouchableOpacity>
        )}

        {/* Skip button (exercise mode) */}
        {!showUpNext && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onComplete}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip Exercise</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
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
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  timer: {
    color: AppColors.text,
    fontSize: 120,
    fontWeight: '200',
    lineHeight: 130,
    minWidth: 180,
    textAlign: 'center',
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
  adjustButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: AppRadius.md,
  },
  adjustButtonText: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '600',
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
    fontSize: 12,
    opacity: 0.4,
    marginTop: 8,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: AppRadius.md,
    marginBottom: AppSpacing.lg,
  },
  skipButtonText: {
    color: AppColors.text,
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
  },
})