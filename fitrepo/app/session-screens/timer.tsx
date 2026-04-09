import { useLocalSearchParams } from 'expo-router';
import { SessionCountdownScreen } from '@/components/session-countdown-screen';
import { SessionExercise } from '@/hooks/use-today-session';
import { goToNextExercise } from '@/utils/session-navigation';

export default function Timer() {
  const { exercises: exercisesParam, currentIndex: indexParam, workout_id } = useLocalSearchParams<{
    exercises: string;
    currentIndex: string;
    workout_id: string;
  }>();

  const exercises: SessionExercise[] = JSON.parse(exercisesParam ?? '[]');
  const currentIndex = parseInt(indexParam ?? '0', 10);
  const exercise = exercises[currentIndex];

  return (
    <SessionCountdownScreen
      mode='exercise'
      title={exercise?.name ?? 'TIMER'}
      duration={exercise?.time_seconds ?? 30}
      onComplete={() => goToNextExercise(exercises, currentIndex, workout_id as string)}
      skipLabel="Double tap to skip"
    />
  );
}