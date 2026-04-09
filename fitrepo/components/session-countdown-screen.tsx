import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient';

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { AppColors, AppRadius, AppSpacing, sharedStyles } from '@/constants/styles'

type SessionCountdownScreenProps = {
  title: string
  nextRoute: '/session-screens/breathe' | '/session-screens/summary'
  skipLabel: string
  duration?: number
  cardColor?: string
}

export function SessionCountdownScreen({
  title,
  nextRoute,
  skipLabel,
  duration = 20,
  cardColor = '#1a1a1a',
}: SessionCountdownScreenProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration)
  const router = useRouter()

  useEffect(() => {
    setTimeRemaining(duration)

    const interval = setInterval(() => {
      setTimeRemaining((previous) => {
        if (previous <= 1) {
          clearInterval(interval)
          router.replace(nextRoute)
          return 0
        }

        return previous - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [duration, nextRoute, router])

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      router.replace(nextRoute)
    })
    .runOnJS(true)

  return (
    <GestureHandlerRootView style={styles.root}>
      <GestureDetector gesture={doubleTap}>
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}
        >
        <LinearGradient
          colors={['#020975fb', '#151718']}
          style={sharedStyles.background}
        />
          <View style={[styles.sessionCard, { backgroundColor: cardColor }]}>
            <Text style={styles.sessionTitle}>{title}</Text>
            <Text style={[sharedStyles.mutedText, styles.sessionLabel]}>{timeRemaining}</Text>
            <Text style={[sharedStyles.mutedText, styles.sessionLabel]}>{skipLabel}</Text>
          </View>
        </ParallaxScrollView>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  sessionCard: {
    padding: AppSpacing.xl,
    borderRadius: AppRadius.lg,
    marginBottom: 30,
  },
  sessionLabel: {
    fontSize: 20,
    marginBottom: 5,
  },
  sessionTitle: {
    color: AppColors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
})
