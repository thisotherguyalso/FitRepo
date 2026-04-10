import { useState, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SessionCountdownScreen } from '@/components/session-countdown-screen';
import { SessionExercise } from '@/hooks/use-today-session';
import { goToNextExercise } from '@/utils/session-navigation';
import { updateWorkoutExercise } from '@/lib/api/workoutExercises';
import { createHistoryEntry } from '@/lib/api/historyEntries';

export default function Timer() {
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

  const initialExercises: SessionExercise[] = JSON.parse(exercisesParam ?? '[]');
  const currentIndex = parseInt(indexParam ?? '0', 10);

  const [exercises, setExercises] = useState(initialExercises);
  const exercise = exercises[currentIndex];

  const totalSets = exercise?.sets ?? 1;
  const [currentSet, setCurrentSet] = useState(1);
  const currentDurationRef = useRef(exercise?.time_seconds ?? 30);

  const handleDurationChange = async (newDuration: number) => {
    currentDurationRef.current = newDuration;

    setExercises((prev) => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        time_seconds: newDuration,
      };
      return updated;
    });

    try {
      await updateWorkoutExercise(workout_id, exercise.exercise_id, {
        time_seconds: newDuration,
      });
    } catch (error) {
      console.error('Failed to update exercise duration:', error);
    }
  };

  // Timer finished naturally - log the set
  const handleComplete = async () => {
    try {
      await createHistoryEntry(user_id, workout_id, exercise.exercise_id, {
        set_number: currentSet,
        reps: null,
        time_seconds: currentDurationRef.current,
        weight: exercise?.weight ?? null,
      });
    } catch (error) {
      console.error('Failed to save timed set:', error);
    }

    if (currentSet < totalSets) {
      setCurrentSet((s) => s + 1);
    } else {
      goToNextExercise(exercises, currentIndex, workout_id, user_id);
    }
  };

  // User skipped - don't log, just move on
  const handleSkip = () => {
    goToNextExercise(exercises, currentIndex, workout_id, user_id);
  };

  return (
    <SessionCountdownScreen
      mode="exercise"
      title={`${exercise?.name ?? 'TIMER'}${totalSets > 1 ? ` (Set ${currentSet}/${totalSets})` : ''}`}
      duration={exercise?.time_seconds ?? 30}
      onComplete={handleComplete}
      onSkip={handleSkip}
      onDurationChange={handleDurationChange}
    />
  );
}