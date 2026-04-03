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
      <View style={styles.sessionCard}>
        <Text style={styles.sessionLabel}>Previous Workout</Text>
        <Text style={styles.sessionTitle}>{previousWorkout}</Text>
        <Text style={styles.sessionDate}>{previousWorkoutDate ? previousWorkoutDate.toLocaleDateString() : "No previous workout"}</Text>
      </View>

      {/* General Stats */}
      <View className="mb-30">
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
    color: '#aaa',
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
    backgroundColor: '#232323',
    width: '48%',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: 'rgb(241,106,111)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  signOutText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 24,
  },
});