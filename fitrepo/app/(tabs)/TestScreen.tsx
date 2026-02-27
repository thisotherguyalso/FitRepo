// TestScreen.tsx
import React, { useEffect } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { createWorkout, finishWorkout, getAllWorkouts } from "@/src/db/repository"
import { db } from "@test_db"
import { initDatabase } from "@db_migrations"

export default function TestScreen() {
    
  useEffect(() => {
    // Drop tables
    db.execSync(`
    DROP TABLE IF EXISTS workout_exercises;
    DROP TABLE IF EXISTS exercises;
    DROP TABLE IF EXISTS workouts;
    DROP TABLE IF EXISTS profile;
    `)
  }, [])

    initDatabase() 

  return (
    <ScrollView>
      <Text>Check console for database test logs.</Text>
    </ScrollView>
  )
}