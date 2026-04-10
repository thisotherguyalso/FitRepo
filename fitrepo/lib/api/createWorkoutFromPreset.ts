import { createWorkout } from '@/lib/api/workouts'
import { addExerciseToWorkout } from '@/lib/api/workoutExercises'
import { getWorkoutPreset } from '@/lib/api/workoutPresets'
import { getExercisesInPreset } from '@/lib/api/presetExercises'

// Creates a new workout on a selected date using a preset
export async function createWorkoutFromPreset(
  preset_id: string,
  performed_at: string
) {
  const preset = await getWorkoutPreset(preset_id)
  if (!preset) {
    throw new Error('Preset not found.')
  }

  const presetExercises = await getExercisesInPreset(preset_id)

  // Create the actual workout row
  const workout = await createWorkout({
    name: preset.name,
    performed_at,
    is_finished: false,
  })

  // Copy all preset exercises into workout_exercises
  await Promise.all(
    presetExercises.map((exercise: any, index: number) =>
      addExerciseToWorkout(workout.id, exercise.exercise_id, {
        sets: exercise.sets ?? null,
        reps: exercise.reps ?? null,
        time_seconds: exercise.time_seconds ?? null,
        weight: exercise.weight ?? null,
        order_index: exercise.order_index ?? index,
      })
    )
  )

  return workout
}