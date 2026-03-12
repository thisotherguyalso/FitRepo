import { useEffect, useState } from 'react';
import { getExercisesInWorkout } from '@/lib/api/workoutExercises';

export function useWorkoutExercises(workout_id: string) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadExercises() {
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
  }

  useEffect(() => {
    void loadExercises();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout_id]);

  return { exercises, loading, loadExercises };
}