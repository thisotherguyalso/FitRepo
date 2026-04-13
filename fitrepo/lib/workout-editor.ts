export type EditableExercise = {
  id: string
  workout_id: string
  exercise_id: string
  name: string
  type: 'reps' | 'timed'
  sets: string
  reps: string
  time_seconds: string
  weight: string
}

function toEditableValue(value: number | null | undefined) {
  return value != null ? String(value) : ''
}

export function mapWorkoutExercisesToEditable(exercises: any[]): EditableExercise[] {
  return exercises.map((exercise) => ({
    id: exercise.id,
    workout_id: exercise.workout_id,
    exercise_id: exercise.exercise_id,
    name: exercise.exercises?.name ?? 'Unnamed Exercise',
    type: exercise.exercises?.type === 'timed' ? 'timed' : 'reps',
    sets: toEditableValue(exercise.sets),
    reps: toEditableValue(exercise.reps),
    time_seconds: toEditableValue(exercise.time_seconds),
    weight: toEditableValue(exercise.weight),
  }))
}

export function toNullableNumber(value: string) {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed) : null
}
