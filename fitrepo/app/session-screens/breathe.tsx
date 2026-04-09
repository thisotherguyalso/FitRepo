import { useLocalSearchParams } from 'expo-router';
import { SessionCountdownScreen } from '@/components/session-countdown-screen';
import { SessionExercise } from '@/hooks/use-today-session';
import { router } from 'expo-router';

export default function Breathe() {
  const { exercises: exercisesParam, currentIndex: indexParam, workout_id } = useLocalSearchParams<{
    exercises: string;
    currentIndex: string;
    workout_id: string;
  }>();

  const exercises: SessionExercise[] = JSON.parse(exercisesParam ?? '[]');
  const currentIndex = parseInt(indexParam ?? '0', 10);
  const next = exercises[currentIndex];

  function goToNext() {
    const route = next?.type === 'timed' ? '/session-screens/timer' : '/session-screens/reps';
    router.replace({
      pathname: route,
      params: {
        exercises: exercisesParam,
        currentIndex: String(currentIndex),
        workout_id,
      },
    });
  }

  return (
    <SessionCountdownScreen
      title={next ? `Up next: ${next.name}` : 'BREATHE'}
      onComplete={goToNext}
      skipLabel="Double tap to skip rest"
    />
  );
}