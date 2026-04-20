import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export type SessionSetConfig = {
  workout_exercise_id: string
  reps: number | null
  time_seconds: number | null
  weight: number | null
  order_index: number
}

export type SessionExercise = {
  id: string
  workout_exercise_id: string
  exercise_id: string
  name: string
  type: 'reps' | 'timed'
  sets: number
  reps: number | null
  time_seconds: number | null
  weight: number | null
  order_index: number
  setConfigs: SessionSetConfig[]
}

export type TodaySession = {
  workout_id: string
  workout_name: string
  exercises: SessionExercise[]
  completed?: boolean
}

function groupExercises(rows: any[]): SessionExercise[] {
  const grouped = new Map<string, SessionExercise>()
  const order: string[] = []

  for (const row of rows ?? []) {
    const key = row.exercise_id

    if (!grouped.has(key)) {
      // session screen still thinks in "one exercise card with a bunch of sets"
      // even though workout_exercises is flat now.
      grouped.set(key, {
        id: row.exercises.id ?? row.id,
        workout_exercise_id: row.id,
        exercise_id: row.exercise_id,
        name: row.exercises.name,
        type: row.exercises.type === 'timed' ? 'timed' : 'reps',
        sets: 0,
        reps: row.reps,
        time_seconds: row.time_seconds,
        weight: row.weight,
        order_index: row.order_index,
        setConfigs: [],
      })
      order.push(key)
    }

    const exercise = grouped.get(key)!
    exercise.setConfigs.push({
      workout_exercise_id: row.id,
      reps: row.reps,
      time_seconds: row.time_seconds,
      weight: row.weight,
      order_index: row.order_index,
    })
    exercise.sets = exercise.setConfigs.length
  }

  return order.map((key) => grouped.get(key)!)
}

export function useTodaySession() {
  const [session, setSession] = useState<TodaySession | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const today = new Date()
    const formatted =
      // keeping the date string manual here so it always matches the yyyy-mm-dd format in the table
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0')

    const { data: workouts } = (await supabase
      .from('workouts')
      .select('id, name, is_finished')
      .eq('performed_at', formatted)
      .order('created_at', { ascending: true })
      ) as {
      data: Array<{ id: string; name: string; is_finished: boolean }> | null
      error: any
    }

    if (!workouts || workouts.length === 0) {
      setSession(null)
      setLoading(false)
      return
    }

    // if they planned multiple workouts today, don't dump them into a "day is done" state
    // just because the first one happened to be finished already.
    const workout =
      workouts.find((entry) => !entry.is_finished) ??
      workouts[0]

    if (workout.is_finished) {
      setSession({ workout_id: workout.id, workout_name: workout.name, exercises: [], completed: true })
      setLoading(false)
      return
    }

    const { data: rows } = await supabase
      .from('workout_exercises')
      .select(
        `
        id,
        exercise_id,
        reps,
        time_seconds,
        weight,
        order_index,
        exercises (
          id,
          name,
          type
        )
      `
      )
      .eq('workout_id', workout.id)
      .order('order_index', { ascending: true })

    setSession({
      workout_id: workout.id,
      workout_name: workout.name,
      exercises: groupExercises(rows ?? []),
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { session, loading, reload: load }
}
