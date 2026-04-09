import { useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useTodaySession } from '@/hooks/use-today-session';
import { ButtonComponent } from '@/components/button-component';
import { AppColors, AppRadius, AppSpacing, sharedStyles } from '@/constants/styles';

export default function SessionTab() {
  const { session, loading, reload } = useTodaySession();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [])
  );

  function startSession() {
    if (!session || session.exercises.length === 0) return;

    const first = session.exercises[0];
    const allExercises = JSON.stringify(session.exercises);

    router.push({
      pathname: first.type === 'timed'
        ? '/session-screens/timer'
        : '/session-screens/reps',
      params: {
        exercises: allExercises,
        currentIndex: '0',
        workout_id: session.workout_id,
      },
    });
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}
    >
      <LinearGradient
        colors={['#020975', '#0d0d12']}
        style={sharedStyles.background}
      />

      {/* Header */}
      <Text style={styles.header}>Today's Session</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      ) : !session ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Rest Day</Text>
          <Text style={styles.emptyText}>No workout planned for today.</Text>
        </View>
      ) : (
        <>
          {/* Workout Name Card */}
          <View style={styles.workoutCard}>
            <Text style={styles.workoutLabel}>WORKOUT</Text>
            <Text style={styles.workoutName}>{session.workout_name}</Text>
            <Text style={styles.exerciseCount}>
              {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Exercise List */}
          <View style={styles.exerciseList}>
            {session.exercises.map((ex, i) => (
              <View key={ex.workout_exercise_id} style={styles.exerciseRow}>
                <View style={styles.indexBadge}>
                  <Text style={styles.exerciseIndex}>{i + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {ex.type === 'timed'
                      ? `${ex.sets} set${ex.sets !== 1 ? 's' : ''} · ${ex.time_seconds}s`
                      : `${ex.sets} × ${ex.reps} reps${ex.weight ? ` · ${ex.weight}kg` : ''}`}
                  </Text>
                </View>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>
                    {ex.type === 'timed' ? 'Timed' : 'Reps'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Start Button */}
          <ButtonComponent onPress={startSession} text="Start Session" />
        </>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    color: AppColors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  centered: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    color: AppColors.text,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: AppColors.text,
    fontSize: 16,
    opacity: 0.5,
  },
  workoutCard: {
    backgroundColor: '#1c1c1f',
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
    marginBottom: 24,
  },
  workoutLabel: {
    color: AppColors.text,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    opacity: 0.5,
    marginBottom: 8,
  },
  workoutName: {
    color: '#93c5fd',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  exerciseCount: {
    color: AppColors.text,
    fontSize: 14,
    opacity: 0.5,
  },
  exerciseList: {
    gap: 12,
    marginBottom: 24,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1f',
    padding: 14,
    borderRadius: AppRadius.md,
    gap: 14,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseIndex: {
    color: AppColors.text,
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.7,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseMeta: {
    color: AppColors.text,
    fontSize: 13,
    opacity: 0.5,
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: AppRadius.md,
  },
  typeText: {
    color: AppColors.text,
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
  },
});