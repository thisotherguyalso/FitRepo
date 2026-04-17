import { StyleSheet, TextInput, Alert, View, Text } from 'react-native';
import { useState } from 'react';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ButtonComponent } from '@/components/button-component';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppColors, AppColors, AppRadius, AppSpacing, sharedStyles } from '@/constants/styles';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreateWorkout() {
  const { date } = useLocalSearchParams();
  const [workoutName, setWorkoutName] = useState('');

  const colors = useAppColors();

  const readableDate = new Date(date as string).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  function handleContinue() {
    try {
      if (!date) throw new Error('No workout date was provided.');
      if (!workoutName.trim()) throw new Error('Please enter a workout name.');

      router.push({
        pathname: '/exercise_selection',
        params: {
          date: date as string,
          name: workoutName.trim(),
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  function handleLoadPreset() {
    try {
      if (!date) throw new Error('No workout date was provided.');

      router.push({
        pathname: '/preset_list',
        params: {
          date: date as string,
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  return (
    <View style={styles.wrapper}>
      <ParallaxScrollView>
        <LinearGradient
          colors={[colors.primary, colors.background]}
          style={sharedStyles.background}
        />

        {/* Header */}
        <Text style={styles.header}>Create Workout</Text>
        <Text style={[styles.subheader, {color: colors.textAccent2}]}>{readableDate}</Text>

        {/* Workout Name Card */}
        <View style={[{backgroundColor: colors.surface}, styles.card]}>
          <Text style={[styles.cardLabel, {color: colors.textMuted}]}>WORKOUT NAME</Text>
          <TextInput
            style={[styles.input, {backgroundColor: colors.surfaceAlt, color: colors.text} ]}
            placeholder="Enter workout name"
            placeholderTextColor={colors.textMuted}
            value={workoutName}
            onChangeText={setWorkoutName}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <ButtonComponent text="Choose Exercises" onPress={handleContinue} />
          <ButtonComponent
            text="Load from Preset"
            onPress={handleLoadPreset}
            style={styles.secondaryButton}
          />
          <ButtonComponent
            text="Back to Workouts"
            onPress={() => router.push('/(tabs)/workouts')}
            style={styles.backButton}
          />
        </View>
      </ParallaxScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0d0d12',
  },
  header: {
    color: AppColors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    textAlign: 'center',
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
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#141417',
    color: AppColors.text,
    padding: 16,
    borderRadius: AppRadius.md,
    fontSize: 16,
  },
  actions: {
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#7f1d1d',
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
    marginBottom: 12,
  },
});