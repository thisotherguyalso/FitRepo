import { TouchableOpacity, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useState } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Reps() {
  const router = useRouter()
  const [ repAmount, setRepAmount ] = useState(0)  

  const doubleTap = Gesture.Tap().numberOfTaps(2).onEnd(() => {
    router.navigate('/session-screens/breathe')
  }).runOnJS(true)

  return (
    <GestureHandlerRootView>
          <GestureDetector gesture={doubleTap}>
            <ParallaxScrollView
              headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
                <TouchableOpacity style={styles.sessionCard}>
                  <Text style={styles.sessionLabel}>
                    {repAmount}
                  </Text>
                  <Text style={styles.sessionLabel}>
                    Double tap screen to skip
                  </Text>
                </TouchableOpacity>
                <Button title='Add Reps' onPress={() => {
                  setRepAmount(repAmount + 1)
                }}/>
                <Button title='Remove Reps' onPress={() => {
                  setRepAmount(repAmount - 1)
                }}/>
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

