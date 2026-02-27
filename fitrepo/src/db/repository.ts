import { db } from '@db'

/* =========================
   WORKOUTS
========================= */

// Create new workout session
export function createWorkout(name: string, performedAtISO: string) {
  const result = db.runSync(
    `INSERT INTO workouts (name, performed_at) VALUES (?, ?)`,
    [name, performedAtISO]
  )

  return result.lastInsertRowId
}

// Mark workout as finished
export function finishWorkout(workoutId: number) {
  db.runSync(
    `UPDATE workouts
     SET is_finished = 1
     WHERE id = ?`,
    [workoutId]
  )
}

// Get all workouts
export function getAllWorkouts() {
  return db.getAllSync(`
    SELECT *
    FROM workouts
    ORDER BY performed_at DESC
  `)
}

// Get single workout
export function getWorkoutById(workoutId: number) {
  return db.getFirstSync(
    `SELECT *
     FROM workouts
     WHERE id = ?`,
    [workoutId]
  )
}


/* =========================
   EXERCISES (MASTER LIST)
========================= */

// Create reusable exercise
export function createExercise(
  name: string,
  type: 'timed' | 'reps',
  imageUri?: string
) {
  const result = db.runSync(
    `INSERT INTO exercises (name, type, image_url)
     VALUES (?, ?, ?)`,
    [name, type, imageUri ?? null]
  )

  return result.lastInsertRowId
}

// Get all exercises
export function getAllExercises() {
  return db.getAllSync(`
    SELECT *
    FROM exercises
    ORDER BY name ASC
  `)
}


/* =========================
   WORKOUT EXERCISES
========================= */

// Add exercise to workout
export function addExerciseToWorkout(params: {
  workoutId: number
  exerciseId: number
  setCount: number
  repCount?: number
  timePerSetSeconds?: number
}) {
  const {
    workoutId,
    exerciseId,
    setCount,
    repCount,
    timePerSetSeconds
  } = params

  db.runSync(
    `INSERT INTO workout_exercises (
      workout_id,
      exercise_id,
      set_count,
      rep_count,
      time_per_set_seconds
    )
    VALUES (?, ?, ?, ?, ?)`,
    [
      workoutId,
      exerciseId,
      setCount,
      repCount ?? null,
      timePerSetSeconds ?? null
    ]
  )
}


// Get full workout with exercises
export function getWorkoutWithExercises(workoutId: number) {
  return db.getAllSync(
    `
    SELECT
      we.id as workout_exercise_id,
      e.name,
      e.type,
      we.set_count,
      we.rep_count,
      we.time_per_set_seconds
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    WHERE we.workout_id = ?
    `,
    [workoutId]
  )
}