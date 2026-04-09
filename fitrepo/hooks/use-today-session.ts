import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type SessionExercise = {
  id: string;
  workout_exercise_id: string;
  exercise_id: string;
  name: string;
  type: 'reps' | 'timed';
  sets: number;
  reps: number | null;
  time_seconds: number | null;
  weight: number | null;
  order_index: number;
};

export type TodaySession = {
  workout_id: string;
  workout_name: string;
  exercises: SessionExercise[];
};

export function useTodaySession() {
  const [session, setSession] = useState<TodaySession | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const today = new Date();
    const formatted =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    const { data: workout } = await supabase
      .from('workouts')
      .select('id, name')
      .eq('performed_at', formatted)
      .eq('is_finished', false)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (!workout) {
      setSession(null);
      setLoading(false);
      return;
    }

    const { data: rows } = await supabase
      .from('workout_exercises')
      .select(`
        id,
        exercise_id,
        sets,
        reps,
        time_seconds,
        weight,
        order_index,
        exercises (
          name,
          type
        )
      `)
      .eq('workout_id', workout.id)
      .order('order_index', { ascending: true });

    const exercises: SessionExercise[] = (rows ?? []).map((row: any) => ({
      id: row.exercises.id ?? row.id,
      workout_exercise_id: row.id,
      exercise_id: row.exercise_id,
      name: row.exercises.name,
      type: row.exercises.type === 'timed' ? 'timed' : 'reps',
      sets: row.sets ?? 1,
      reps: row.reps,
      time_seconds: row.time_seconds,
      weight: row.weight,
      order_index: row.order_index,
    }));

    setSession({ workout_id: workout.id, workout_name: workout.name, exercises });
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { session, loading, reload: load };
}