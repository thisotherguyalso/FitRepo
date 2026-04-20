export type EditableSet = {
  id: string
  reps: string
  time_seconds: string
  weight: string
  set_notes: string
}

export type EditableExerciseGroup = {
  id: string
  workout_id: string
  exercise_id: string
  name: string
  type: 'reps' | 'timed'
  image_url?: string
  description?: string
  sets: EditableSet[]
}

function toEditableValue(value: number | null | undefined) {
  return value != null ? String(value) : ''
}

function buildSetId(prefix: string, index: number) {
  // draft rows need a stable-ish key before supabase gives us a real id
  return `${prefix}-set-${index}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEditableSet(
  type: 'reps' | 'timed',
  overrides: Partial<EditableSet> = {},
  prefix = 'draft',
  index = 0
): EditableSet {
  return {
    // same deal here. react gets grumpy fast if draft rows don't have their own ids.
    id: overrides.id ?? buildSetId(prefix, index),
    reps: type === 'reps' ? overrides.reps ?? '' : '',
    time_seconds: type === 'timed' ? overrides.time_seconds ?? '' : '',
    weight: overrides.weight ?? '',
    set_notes: overrides.set_notes ?? '',
  }
}

export function createEditableExerciseGroup(exercise: {
  id: string
  name: string
  type: string
  workout_id?: string
  image_url?: string
  description?: string
}) {
  const type = exercise.type === 'timed' ? 'timed' : 'reps'

  return {
    id: `group-${exercise.id}-${Math.random().toString(36).slice(2, 8)}`,
    workout_id: exercise.workout_id ?? '',
    exercise_id: exercise.id,
    name: exercise.name,
    type,
    image_url: exercise.image_url,
    description: exercise.description,
    sets: [],
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
        image_url: exercise.exercises?.image_url,
        description: exercise.exercises?.description,
        sets: [],
      })
      order.push(key)
    }

    const group = groups.get(key)!
    // workout_exercises is one row per set now, but the editor still wants a grouped shape.
    // rebuild it here so the screens don't have to care how the table is laid out.
    group.sets.push(
      createEditableSet(
        group.type,
        {
          id: exercise.id,
          reps: toEditableValue(exercise.reps),
          time_seconds: toEditableValue(exercise.time_seconds),
          weight: toEditableValue(exercise.weight),
          set_notes: exercise.set_notes ?? '',
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

  // editor works as grouped exercises -> sets, db works as one row per set.
  // flatten it once here so every caller doesn't reinvent the same mapping.
  return exercises.flatMap((exercise) =>
    exercise.sets.map((set) => ({
      workout_id: workoutId,
      exercise_id: exercise.exercise_id,
      reps: exercise.type === 'reps' ? toNullableNumber(set.reps) : null,
      time_seconds: exercise.type === 'timed' ? toNullableNumber(set.time_seconds) : null,
      weight: toNullableNumber(set.weight),
      set_notes: set.set_notes.trim() || null,
      order_index: orderIndex++,
    }))
  )
}

export function toNullableNumber(value: string) {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed) : null
}
