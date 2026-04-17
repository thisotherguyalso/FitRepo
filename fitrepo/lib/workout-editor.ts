export type EditableSet = {
  id: string
  reps: string
  time_seconds: string
  weight: string
}

export type EditableExerciseGroup = {
  id: string
  workout_id: string
  exercise_id: string
  name: string
  type: 'reps' | 'timed'
  sets: EditableSet[]
}

function toEditableValue(value: number | null | undefined) {
  return value != null ? String(value) : ''
}

function buildSetId(prefix: string, index: number) {
  return `${prefix}-set-${index}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEditableSet(
  type: 'reps' | 'timed',
  overrides: Partial<EditableSet> = {},
  prefix = 'draft',
  index = 0
): EditableSet {
  return {
    // draft sets need their own key before they exist in the db
    id: overrides.id ?? buildSetId(prefix, index),
    reps: type === 'reps' ? overrides.reps ?? '' : '',
    time_seconds: type === 'timed' ? overrides.time_seconds ?? '' : '',
    weight: overrides.weight ?? '',
  }
}

export function createEditableExerciseGroup(exercise: {
  id: string
  name: string
  type: string
  workout_id?: string
}) {
  const type = exercise.type === 'timed' ? 'timed' : 'reps'
  const defaultSetCount = type === 'timed' ? 1 : 3

  return {
    id: `group-${exercise.id}-${Math.random().toString(36).slice(2, 8)}`,
    workout_id: exercise.workout_id ?? '',
    exercise_id: exercise.id,
    name: exercise.name,
    type,
    sets: Array.from({ length: defaultSetCount }, (_, index) =>
      createEditableSet(type, {}, exercise.id, index)
    ),
  } satisfies EditableExerciseGroup
}

export function mapWorkoutExercisesToEditableGroups(exercises: any[]): EditableExerciseGroup[] {
  const groups = new Map<string, EditableExerciseGroup>()
  const order: string[] = []

  for (const exercise of exercises) {
    const key = exercise.exercise_id

    if (!groups.has(key)) {
      groups.set(key, {
        id: `group-${exercise.exercise_id}`,
        workout_id: exercise.workout_id,
        exercise_id: exercise.exercise_id,
        name: exercise.exercises?.name ?? 'Unnamed Exercise',
        type: exercise.exercises?.type === 'timed' ? 'timed' : 'reps',
        sets: [],
      })
      order.push(key)
    }

    const group = groups.get(key)!
    // the table is flat now, so rebuild the grouped editor shape here before the UI touches it
    group.sets.push(
      createEditableSet(
        group.type,
        {
          id: exercise.id,
          reps: toEditableValue(exercise.reps),
          time_seconds: toEditableValue(exercise.time_seconds),
          weight: toEditableValue(exercise.weight),
        },
        exercise.exercise_id,
        group.sets.length
      )
    )
  }

  return order.map((key) => groups.get(key)!)
}

export function flattenEditableExercises(
  workoutId: string,
  exercises: EditableExerciseGroup[]
) {
  let orderIndex = 0

  // grouped editor in, flat workout_exercises rows out
  return exercises.flatMap((exercise) =>
    exercise.sets.map((set) => ({
      workout_id: workoutId,
      exercise_id: exercise.exercise_id,
      sets: 1,
      reps: exercise.type === 'reps' ? toNullableNumber(set.reps) : null,
      time_seconds: exercise.type === 'timed' ? toNullableNumber(set.time_seconds) : null,
      weight: toNullableNumber(set.weight),
      order_index: orderIndex++,
    }))
  )
}

export function toNullableNumber(value: string) {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed) : null
}
