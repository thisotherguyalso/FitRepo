import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useHomeStats } from '@/hooks/use-home-stats';
import { useAuth } from '@/hooks/use-auth';
import { useAppColors, AppRadius, AppSpacing, sharedStyles } from '@/constants/styles';
import { ButtonComponent } from '@/components/button-component';

export default function Home() {
  const { userName, currentStreak, totalWorkouts, previousWorkout, previousWorkoutDate } = useHomeStats();
  const { signOut } = useAuth();
  const colors = useAppColors();

  return (
    <ParallaxScrollView>
      <LinearGradient
        colors={[colors.primary, colors.background]}
        style={sharedStyles.background}
      />

      <Text style={[styles.greeting, { color: colors.text }]}>Hello, {userName}!</Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardLabel, { color: colors.text }]}>PREVIOUS WORKOUT</Text>
        <Text style={styles.workoutName}>{previousWorkout ?? 'None yet'}</Text>
        <Text style={[styles.workoutDate, { color: colors.textMuted }]}>
          {previousWorkoutDate ? previousWorkoutDate.toLocaleDateString() : 'Complete your first workout!'}
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Stats Overview</Text>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{totalWorkouts}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Workouts</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{currentStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Current Streak</Text>
        </View>
      </View>

      <ButtonComponent
        onPress={signOut}
        text="Sign Out"
        style={[{backgroundColor: colors.signOut}, styles.signOutButton]}
        textStyle={{ color: '#fff' }}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  card: {
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    marginBottom: 24,
  },
  cardLabel: {
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
    fontSize: 14,
    opacity: 0.5,
  },
  sectionTitle: {
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
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.5,
  },
  signOutButton: {
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
});