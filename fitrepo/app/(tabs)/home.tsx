import ParallaxScrollView from '@/components/parallax-scroll-view';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useHomeStats } from '@/hooks/use-home-stats';
import { useAuth } from '@/hooks/use-auth';
import { AppColors, sharedStyles } from '@/constants/styles';

export default function Home() {
  const { userName, currentStreak, totalWorkouts, previousWorkout, previousWorkoutDate } = useHomeStats()
  const { signOut } = useAuth()

  return (
    <ParallaxScrollView 
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
      
      {/* Greeting */}
      <Text style={[sharedStyles.title, styles.greeting]}>Hello, {userName}!</Text>

      {/* Previous Workout */}
      <View style={[sharedStyles.card, styles.sessionCard]}>
        <Text style={[sharedStyles.mutedText, styles.sessionLabel]}>Previous Workout</Text>
        <Text style={styles.sessionTitle}>{previousWorkout}</Text>
        <Text style={[sharedStyles.mutedText, styles.sessionDate]}>{previousWorkoutDate ? previousWorkoutDate.toLocaleDateString() : "No previous workout"}</Text>
      </View>

      {/* General Stats */}
      <View className="mb-30">
        <Text style={[sharedStyles.sectionTitle, styles.sectionTitle]}>Stats Overview</Text>

        <View style={styles.row}>
          <View style={[sharedStyles.card, styles.wideCard]}>
            <Text style={styles.statValue}>{totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>

          <View style={[sharedStyles.card, styles.wideCard]}>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
        </View>
      </View>

    {/* Sign Out Button */}
    <TouchableOpacity style={[sharedStyles.button, styles.signOutButton]} onPress={signOut}>
      <Text style={[sharedStyles.buttonText, styles.signOutText]}>Sign Out</Text>
    </TouchableOpacity>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'left',
  },
  sessionCard: {
    marginBottom: 30,
  },
  sessionLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  sessionTitle: {
    color: AppColors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  sessionDate: {
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statValue: {
    color: AppColors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: AppColors.textMuted,
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wideCard: {
    width: '48%',
    alignItems: 'center',
    padding: 25,
    backgroundColor: AppColors.surfaceAlt,
  },
  signOutButton: {
    backgroundColor: AppColors.danger,
    marginBottom: 20,
  },
  signOutText: {
    fontSize: 24,
  },
});
