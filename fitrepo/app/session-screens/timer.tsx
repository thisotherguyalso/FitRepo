import { Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useState, useEffect } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

const duration = 20;

export default function Timer() {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const router = useRouter();

  useEffect(() => {
    console.log("Time Screen Mounted");
    const interval = setInterval(() => {
      setTimeRemaining((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          router.replace('/session-screens/breathe');
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      router.replace('/session-screens/breathe');
    })
    .runOnJS(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={doubleTap}>
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}
        >
          <View style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>TIMER SCREEN</Text>
            <Text style={styles.sessionLabel}>{timeRemaining}</Text>
            <Text style={styles.sessionLabel}>Double tap screen to skip to Breathe</Text>
          </View>
        </ParallaxScrollView>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sessionCard: {
    backgroundColor: '#313131',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  sessionLabel: {
    color: '#888',
    fontSize: 20,
    marginBottom: 5,
  },
  sessionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});