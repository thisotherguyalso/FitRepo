import { useState, useEffect, useCallback } from 'react'
import { Workout } from '@/types/database'
import { getWorkouts, createWorkout } from '@/lib/api/workouts'
import { addExerciseToWorkout } from '@/lib/api/workoutExercises'

// for planned exercises
type PlannedExercise = {
  exercise_id: string
  sets: number | null
  reps: number | null
  time_seconds: number | null
  weight: number | null
  order_index: number
}

// input type
type PlannedWorkoutInput = {
  name: string
  performed_at: string
  is_finished: boolean
  exercises: PlannedExercise[]
}

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(false)

  // useCallback keeps the function stable so it can be safely used
  // inside useEffect / useFocusEffect without recreating it every render
  const loadWorkouts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getWorkouts()
      setWorkouts(data ?? [])
    } catch (error: any) {
      console.error(error.message)
      setWorkouts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadWorkouts()
  }, [loadWorkouts])

  const markedDates = workouts.reduce((acc, workout) => {
    acc[workout.performed_at] = {
      marked: true,
      dotColor: workout.is_finished ? '#f5c842' : '#3b82f6',
    }
    return acc
  }, {} as Record<string, any>)

  // creates a workout row and then adds all selected exercises to it
  async function planWorkout(
    workout: PlannedWorkoutInput
  ): Promise<Workout> {
    setLoading(true)
    try {
      const createdWorkout = await createWorkout({
        name: workout.name,
        performed_at: workout.performed_at,
        is_finished: workout.is_finished,
      })

      for (const exercise of workout.exercises) {
        await addExerciseToWorkout(
          createdWorkout.id,
          exercise.exercise_id,
          {
            sets: exercise.sets,
            reps: exercise.reps,
            time_seconds: exercise.time_seconds,
            weight: exercise.weight,
            order_index: exercise.order_index,
          }
        )
      }

      setWorkouts((prev) => [...prev, createdWorkout])
      return createdWorkout
    } catch (error: any) {
      console.error(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    workouts,
    markedDates,
    planWorkout,
    loadWorkouts,
  }
}