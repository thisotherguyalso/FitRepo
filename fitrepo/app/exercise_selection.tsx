import { TouchableOpacity, Text, StyleSheet, TextInput, Alert, View, ScrollView } from 'react-native';
import { useState, useMemo } from 'react';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useLocalSearchParams, router } from 'expo-router';
import { useWorkouts } from '@/hooks/use-workouts';
import { useExercises } from '@/hooks/use-exercises';
import { sharedStyles } from '@/constants/styles';
import { LinearGradient } from 'expo-linear-gradient';

type SelectedExercise = {
  exercise_id: string;
  name: string;
  sets: string;
  reps: string;
  time_seconds: string;
  weight: string;
  order_index: number;
};

export default function ExerciseSelection() {
  const { date, name, mode } = useLocalSearchParams<{
    date?: string
    name?: string
    mode?: string
  }>(); // retrieve params from create_workout.tsx

  const { exercises, loading: exercisesLoading } = useExercises(); // get all exercises
  const { planWorkout, loading } = useWorkouts(); // create workout in database
  // store exercises
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [search, setSearch] = useState('');

  const readableDate = new Date(date as string).toLocaleDateString(
    undefined,
    { month: 'long', day: 'numeric' }
  );

  // filters available exercises based on the search bar text.
  // useMemo avoids recalculating on every render unless dependencies change.
  const filteredExercises = useMemo(() => {
    const trimmed = search.trim().toLowerCase();

    if (!trimmed) return exercises;

    return exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(trimmed)
    );
  }, [search, exercises]);

  function addExercise(exercise: { id: string; name: string }) {
    const exists = selectedExercises.some(
      (item) => item.exercise_id === exercise.id
    );

    if (exists) {
      Alert.alert('Error', 'That exercise is already in the workout.');
      return;
    }

    setSelectedExercises((prev) => [
      ...prev,
      {
        exercise_id: exercise.id,
        name: exercise.name,
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
        .map((item, index) => ({
          ...item,
          order_index: index,
        }))
    );
  }

  // updates any field (sets, reps, time, weight)
  function updateExerciseField(
    exercise_id: string,
    field: keyof SelectedExercise,
    value: string
  ) {

    // loops through exercises and updates the correct one
    setSelectedExercises((prev) =>
      prev.map((item) =>
        item.exercise_id === exercise_id
          ? { ...item, [field]: value } // update the field
          : item
      )
    );
  }

  // Saves the workout to the database.
  async function handleSaveWorkout() {

    try {

      if (!date) throw new Error('No workout date was provided.');
      if (!name) throw new Error('No workout name was provided.');
      if (!mode) throw new Error('No workout mode was provided.');
      if (selectedExercises.length === 0) {
        throw new Error('Please choose at least one exercise.');
      }

      await planWorkout({
        name: name,
        performed_at: date,
        is_finished: false,

        // Convert input strings to numbers for the database.
        exercises: selectedExercises.map((exercise, index) => ({
          exercise_id: exercise.exercise_id,

          sets: mode === 'Rep based'
            ? Number(exercise.sets) || null
            : null,

          reps: mode === 'Rep based'
            ? Number(exercise.reps) || null
            : null,

          time_seconds: mode === 'Time based'
            ? Number(exercise.time_seconds) || null
            : null,

          weight: Number(exercise.weight) || null,

          order_index: index
        }))
      });

      Alert.alert('Success', 'Workout created successfully!');
      router.replace('/(tabs)/workouts');

    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
      <LinearGradient
        colors={['#020975fb', '#151718']}
        style={sharedStyles.background}
      />
      <View style={styles.container}>
        <Text style={styles.headerText}>
          {name} for {'\n'}{readableDate}
        </Text>

        <Text style={styles.sectionTitle}>Find Exercises</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />

        <Text style={styles.sectionTitle}>Available Exercises</Text>

        <View style={styles.listContainer}>
          {exercisesLoading ? (
            <Text style={styles.emptyText}>Loading exercises...</Text>
          ) : filteredExercises.length === 0 ? (
            <Text style={styles.emptyText}>No matching exercises found.</Text>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
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
                    <View>
                      <Text style={styles.listRowTitle}>{exercise.name}</Text>
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

        <Text style={styles.sectionTitle}>Selected Exercises</Text>

        {selectedExercises.length === 0 ? (
          <Text style={styles.emptyText}>No exercises selected yet.</Text>
        ) : (
          selectedExercises.map((exercise) => (
            <View key={exercise.exercise_id} style={styles.card}>
              <Text style={styles.cardTitle}>{exercise.name}</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Sets"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={exercise.sets}
                  onChangeText={(value) =>
                    updateExerciseField(exercise.exercise_id, 'sets', value)
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Reps"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={exercise.reps}
                  onChangeText={(value) =>
                    updateExerciseField(exercise.exercise_id, 'reps', value)
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Time in seconds"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={exercise.time_seconds}
                  onChangeText={(value) =>
                    updateExerciseField(exercise.exercise_id, 'time_seconds', value)
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Weight (optional)"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={exercise.weight}
                  onChangeText={(value) =>
                    updateExerciseField(exercise.exercise_id, 'weight', value)
                  }
                />

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeExercise(exercise.exercise_id)}
              >
                <Text style={styles.buttonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveWorkout}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving Workout...' : 'Save Workout'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            router.back();
          }}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
    lineHeight: 36,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 12,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  listContainer: {
    maxHeight: 320,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 8,
    marginBottom: 12,
  },
  listRow: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listRowSelected: {
    opacity: 0.5,
  },
  listRowTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  listRowSubtitle: {
    color: '#93c5fd',
    fontSize: 13,
    marginTop: 2,
  },
  addText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#93c5fd',
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#7f1d1d',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#020975',
    padding: 18,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#c62b2b',
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  exerciseButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  exerciseButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
