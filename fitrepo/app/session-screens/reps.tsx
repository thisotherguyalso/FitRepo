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
    // flex 1 = Take up the entire available screen space
    <GestureHandlerRootView style={{ flex: 1 }}> 
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
          <GestureDetector gesture={doubleTap}>
            <TouchableOpacity style={styles.sessionCard}>
              <Text style={styles.sessionTitle}>REPS SCREEN</Text>
              <Text style={styles.sessionLabel}>{repAmount}</Text>
              <Text style={styles.sessionLabel}>Double tap this card to skip</Text>
            </TouchableOpacity>
          </GestureDetector>
          
          <Button title='Add Reps' onPress={() => {
            setRepAmount((repAmount) => repAmount + 1)
          }}/>
          <Button title='Remove Reps' onPress={() => {
            setRepAmount((repAmount) => Math.max(repAmount - 1, 0))
          }}/>
      </ParallaxScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

