import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useHomeStats } from '@/hooks/use-home-stats';
import { useAuth } from '@/hooks/use-auth';
import { AppColors, AppRadius, AppSpacing, sharedStyles } from '@/constants/styles';
import { ButtonComponent } from '@/components/button-component';

export default function Home() {
  const { userName, currentStreak, totalWorkouts, previousWorkout, previousWorkoutDate } = useHomeStats();
  const { signOut } = useAuth();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}
    >
      <LinearGradient
        colors={['#020975', '#0d0d12']}
        style={sharedStyles.background}
      />

      {/* Greeting */}
      <Text style={styles.greeting}>Hello, {userName}!</Text>

      {/* Previous Workout Card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>PREVIOUS WORKOUT</Text>
        <Text style={styles.workoutName}>{previousWorkout ?? 'None yet'}</Text>
        <Text style={styles.workoutDate}>
          {previousWorkoutDate ? previousWorkoutDate.toLocaleDateString() : 'Complete your first workout!'}
        </Text>
      </View>

      {/* Stats Section */}
      <Text style={styles.sectionTitle}>Stats Overview</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalWorkouts}</Text>
          <Text style={styles.statLabel}>Total Workouts</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <ButtonComponent
        onPress={signOut}
        text="Sign Out"
        style={styles.signOutButton}
        textStyle={styles.signOutText}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  greeting: {
    color: AppColors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1c1c1f',
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    marginBottom: 24,
  },
  cardLabel: {
    color: AppColors.text,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    opacity: 0.5,
    marginBottom: 8,
  },
  workoutName: {
    color: '#93c5fd',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  workoutDate: {
    color: AppColors.text,
    fontSize: 14,
    opacity: 0.5,
  },
  sectionTitle: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor:  '#1c1c1f',
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
  statValue: {
    color: AppColors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: AppColors.text,
    fontSize: 13,
    opacity: 0.5,
  },
  signOutButton: {
    backgroundColor: '#7f1d1d',
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
  signOutText: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});