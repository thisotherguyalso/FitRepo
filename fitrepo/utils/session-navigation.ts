import { router } from 'expo-router';
import { SessionExercise } from '@/hooks/use-today-session';

type Props = {
  durationSeconds?: number;
}

export function goToNextExercise(
  exercises: SessionExercise[],
  currentIndex: number,
  workout_id: string,
) {
  const nextIndex = currentIndex + 1;

  if (nextIndex >= exercises.length) {
    // All done — go to summary
    router.replace({
      pathname: '/session-screens/summary',
      params: { workout_id, total: String(exercises.length) },
    });
    return;
  }

  const next = exercises[nextIndex];

  // Always go through breathe/rest screen between exercises
  router.push({
    pathname: '/session-screens/breathe',
    params: {
      exercises: JSON.stringify(exercises),
      currentIndex: String(nextIndex),
      workout_id,
    },
  });
}