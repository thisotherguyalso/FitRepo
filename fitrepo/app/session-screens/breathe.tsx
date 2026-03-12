import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState, useEffect } from 'react';

const duration = 20;

export default function Breathe() {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const router = useRouter();

  useEffect(() => {
    console.log("Breathe Screen Mounted");
    const interval = setInterval(() => {
      setTimeRemaining((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          router.replace('/session-screens/summary');
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
      router.replace('/session-screens/summary');
    })
    .runOnJS(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={doubleTap}>
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}
        >
          <View style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>BREATHE SCREEN</Text>
            <Text style={styles.sessionLabel}>{timeRemaining}</Text>
            <Text style={styles.sessionLabel}>Double tap screen to skip to Summary</Text>
          </View>
        </ParallaxScrollView>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sessionCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  sessionLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
  sessionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});