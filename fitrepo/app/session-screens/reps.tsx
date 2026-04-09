import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useState } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { sharedStyles } from '@/constants/styles';
import { SessionExercise } from '@/hooks/use-today-session';
import { goToNextExercise } from '@/utils/session-navigation';

export default function Reps() {
  const { exercises: exercisesParam, currentIndex: indexParam, workout_id } = useLocalSearchParams<{
    exercises: string;
    currentIndex: string;
    workout_id: string;
  }>();

  const exercises: SessionExercise[] = JSON.parse(exercisesParam ?? '[]');
  const currentIndex = parseInt(indexParam ?? '0', 10);
  const exercise = exercises[currentIndex];

  const totalSets = exercise?.sets ?? 1;
  const [currentSet, setCurrentSet] = useState(1);
  const [repAmount, setRepAmount] = useState(0);

  function handleFinishSet() {
    if (currentSet < totalSets) {
      setCurrentSet((s) => s + 1);
      setRepAmount(0);
    } else {
      goToNextExercise(exercises, currentIndex, workout_id as string);
    }
  }

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => goToNextExercise(exercises, currentIndex, workout_id as string))
    .runOnJS(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
        <LinearGradient colors={['#020975fb', '#151718']} style={sharedStyles.background} />

        <GestureDetector gesture={doubleTap}>
          <TouchableOpacity style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>{exercise?.name ?? 'Exercise'}</Text>
            <Text style={styles.setLabel}>Set {currentSet} of {totalSets}</Text>
            {exercise?.weight ? (
              <Text style={styles.sessionLabel}>{exercise.weight}kg</Text>
            ) : null}
            <Text style={styles.repCount}>{repAmount}</Text>
            <Text style={styles.sessionLabel}>Double tap to skip</Text>
          </TouchableOpacity>
        </GestureDetector>

        <TouchableOpacity style={styles.buttonStyle} onPress={() => setRepAmount((r) => r + 1)}>
          <Text style={styles.buttonText}>+ Rep</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonStyle} onPress={() => setRepAmount((r) => Math.max(r - 1, 0))}>
          <Text style={styles.buttonText}>− Rep</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonStyle, styles.finishButton]} onPress={handleFinishSet}>
          <Text style={styles.buttonText}>
            {currentSet < totalSets ? `Finish Set ${currentSet}` : 'Finish Exercise'}
          </Text>
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
    alignItems: 'center',
  },
  sessionLabel: { color: '#888', fontSize: 16, marginTop: 4 },
  sessionTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
  setLabel: { color: '#93c5fd', fontSize: 18, marginBottom: 8 },
  repCount: { color: '#fff', fontSize: 64, fontWeight: '700', marginVertical: 12 },
  buttonStyle: {
    backgroundColor: 'rgb(30,133,247)',
    paddingVertical: 24,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 16,
  },
  finishButton: { backgroundColor: 'rgb(22,163,74)' },
  buttonText: { color: '#ffffff', fontSize: 24, fontWeight: '700' },
});