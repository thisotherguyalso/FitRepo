import { useState, useEffect, useCallback } from 'react'
import { Workout } from '@/types/database'
import { getWorkouts, createWorkout } from '@/lib/api/workouts'
import { addExerciseToWorkout, getWorkoutSummaries } from '@/lib/api/workoutExercises'
import { getCurrentUserBodyWeightKg, resolveEffectiveWeight } from '@/lib/bodyweight'

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
  const [workoutSummaries, setWorkoutSummaries] = useState<Record<string, { totalSets: number; totalVolume: number }>>({})
  const [loading, setLoading] = useState(false)

  // useCallback keeps the function stable so it can be safely used
  // inside useEffect / useFocusEffect without recreating it every render
  const loadWorkouts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getWorkouts()
      const nextWorkouts = data ?? []
      setWorkouts(nextWorkouts)
      const bodyWeightKg = await getCurrentUserBodyWeightKg()

      try {
        const summaries = await getWorkoutSummaries(nextWorkouts.map((workout) => workout.id), bodyWeightKg)
        setWorkoutSummaries(
          summaries.reduce((acc, summary) => {
            acc[summary.workout_id] = {
              totalSets: summary.totalSets,
              totalVolume: summary.totalVolume,
            }
            return acc
          }, {} as Record<string, { totalSets: number; totalVolume: number }>)
        )
      } catch (summaryError: any) {
        // don't blank the whole workouts screen just because the extra summary query died
        console.warn(summaryError?.message ?? 'Failed to load workout summaries')
      }
    } catch (error: any) {
      console.warn(error.message)
      setWorkouts([])
      setWorkoutSummaries({})
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
      const bodyWeightKg = await getCurrentUserBodyWeightKg()
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
      const totalSets = workout.exercises.reduce((sum, exercise) => sum + (exercise.sets ?? 1), 0)
      const totalVolume = workout.exercises.reduce(
        (sum, exercise) =>
          sum + ((exercise.reps ?? 0) * (resolveEffectiveWeight(exercise.weight, bodyWeightKg) ?? 0) * (exercise.sets ?? 1)),
        0
      )
      setWorkoutSummaries((prev) => ({
        ...prev,
        [createdWorkout.id]: {
          totalSets,
          totalVolume,
        },
      }))
      return createdWorkout
    } catch (error: any) {
      console.warn(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    workouts,
    workoutSummaries,
    markedDates,
    planWorkout,
    loadWorkouts,
  }
}
