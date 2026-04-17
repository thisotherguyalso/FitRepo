import { TouchableOpacity, Text, StyleSheet, TextInput, Alert, View, ScrollView } from 'react-native';
import { useState, useMemo } from 'react';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ButtonComponent } from '@/components/button-component';
import { useLocalSearchParams, router } from 'expo-router';
import { useWorkouts } from '@/hooks/use-workouts';
import { useExercises } from '@/hooks/use-exercises';
import { AppColors, AppRadius, AppSpacing, sharedStyles, useAppColors } from '@/constants/styles';
import { LinearGradient } from 'expo-linear-gradient';

type SelectedExercise = {
  exercise_id: string;
  name: string;
  type: 'reps' | 'timed';
  sets: string;
  reps: string;
  time_seconds: string;
  weight: string;
  order_index: number;
};

export default function ExerciseSelection() {
  const { date, name } = useLocalSearchParams<{
    date?: string;
    name?: string;
  }>();

  const { exercises, loading: exercisesLoading } = useExercises();
  const { planWorkout, loading } = useWorkouts();
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [search, setSearch] = useState('');

  const readableDate = new Date(date as string).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });

  const filteredExercises = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed) return exercises;
    return exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(trimmed)
    );
  }, [search, exercises]);

  function addExercise(exercise: { id: string; name: string; type: string }) {
    const exists = selectedExercises.some((item) => item.exercise_id === exercise.id);
    if (exists) {
      Alert.alert('Error', 'That exercise is already in the workout.');
      return;
    }

    setSelectedExercises((prev) => [
      ...prev,
      {
        exercise_id: exercise.id,
        name: exercise.name,
        type: exercise.type === 'timed' ? 'timed' : 'reps',
        sets: '',
        reps: '',
        time_seconds: '',
        weight: '',
        order_index: prev.length,
      },
    ]);
  }

  function removeExercise(exercise_id: string) {
    setSelectedExercises((prev) =>
      prev
        .filter((item) => item.exercise_id !== exercise_id)
        .map((item, index) => ({ ...item, order_index: index }))
    );
  }

  function updateExerciseField(
    exercise_id: string,
    field: keyof SelectedExercise,
    value: string
  ) {
    setSelectedExercises((prev) =>
      prev.map((item) =>
        item.exercise_id === exercise_id ? { ...item, [field]: value } : item
      )
    );
  }

  async function handleSaveWorkout() {
    try {
      if (!date) throw new Error('No workout date was provided.');
      if (!name) throw new Error('No workout name was provided.');
      if (selectedExercises.length === 0) {
        throw new Error('Please choose at least one exercise.');
      }

      await planWorkout({
        name: name,
        performed_at: date,
        is_finished: false,
        exercises: selectedExercises.map((exercise, index) => ({
          exercise_id: exercise.exercise_id,
          sets: exercise.type === 'reps' ? Number(exercise.sets) || null : null,
          reps: exercise.type === 'reps' ? Number(exercise.reps) || null : null,
          time_seconds: exercise.type === 'timed' ? Number(exercise.time_seconds) || null : null,
          weight: Number(exercise.weight) || null,
          order_index: index,
        })),
      });

      Alert.alert('Success', 'Workout created successfully!');
      router.replace('/(tabs)/workouts');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  const colors = useAppColors();

  return (
    <View style={[styles.wrapper, {backgroundColor: colors.background}]}>
      <ParallaxScrollView>
        <LinearGradient
          colors={[colors.primary, colors.background]}
          style={sharedStyles.background}
        />

        {/* Header */}
        <Text style={[styles.header, {color: "#fff"}]}>{name}</Text>
        <Text style={[styles.subheader, {color: colors.textAccent2}]}>{readableDate}</Text>

        {/* Search */}
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Find Exercises</Text>
        <TextInput
          style={[styles.searchInput, {backgroundColor: colors.panel, color: colors.text}]}
          placeholder="Search exercises..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        {/* Available Exercises */}
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Available Exercises</Text>
        <View style={[styles.listContainer, {backgroundColor: colors.surface}]}>
          {exercisesLoading ? (
            <Text style={[styles.emptyText, {color: colors.textSubtle}]}>Loading exercises...</Text>
          ) : filteredExercises.length === 0 ? (
            <Text style={[styles.emptyText, {color: colors.textSubtle}]}>No matching exercises found.</Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator nestedScrollEnabled>
              {filteredExercises.map((exercise) => {
                const alreadySelected = selectedExercises.some(
                  (item) => item.exercise_id === exercise.id
                );

                return (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[styles.listRow, {backgroundColor: colors.surfaceAlt}, alreadySelected && styles.listRowSelected]}
                    onPress={() => addExercise(exercise)}
                    disabled={alreadySelected}
                  >
                    <View style={styles.listRowContent}>
                      <Text style={[styles.listRowTitle, {color: colors.text}]}>{exercise.name}</Text>
                      <Text style={[styles.listRowType, {color: colors.textAccent}]}>
                        {exercise.type === 'timed' ? 'Timed' : 'Reps'}
                      </Text>
                    </View>
                    <Text style={[styles.addText, {color: colors.textAccent}]}>
                      {alreadySelected ? 'Added' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Selected Exercises */}
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Selected Exercises</Text>
        {selectedExercises.length === 0 ? (
          <View style={[styles.emptyCard, {backgroundColor: colors.panel}]}>
            <Text style={[styles.emptyText, {color: colors.textSubtle}]}>No exercises selected yet.</Text>
          </View>
        ) : (
          selectedExercises.map((exercise) => (
            <View key={exercise.exercise_id} style={[styles.card, {backgroundColor: colors.panel}]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, {color: colors.text}]}>{exercise.name}</Text>
                <View style={[{overflow: 'hidden', borderWidth: 1, borderColor: exercise.type === 'timed' ? colors.accent1Border : colors.accent2Border}, styles.typeBadge]}>
                  <LinearGradient
                    colors={[exercise.type === 'timed' ? colors.accent1Alt : colors.accent2Alt, exercise.type === 'timed'? colors.accent1 : colors.accent2]}
                    style={[sharedStyles.background, {height: 25}]}
                  />
                  <Text style={[styles.typeBadgeText, {color: '#fff'}]}>
                    {exercise.type === 'timed' ? 'Timed' : 'Reps'}
                  </Text>
                </View>
              </View>

              {exercise.type === 'reps' ? (
                <>
                  <TextInput
                    style={[styles.input, {backgroundColor: colors.surfaceAlt, color: colors.text}]}
                    placeholder="Sets"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={exercise.sets}
                    onChangeText={(value) =>
                      updateExerciseField(exercise.exercise_id, 'sets', value)
                    }
                  />
                  <TextInput
                    style={[styles.input, {backgroundColor: colors.surfaceAlt, color: colors.text}]}
                    placeholder="Reps"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={exercise.reps}
                    onChangeText={(value) =>
                      updateExerciseField(exercise.exercise_id, 'reps', value)
                    }
                  />
                </>
              ) : (
                <TextInput
                  style={[styles.input, {backgroundColor: colors.surfaceAlt, color: colors.text}]}
                  placeholder="Time in seconds"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={exercise.time_seconds}
                  onChangeText={(value) =>
                    updateExerciseField(exercise.exercise_id, 'time_seconds', value)
                  }
                />
              )}

              <TextInput
                style={[styles.input, {backgroundColor: colors.surfaceAlt, color: colors.text}]}
                placeholder="Weight (optional)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={exercise.weight}
                onChangeText={(value) =>
                  updateExerciseField(exercise.exercise_id, 'weight', value)
                }
              />

              <ButtonComponent
                onPress={() => removeExercise(exercise.exercise_id)}
                text="Remove"
                style={styles.removeButton}
              />
            </View>
          ))
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <ButtonComponent
            onPress={handleSaveWorkout}
            text={loading ? 'Saving Workout...' : 'Save Workout'}
            style={styles.saveButton}
          />
          <ButtonComponent
            onPress={() => router.back()}
            text="Back"
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
    backgroundColor: AppColors.background,
  },
  header: {
    color: AppColors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheader: {
    color: AppColors.textAccent2,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  searchInput: {
    backgroundColor: AppColors.panel,
    color: AppColors.text,
    padding: 14,
    borderRadius: AppRadius.md,
    marginBottom: 16,
    fontSize: 16,
  },
  listContainer: {
    maxHeight: 280,
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 8,
    marginBottom: 16,
  },
  listRow: {
    backgroundColor: AppColors.surfaceAlt,
    borderRadius: AppRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listRowSelected: {
    opacity: 0.5,
  },
  listRowContent: {
    flex: 1,
  },
  listRowTitle: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  listRowType: {
    color: AppColors.textAccent,
    fontSize: 12,
    marginTop: 2,
  },
  addText: {
    color: AppColors.secondary,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: AppColors.panel,
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: AppColors.textSubtle,
    fontSize: 15,
    opacity: 0.5,
  },
  card: {
    backgroundColor: AppColors.panel,
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  typeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: AppRadius.md,
  },
  typeBadgeTimed: {
    backgroundColor: AppColors.accent1Alt,
  },
  typeBadgeText: {
    color: AppColors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    color: AppColors.text,
    padding: 14,
    borderRadius: AppRadius.md,
    marginBottom: 10,
    fontSize: 16,
  },
  removeButton: {
    padding: 14,
    borderRadius: AppRadius.md,
    alignItems: 'center',
    marginTop: 4,
  },
  actions: {
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  saveButton: {
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
  backButton: {
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
});