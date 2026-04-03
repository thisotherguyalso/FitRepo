import { TouchableOpacity, Text, StyleSheet } from 'react-native';
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
          
          <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => {
                      setRepAmount((repAmount) => repAmount + 1)
                    }}
                  >
                    <Text style={styles.buttonText}>Add Reps</Text>
          </TouchableOpacity>
          <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => {
                      setRepAmount((repAmount) => Math.max(repAmount - 1, 0))
                    }}
                  >
                    <Text style={styles.buttonText}>Remove Reps</Text>
          </TouchableOpacity>
      </ParallaxScrollView>
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
  buttonStyle: {
    backgroundColor: 'rgb(30,133,247)',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  }
});

