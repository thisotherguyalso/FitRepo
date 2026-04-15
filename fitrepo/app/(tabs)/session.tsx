import { useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useTodaySession } from '@/hooks/use-today-session';
import { ButtonComponent } from '@/components/button-component';
import { useAppColors, AppColors, AppRadius, AppSpacing, sharedStyles } from '@/constants/styles';
import { supabase } from '@/lib/supabase'; // or your auth hook

export default function SessionTab() {
  const { session, loading, reload } = useTodaySession();
  const colors = useAppColors();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [])
  );

  async function startSession() {
    if (!session || session.exercises.length === 0) return;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
        user_id: user.id,
      },
    });
  }

  return (
    <ParallaxScrollView>
      <LinearGradient
        colors={[colors.primary, colors.background]}
        style={sharedStyles.background}
      />

      {/* Header */}
      <Text style={[styles.header, { color: '#fff' }]}>Today's Session</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      ) : !session ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, {color: colors.text}]}>Rest Day</Text>
          <Text style={[styles.emptyText, {color: colors.text}]}>No workout planned for today.</Text>
        </View>
      ) : session.completed ? (
        <View style={styles.emptyContainer}>
          <Text style={[{color: colors.text}, styles.emptyTitle]}>Great work! 💪</Text>
          <Text style={[{color: colors.textMuted}, styles.emptyText]}>
            You've completed today's workout,
            <Text style={styles.emptyWorkoutName}> {session.workout_name}</Text>.
          </Text>
        </View>
      ) : (
        <>
          {/* Workout Name Card */}
          <View style={[styles.workoutCard, {backgroundColor: colors.surface}]}>
            <Text style={[styles.workoutLabel, {color: colors.text}]}>WORKOUT</Text>
            <Text style={styles.workoutName}>{session.workout_name}</Text>
            <Text style={[styles.exerciseCount, {color: colors.text}]}>
              {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Exercise List */}
          <View style={styles.exerciseList}>
            {session.exercises.map((ex, i) => (
              <View key={ex.workout_exercise_id} style={[{backgroundColor: colors.panel}, styles.exerciseRow]}>
                <View style={[{backgroundColor: colors.panelAlt}, styles.indexBadge]}>
                  <Text style={[{color: colors.text}, styles.exerciseIndex]}>{i + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={[{color: colors.text}, styles.exerciseName]}>{ex.name}</Text>
                  <Text style={[{color: colors.text}, styles.exerciseMeta]}>
                    {ex.type === 'timed'
                      ? `${ex.sets} set${ex.sets !== 1 ? 's' : ''} · ${ex.time_seconds}s`
                      : `${ex.sets} × ${ex.reps} reps${ex.weight ? ` · ${ex.weight}kg` : ''}`}
                  </Text>
                </View>
                <View style={[{backgroundColor: colors.panelAlt}, styles.typeBadge]}>
                  <Text style={[{color: colors.text}, styles.typeText]}>
                    {ex.type === 'timed' ? 'Timed' : 'Reps'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Start Button */}
          <ButtonComponent
            onPress={startSession}
            text="Start Session"
          />
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
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
  },
  emptyWorkoutName: {
    color: '#93c5fd',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  workoutCard: {
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
    padding: 14,
    borderRadius: AppRadius.md,
    gap: 14,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseIndex: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.7,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: 13,
    opacity: 0.5,
  },
  typeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: AppRadius.md,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
  },
});