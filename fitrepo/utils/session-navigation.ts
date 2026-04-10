import { router } from 'expo-router';
import { SessionExercise } from '@/hooks/use-today-session';
import { updateWorkout } from '@/lib/api/workouts';

export async function goToNextExercise(
  exercises: SessionExercise[],
  currentIndex: number,
  workout_id: string,
  user_id: string,
) {
  const nextIndex = currentIndex + 1;

  if (nextIndex >= exercises.length) {
    try {
      await updateWorkout(workout_id, { is_finished: true });
    } catch (error) {
      console.error('Failed to mark workout as finished:', error);
    }

    router.replace({
      pathname: '/session-screens/summary',
      params: { workout_id, total: String(exercises.length) },
    });
    return;
  }

  router.push({
    pathname: '/session-screens/breathe',
    params: {
      exercises: JSON.stringify(exercises),
      currentIndex: String(nextIndex),
      workout_id,
      user_id,
    },
  });
}