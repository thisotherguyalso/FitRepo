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

  // create the workout shell first, then copy the preset rows into it
  const workout = await createWorkout({
    name: preset.name,
    performed_at,
    is_finished: false,
  })

  // keep the saved preset ordering if it's there. otherwise just use the current list order.
  await Promise.all(
    presetExercises.map((exercise: any, index: number) =>
      addExerciseToWorkout(workout.id, exercise.exercise_id, {
        reps: exercise.reps ?? null,
        time_seconds: exercise.time_seconds ?? null,
        // presets are templates, not old logbooks. always start loads blank.
        weight: null,
        set_notes: null,
        order_index: exercise.order_index ?? index,
      })
    )
  )

  return workout
}
