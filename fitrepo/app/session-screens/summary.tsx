import { Text, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ButtonComponent } from '@/components/button-component';
import { useWorkoutHistory } from '@/hooks/use-history-entry';
import { AppColors, AppRadius, AppSpacing } from '@/constants/styles';

export default function Summary() {
  const { total, workout_id } = useLocalSearchParams<{ total: string; workout_id: string }>();
  const { history, loading } = useWorkoutHistory(workout_id ?? '');

  const totalSetsLogged = history.length;
  const totalReps = history.reduce((sum, e) => sum + (e.reps ?? 0), 0);
  const totalTime = history.reduce((sum, e) => sum + (e.time_seconds ?? 0), 0);

  return (
    <LinearGradient
      colors={['#854d0e', '#151718']}
      style={styles.container}
    >
      <Text style={styles.header}>Complete</Text>

      <View style={styles.contentSection}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Workout Finished!</Text>
        {total ? (
          <Text style={styles.subtitle}>
            {total} exercise{Number(total) !== 1 ? 's' : ''} completed
          </Text>
        ) : null}

        {/* Stats from history */}
        {!loading && totalSetsLogged > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalSetsLogged}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            {totalReps > 0 && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{totalReps}</Text>
                <Text style={styles.statLabel}>Reps</Text>
              </View>
            )}
            {totalTime > 0 && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{Math.floor(totalTime / 60)}m {totalTime % 60}s</Text>
                <Text style={styles.statLabel}>Time</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <ButtonComponent
          onPress={() => router.replace('/(tabs)/session')}
          text="Back to Home"
        />
      </View>

      <Text style={styles.hint}>Great work! 💪</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: AppSpacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    color: AppColors.text,
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
    opacity: 0.9,
    textAlign: 'center',
  },
  contentSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    color: AppColors.text,
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: AppColors.text,
    fontSize: 18,
    opacity: 0.6,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 32,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    color: AppColors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    color: AppColors.text,
    fontSize: 12,
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: AppSpacing.lg,
  },
  hint: {
    color: AppColors.text,
    fontSize: 14,
    opacity: 0.4,
  },
});