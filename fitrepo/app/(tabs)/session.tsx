// app/(tabs)/session.tsx
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { sharedStyles } from '@/constants/styles';
import { useTodaySession } from '@/hooks/use-today-session';
import { ButtonComponent } from '@/components/button-component'

export default function SessionTab() {
  const { session, loading } = useTodaySession();

  function startSession() {
    if (!session || session.exercises.length === 0) return;

    const first = session.exercises[0];
    const allExercises = JSON.stringify(session.exercises);

    router.push({
      pathname: first.type === 'timed'
        ? '/session-screens/timer'
        : '/session-screens/reps',
      params: {
        exercises: allExercises,   // full list so each screen knows what's next
        currentIndex: '0',
        workout_id: session.workout_id,
      },
    });
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
      <LinearGradient
        colors={['#020975fb', '#151718']}
        style={sharedStyles.background} />

      <View style={styles.sessionCard}>
        <Text style={styles.sessionLabel}>Session for Today</Text>

        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : !session ? (
          <Text style={styles.emptyText}>No workout planned for today.</Text>
        ) : (
          <>
            <Text style={styles.workoutName}>{session.workout_name}</Text>

            {/* Exercise preview list */}
            {session.exercises.map((ex, i) => (
              <View key={ex.workout_exercise_id} style={styles.exerciseRow}>
                <Text style={styles.exerciseIndex}>{i + 1}</Text>
                <View>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {ex.type === 'timed'
                      ? `${ex.sets} set${ex.sets !== 1 ? 's' : ''} · ${ex.time_seconds}s`
                      : `${ex.sets} × ${ex.reps} reps${ex.weight ? ` @ ${ex.weight}kg` : ''}`}
                  </Text>
                </View>
              </View>
            ))}
            
            <ButtonComponent onPress={startSession} text="Start Session" />

          </>
        )}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  sessionCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  sessionLabel: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#93c5fd',
    marginBottom: 20,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  exerciseIndex: {
    color: '#555',
    fontSize: 18,
    fontWeight: '700',
    width: 24,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  exerciseMeta: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 2,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  buttonStyle: {
    backgroundColor: 'rgb(30,133,247)',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  },
});