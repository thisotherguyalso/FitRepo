import ParallaxScrollView from '@/components/parallax-scroll-view';
import React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { getWorkouts, getWorkout, createWorkout, updateWorkout, deleteWorkout } from '@/lib/api/workouts'
import { getExercises, getExercise } from '@/lib/api/exercises'
import { getExercisesInWorkout, getExerciseInWorkout, addExerciseToWorkout, updateWorkoutExercise, removeExerciseFromWorkout } from '@/lib/api/workoutExercises'
import { getWorkoutPresets, getWorkoutPreset, createWorkoutPreset, updateWorkoutPreset, deleteWorkoutPreset } from '@/lib/api/workoutPresets'
import { getExercisesInPreset, getExerciseInPreset, addExerciseToPreset, updatePresetExercise, removeExerciseFromPreset } from '@/lib/api/presetExercises'
import { getProfile, updateProfile } from '@/lib/api/profiles'

export default function Home() {
  const [userName, setUserName] = useState('');
  const [currentStreak, setcurrentStreak] = useState('');
  const [totalWorkouts, setTotalWorkouts] = useState<number | null>(0);
  const [previousWorkoutDate, setPreviousWorkoutDate] = useState<Date | null>();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        const { data: workout, count, error:workoutError } = await supabase.from('workouts').select('*', {count: 'exact'}).eq('id', user.id)
        console.log('raw profile data:', profile)
        console.log('raw workouts data:', workout)
        console.log('error:', profileError)
        setUserName(profile?.username ?? user.email ?? 'there')
        setcurrentStreak(profile?.current_streak ?? '0')
        setTotalWorkouts(count)
      }
    })
  }, [])

  return (
    <ParallaxScrollView 
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
      
      {/* Greeting */}
      <Text style={styles.greeting}>Hello, {userName}!</Text>

      {/* Previous Workout */}
      <TouchableOpacity style={styles.sessionCard}>
        <Text style={styles.sessionLabel}>Previous Workout</Text>
        <Text style={styles.sessionTitle}>Upper Body Strength</Text>
        <Text style={styles.sessionDate}>today</Text>
      </TouchableOpacity>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Records</Text>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>120kg</Text>
            <Text style={styles.statLabel}>Bench Press</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>180kg</Text>
            <Text style={styles.statLabel}>Deadlift</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>150kg</Text>
            <Text style={styles.statLabel}>Squat</Text>
          </View>
        </View>
      </View>

      {/* General Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats Overview</Text>

        <View style={styles.row}>
          <View style={styles.wideCard}>
            <Text style={styles.statValue}>{totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>

          <View style={styles.wideCard}>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
        </View>
      </View>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
  },
  sessionCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  sessionLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
  sessionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  sessionDate: {
    color: '#aaa',
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    width: '48%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
  },
  statValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: '#888',
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wideCard: {
    backgroundColor: '#1a1a1a',
    width: '48%',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
  },
});