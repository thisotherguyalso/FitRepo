import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useHomeStats } from '../../hooks/use-home-stats';
import { useAuth } from '@/hooks/use-auth';
import { useAppColors, AppRadius, AppSpacing, sharedStyles } from '@/constants/styles';
import { ButtonComponent } from '@/components/button-component';

export default function Home() {
  const { userName, currentStreak, totalWorkouts, previousWorkout, previousWorkoutDate, heightCm, bodyWeightKg } = useHomeStats();
  const { signOut } = useAuth();
  const colors = useAppColors();

  return (
    <ParallaxScrollView>
      <LinearGradient
        colors={[colors.primary, colors.secondary, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[sharedStyles.background, styles.heroGlow]}
      />

      <Pressable
        onPress={() => router.push('/profile' as any)}
        style={({ pressed }) => [styles.hero, { borderColor: colors.borderStrong, opacity: pressed ? 0.94 : 1 }]}
      >
        <Text style={[styles.greeting, { color: '#fff' }]}>Hello, {userName || 'athlete'}.</Text>
        <Text style={[styles.heroText, { color: 'rgba(255,255,255,0.82)' }]}>
          Quick pulse check before you train.
        </Text>
        <View style={styles.profileHintRow}>
          <Text style={[styles.profileHintText, { color: colors.textAccent2 }]}>Tap here to edit profile</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textAccent2} />
        </View>
      </Pressable>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardLabel, { color: colors.text }]}>PREVIOUS WORKOUT</Text>
        <Text style={[styles.workoutName, { color: colors.textAccent }]}>{previousWorkout ?? 'None yet'}</Text>
        <Text style={[styles.workoutDate, { color: colors.textMuted }]}>
          {previousWorkoutDate ? previousWorkoutDate.toLocaleDateString() : 'Complete your first workout!'}
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Stats Overview</Text>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{totalWorkouts}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Workouts</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{currentStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Current Streak</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.metricCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <View style={[styles.metricIcon, { backgroundColor: colors.panelStrong }]}>
            <Ionicons name="barbell-outline" size={18} color={colors.textAccent} />
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {bodyWeightKg != null ? `${bodyWeightKg} kg` : '--'}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Body Weight</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <View style={[styles.metricIcon, { backgroundColor: colors.panelStrong }]}>
            <Ionicons name="resize-outline" size={18} color={colors.textAccent} />
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {heightCm != null ? `${heightCm} cm` : '--'}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Height</Text>
        </View>
      </View>

      <ButtonComponent
        onPress={() => router.push('/profile' as any)}
        text="Edit Profile"
        style={[{ backgroundColor: colors.secondary }, styles.editProfileButton]}
      />

      <ButtonComponent
        onPress={signOut}
        text="Sign Out"
        style={[{backgroundColor: colors.signOut}, styles.signOutButton,]}
        textStyle={{ color: '#fff' }}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  heroGlow: {
    height: 290,
  },
  hero: {
    paddingTop: 12,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.8,
  },
  heroText: {
    fontSize: 15,
    lineHeight: 22,
  },
  profileHintRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileHintText: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    marginBottom: 24,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    opacity: 0.5,
    marginBottom: 8,
  },
  workoutName: {
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
    borderWidth: 1,
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
  metricCard: {
    flex: 1,
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    borderWidth: 1,
    gap: 10,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 13,
  },
  signOutButton: {
    padding: 16,
    alignItems: 'center',
  },
  editProfileButton: {
    marginBottom: 12,
  },
});
