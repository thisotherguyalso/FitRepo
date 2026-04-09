import { useCallback, useEffect, useState } from 'react';
import { getExercisesInWorkout } from '@/lib/api/workoutExercises';

export function useWorkoutExercises(workout_id: string) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadExercises = useCallback(async () => {
    if (!workout_id) return;

    setLoading(true);
    try {
      const data = await getExercisesInWorkout(workout_id);
      setExercises(data ?? []);
    } catch (error: any) {
      console.error(error.message);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [workout_id]);

  useEffect(() => {
    void loadExercises();
  }, [loadExercises]);

  return { exercises, loading, loadExercises };
}
