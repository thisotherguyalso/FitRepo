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

  // create the parent workout first so the copied preset rows have somewhere to land
  const workout = await createWorkout({
    name: preset.name,
    performed_at,
    is_finished: false,
  })

  // preserve preset order if it exists. if not, just fall back to the current loop index.
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
