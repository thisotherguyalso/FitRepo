import { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SessionExercise } from '@/hooks/use-today-session';
import { goToNextExercise } from '@/utils/session-navigation';
import { createHistoryEntry } from '@/lib/api/historyEntries';
import { AppColors, AppRadius, AppSpacing } from '@/constants/styles';

export default function Reps() {
  const {
    exercises: exercisesParam,
    currentIndex: indexParam,
    workout_id,
    user_id,
  } = useLocalSearchParams<{
    exercises: string;
    currentIndex: string;
    workout_id: string;
    user_id: string;
  }>();

  const exercises: SessionExercise[] = JSON.parse(exercisesParam ?? '[]');
  const currentIndex = parseInt(indexParam ?? '0', 10);
  const exercise = exercises[currentIndex];

  const totalSets = exercise?.sets ?? 1;
  const [currentSet, setCurrentSet] = useState(1);
  const [repAmount, setRepAmount] = useState(0);
  const [saving, setSaving] = useState(false);

  async function handleFinishSet() {
    if (saving) return;

    setSaving(true);
    try {
      // Log this set to history
      await createHistoryEntry(user_id, workout_id, exercise.exercise_id, {
        set_number: currentSet,
        reps: repAmount > 0 ? repAmount : null,
        time_seconds: null,
        weight: exercise?.weight ?? null,
      });

      if (currentSet < totalSets) {
        setCurrentSet((s) => s + 1);
        setRepAmount(0);
      } else {
        goToNextExercise(exercises, currentIndex, workout_id, user_id);
      }
    } catch (error) {
      console.error('Failed to save set:', error);
      // Still advance even if save fails - could show toast here
      if (currentSet < totalSets) {
        setCurrentSet((s) => s + 1);
        setRepAmount(0);
      } else {
        goToNextExercise(exercises, currentIndex, workout_id, user_id);
      }
    } finally {
      setSaving(false);
    }
  }

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => goToNextExercise(exercises, currentIndex, workout_id, user_id))
    .runOnJS(true);

  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => setRepAmount((r) => r + 1))
    .runOnJS(true);

  const repGesture = Gesture.Exclusive(doubleTap, singleTap);

  const isLastSet = currentSet >= totalSets;

  return (
    <GestureHandlerRootView style={styles.root}>
      <LinearGradient
        colors={['#7c2d12', '#151718']}
        style={styles.container}
      >
        {/* Header */}
        <Text style={styles.header}>{exercise?.name ?? 'Exercise'}</Text>

        {/* Set indicator */}
        <View style={styles.setIndicator}>
          <Text style={styles.setLabel}>SET {currentSet} OF {totalSets}</Text>
          {exercise?.weight ? (
            <Text style={styles.weightLabel}>{exercise.weight} kg</Text>
          ) : null}
        </View>

        {/* Centered Rep Section */}
        <View style={styles.repSection}>
          <View style={styles.repRow}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => setRepAmount((r) => Math.max(r - 1, 0))}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustButtonText}>−1</Text>
            </TouchableOpacity>

            {/* Tap to add rep, double tap to skip */}
            <GestureDetector gesture={repGesture}>
              <View>
                <Text style={styles.repCount}>{repAmount}</Text>
              </View>
            </GestureDetector>

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => setRepAmount((r) => r + 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustButtonText}>+1</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.repLabel}>
            {exercise?.reps ? `target: ${exercise.reps} reps` : 'reps'}
          </Text>
        </View>

        {/* Finish Set Button */}
        <TouchableOpacity
          style={[styles.finishButton, isLastSet && styles.finishButtonLast]}
          onPress={handleFinishSet}
          activeOpacity={0.8}
          disabled={saving}
        >
          <Text style={styles.finishButtonText}>
            {saving ? 'Saving...' : isLastSet ? 'Finish Exercise' : 'Finish Set'}
          </Text>
        </TouchableOpacity>

        {/* Skip Hint */}
        <Text style={styles.skipHint}>Tap counter to add rep • Double-tap to skip</Text>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

// ... styles stay the same

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
  setIndicator: {
    marginTop: 16,
    alignItems: 'center',
  },
  setLabel: {
    color: '#93c5fd',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
  },
  weightLabel: {
    color: AppColors.text,
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  repSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  repCount: {
    color: AppColors.text,
    fontSize: 120,
    fontWeight: '200',
    lineHeight: 130,
    minWidth: 180,
    textAlign: 'center',
  },
  repLabel: {
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
  finishButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: AppRadius.lg,
    marginBottom: AppSpacing.lg,
  },
  finishButtonLast: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
  },
  finishButtonText: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  skipHint: {
    color: AppColors.text,
    fontSize: 14,
    opacity: 0.4,
    marginBottom: 15,
  },
});