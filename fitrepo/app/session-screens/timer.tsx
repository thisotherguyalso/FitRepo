import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SessionCountdownScreen } from '@/components/session-countdown-screen';
import { SessionExercise } from '@/hooks/use-today-session';
import { goToNextExercise } from '@/utils/session-navigation';
import { updateWorkoutExercise } from '@/lib/api/workoutExercises';

export default function Timer() {
  const { exercises: exercisesParam, currentIndex: indexParam, workout_id } = useLocalSearchParams<{
    exercises: string;
    currentIndex: string;
    workout_id: string;
  }>();

  const initialExercises: SessionExercise[] = JSON.parse(exercisesParam ?? '[]');
  const currentIndex = parseInt(indexParam ?? '0', 10);

  const [exercises, setExercises] = useState(initialExercises);
  const exercise = exercises[currentIndex];

  const handleDurationChange = async (newDuration: number) => {
    // Update local state immediately for responsive UI
    setExercises((prev) => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        time_seconds: newDuration,
      };
      return updated;
    });

    // Persist to Supabase
    try {
      await updateWorkoutExercise(
        workout_id,
        exercise.exercise_id,
        { time_seconds: newDuration }
      );
    } catch (error) {
      console.error('Failed to update exercise duration:', error);
      // Optionally revert local state or show a toast
    }
  };

  return (
    <SessionCountdownScreen
      mode="exercise"
      title={exercise?.name ?? 'TIMER'}
      duration={exercise?.time_seconds ?? 30}
      onComplete={() => goToNextExercise(exercises, currentIndex, workout_id)}
      onDurationChange={handleDurationChange}
    />
  );
}