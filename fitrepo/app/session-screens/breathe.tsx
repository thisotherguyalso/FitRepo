import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState, useEffect } from 'react';

const duration = 20;

export default function Break() {
  const [ timeRemaining, setTimeRemaining ] = useState(duration)
    const router = useRouter()
  
    useEffect(() => {
      if (timeRemaining === 0) {
        router.push('/session-screens/breathe')
      }
      const interval = setInterval(() => {
        setTimeRemaining(previous => previous - 1)
      }, 1000)
      return () => clearInterval(interval)
    }, [timeRemaining, router])

  const doubleTap = Gesture.Tap().numberOfTaps(2).onEnd(() => {
    router.navigate('/session-screens/summary')
  }).runOnJS(true)

  
  return (
    <GestureHandlerRootView style={{ flex:1 }}>
      <GestureDetector gesture={doubleTap}>
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
          <TouchableOpacity style={styles.sessionCard}>
            <Text style={styles.sessionLabel}>
              {timeRemaining}
            </Text>
            <Text style={styles.sessionLabel}>
              Double tap screen to skip
            </Text>
          </TouchableOpacity>
        </ParallaxScrollView>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  sessionCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  button: {
    backgroundColor: 'blue',
    alignItems: 'center',
  },
  sessionLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
});
