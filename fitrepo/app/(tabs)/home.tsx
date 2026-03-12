import ParallaxScrollView from '@/components/parallax-scroll-view';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useHomeStats } from '@/hooks/use-home-stats';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { userName, currentStreak, totalWorkouts, previousWorkout, previousWorkoutDate, loading } = useHomeStats()
  const { signOut } = useAuth()

  return (
    <ParallaxScrollView 
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
      
      {/* Greeting */}
      <Text style={styles.greeting}>Hello, {userName}!</Text>

      {/* Previous Workout */}
      <TouchableOpacity style={styles.sessionCard}>
        <Text style={styles.sessionLabel}>Previous Workout</Text>
        <Text style={styles.sessionTitle}>{previousWorkout}</Text>
        <Text style={styles.sessionDate}>{previousWorkoutDate ? previousWorkoutDate.toLocaleDateString() : "No previous workout"}</Text>
      </TouchableOpacity>

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

    <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
    <Text style={styles.signOutText}>Sign Out</Text>
    </TouchableOpacity>

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
  signOutButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  signOutText: {
    color: '#ff4444',
    fontWeight: '600',
    fontSize: 16,
  },
});