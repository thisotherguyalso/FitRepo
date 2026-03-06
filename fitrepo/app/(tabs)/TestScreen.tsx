import React, { useEffect } from 'react'
import { View, Text, ScrollView } from 'react-native'
// TAKE NOTE the database used here is the test database
import { createWorkout, 
        finishWorkout, 
        getAllWorkouts,
        createExercise,
        getAllExercises,
        getWorkoutById,
        addExerciseToWorkout,
        getWorkoutWithExercises } from "@test_db_repo"
import { test_db as db } from "@test_db"
import { initDatabase } from "@test_db_migrations"

export default function TestScreen() {
    
  useEffect(() => {
    // Hard reset database
    db.execSync(`
      DROP TABLE IF EXISTS workout_exercises;
      DROP TABLE IF EXISTS exercises;
      DROP TABLE IF EXISTS workouts;
      DROP TABLE IF EXISTS profile;
    `)

    // Recreate tables
    initDatabase()

    console.log("=== DB INITIALIZED ===")

    // Create exercises
    const pushupId = createExercise("Push Ups", "reps")
    const plankId = createExercise("Plank", "timed")
    const squatId = createExercise("Squats", "reps")

    console.log("Exercises Created:", getAllExercises())

    // Create workout
    const workoutId = createWorkout(
      "Upper Body Test",
      new Date().toISOString()
    )

    console.log("Workout Created:", getWorkoutById(workoutId))

    // Add exercises to workout
    addExerciseToWorkout({
      workoutId,
      exerciseId: pushupId,
      setCount: 3,
      repCount: 12
    })

    addExerciseToWorkout({
      workoutId,
      exerciseId: plankId,
      setCount: 2,
      timePerSetSeconds: 60
    })

    addExerciseToWorkout({
      workoutId,
      exerciseId: squatId,
      setCount: 4,
      repCount: 15
    })

    console.log(
      "Workout With Exercises:",
      getWorkoutWithExercises(workoutId)
    )

    // Finish workout
    finishWorkout(workoutId)

    console.log("Workout After Finish:", getWorkoutById(workoutId))

    // Get all workouts
    console.log("All Workouts:", getAllWorkouts())

    console.log("=== TEST COMPLETE ===")
  }, [])

  return (
    <ScrollView>
      <Text>Check console for database test logs.</Text>
    </ScrollView>
  )
}