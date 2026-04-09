import { TouchableOpacity, Text, StyleSheet, TextInput, Alert, View, ScrollView } from 'react-native';
import { useState, useMemo } from 'react';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ButtonComponent } from '@/components/button-component';
import { useLocalSearchParams, router } from 'expo-router';
import { useWorkouts } from '@/hooks/use-workouts';
import { useExercises } from '@/hooks/use-exercises';
import { AppColors, AppRadius, AppSpacing, sharedStyles } from '@/constants/styles';
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

  return (
    <View style={styles.wrapper}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#00adccfa', dark: '#020975' }}
      >
        <LinearGradient
          colors={['#020975', '#0d0d12']}
          style={sharedStyles.background}
        />

        {/* Header */}
        <Text style={styles.header}>{name}</Text>
        <Text style={styles.subheader}>{readableDate}</Text>

        {/* Search */}
        <Text style={styles.sectionTitle}>Find Exercises</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />

        {/* Available Exercises */}
        <Text style={styles.sectionTitle}>Available Exercises</Text>
        <View style={styles.listContainer}>
          {exercisesLoading ? (
            <Text style={styles.emptyText}>Loading exercises...</Text>
          ) : filteredExercises.length === 0 ? (
            <Text style={styles.emptyText}>No matching exercises found.</Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator nestedScrollEnabled>
              {filteredExercises.map((exercise) => {
                const alreadySelected = selectedExercises.some(
                  (item) => item.exercise_id === exercise.id
                );

                return (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[styles.listRow, alreadySelected && styles.listRowSelected]}
                    onPress={() => addExercise(exercise)}
                    disabled={alreadySelected}
                  >
                    <View style={styles.listRowContent}>
                      <Text style={styles.listRowTitle}>{exercise.name}</Text>
                      <Text style={styles.listRowType}>
                        {exercise.type === 'timed' ? 'Timed' : 'Reps'}
                      </Text>
                    </View>
                    <Text style={styles.addText}>
                      {alreadySelected ? 'Added' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Selected Exercises */}
        <Text style={styles.sectionTitle}>Selected Exercises</Text>
        {selectedExercises.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No exercises selected yet.</Text>
          </View>
        ) : (
          selectedExercises.map((exercise) => (
            <View key={exercise.exercise_id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{exercise.name}</Text>
                <View style={[styles.typeBadge, exercise.type === 'timed' && styles.typeBadgeTimed]}>
                  <Text style={styles.typeBadgeText}>
                    {exercise.type === 'timed' ? 'Timed' : 'Reps'}
                  </Text>
                </View>
              </View>

              {exercise.type === 'reps' ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Sets"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={exercise.sets}
                    onChangeText={(value) =>
                      updateExerciseField(exercise.exercise_id, 'sets', value)
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Reps"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={exercise.reps}
                    onChangeText={(value) =>
                      updateExerciseField(exercise.exercise_id, 'reps', value)
                    }
                  />
                </>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Time in seconds"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={exercise.time_seconds}
                  onChangeText={(value) =>
                    updateExerciseField(exercise.exercise_id, 'time_seconds', value)
                  }
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Weight (optional)"
                placeholderTextColor="#666"
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
    color: '#93c5fd',
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
    backgroundColor: '#1c1c1f',
    color: AppColors.text,
    padding: 14,
    borderRadius: AppRadius.md,
    marginBottom: 16,
    fontSize: 16,
  },
  listContainer: {
    maxHeight: 280,
    backgroundColor: '#141417',
    borderRadius: AppRadius.lg,
    padding: 8,
    marginBottom: 16,
  },
  listRow: {
    backgroundColor: '#1c1c1f',
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
    color: '#93c5fd',
    fontSize: 12,
    marginTop: 2,
  },
  addText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#1c1c1f',
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: AppColors.text,
    fontSize: 15,
    opacity: 0.5,
  },
  card: {
    backgroundColor: '#1c1c1f',
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
    backgroundColor: '#3b82f6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: AppRadius.md,
  },
  typeBadgeTimed: {
    backgroundColor: '#166534',
  },
  typeBadgeText: {
    color: AppColors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#141417',
    color: AppColors.text,
    padding: 14,
    borderRadius: AppRadius.md,
    marginBottom: 10,
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#7f1d1d',
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
    backgroundColor: '#166534',
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#7f1d1d',
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
});