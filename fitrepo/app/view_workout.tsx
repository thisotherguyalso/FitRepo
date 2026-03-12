import { Text, StyleSheet, View, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useEffect, useMemo, useState } from 'react';
import { getWorkout, updateWorkout } from '@/lib/api/workouts';
import {
  updateWorkoutExercise,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
} from '@/lib/api/workoutExercises';
import { useWorkoutExercises } from '@/hooks/use-workout-exercises';
import { useExercises } from '@/hooks/use-exercises';
import { Workout } from '@/types/database';

type EditableExercise = {
  id: string;
  workout_id: string;
  exercise_id: string;
  name: string;
  sets: string;
  reps: string;
  time_seconds: string;
  weight: string;
};

export default function ViewWorkout() {
  const params = useLocalSearchParams<{
    workout_id?: string | string[];
  }>();

  // router params can be string or string[], so normalize to one string
  const workout_id = Array.isArray(params.workout_id)
    ? params.workout_id[0]
    : params.workout_id;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(false);

  // existing exercises already attached to this workout
  const {
    exercises,
    loading: loadingExercises,
    loadExercises,
  } = useWorkoutExercises(workout_id ?? '');

  // all possible exercises in the database, used for adding new ones
  const { exercises: allExercises, loading: loadingAllExercises } = useExercises();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [draftWorkoutName, setDraftWorkoutName] = useState('');
  const [draftIsFinished, setDraftIsFinished] = useState(false);

  // local editable copy of the workout's current exercise rows
  const [editedExercises, setEditedExercises] = useState<EditableExercise[]>([]);

  // search bar for adding new exercises while editing
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!workout_id) return;
    void loadWorkout();

    // we only want to reload when the workout id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout_id]);

  // when the parent workout loads, sync editable fields.
  useEffect(() => {
    if (!workout) return;
    setDraftWorkoutName(workout.name);
    setDraftIsFinished(workout.is_finished);
  }, [workout]);

  // Convert fetched workout_exercise rows into editable text inputs.
  useEffect(() => {
    const mapped = exercises.map((exercise: any) => ({
      id: exercise.id,
      workout_id: exercise.workout_id,
      exercise_id: exercise.exercise_id,
      name: exercise.exercises?.name ?? 'Unnamed Exercise',
      sets: exercise.sets != null ? String(exercise.sets) : '',
      reps: exercise.reps != null ? String(exercise.reps) : '',
      time_seconds: exercise.time_seconds != null ? String(exercise.time_seconds) : '',
      weight: exercise.weight != null ? String(exercise.weight) : '',
    }));

    setEditedExercises(mapped);
  }, [exercises]);

  async function loadWorkout() {
    setLoadingWorkout(true);

    try {
      const data = await getWorkout(workout_id as string);
      setWorkout(data);
    } catch (error: any) {
      console.error(error.message);
      setWorkout(null);
    } finally {
      setLoadingWorkout(false);
    }
  }

  // Search results for "add exercise".
  // Also exclude exercises already in the workout so duplicates don't appear.
  const filteredExercisesToAdd = useMemo(() => {
    const existingIds = new Set(editedExercises.map((exercise) => exercise.exercise_id));
    const trimmed = search.trim().toLowerCase();

    return allExercises.filter((exercise) => {
      if (existingIds.has(exercise.id)) return false;
      if (!trimmed) return true;
      return exercise.name.toLowerCase().includes(trimmed);
    });
  }, [allExercises, editedExercises, search]);

  function updateExerciseField(
    id: string,
    field: keyof EditableExercise,
    value: string
  ) {
    setEditedExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === id
          ? { ...exercise, [field]: value }
          : exercise
      )
    );
  }

  async function handleAddExercise(exercise: { id: string; name: string }) {
    try {
      if (!workout) throw new Error('Workout not found.');

      // Add the selected exercise to the database with empty/default values first.
      await addExerciseToWorkout(workout.id, exercise.id, {
        sets: null,
        reps: null,
        time_seconds: null,
        weight: null,
        order_index: editedExercises.length,
      });

      await loadExercises();
      setSearch('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  async function handleRemoveExercise(exercise_id: string) {
    try {
      if (!workout) throw new Error('Workout not found.');

      await removeExerciseFromWorkout(exercise_id, workout.id);
      await loadExercises();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setDraftWorkoutName(workout?.name ?? '');
    setDraftIsFinished(workout?.is_finished ?? false);
    setSearch('');

    // Reset edited exercise state back to whatever was last loaded from DB.
    const mapped = exercises.map((exercise: any) => ({
      id: exercise.id,
      workout_id: exercise.workout_id,
      exercise_id: exercise.exercise_id,
      name: exercise.exercises?.name ?? 'Unnamed Exercise',
      sets: exercise.sets != null ? String(exercise.sets) : '',
      reps: exercise.reps != null ? String(exercise.reps) : '',
      time_seconds: exercise.time_seconds != null ? String(exercise.time_seconds) : '',
      weight: exercise.weight != null ? String(exercise.weight) : '',
    }));

    setEditedExercises(mapped);
  }

  async function handleSaveChanges() {
    try {
      if (!workout) throw new Error('Workout not found.');
      if (!draftWorkoutName.trim()) throw new Error('Workout name cannot be empty.');

      setSaving(true);

      // Save parent workout fields first.
      await updateWorkout(workout.id, {
        name: draftWorkoutName.trim(),
        is_finished: draftIsFinished,
      });

      // Save each child workout_exercise row.
      await Promise.all(
        editedExercises.map((exercise) =>
          updateWorkoutExercise(
            exercise.workout_id,
            exercise.exercise_id,
            {
              sets: exercise.sets.trim() ? Number(exercise.sets) : null,
              reps: exercise.reps.trim() ? Number(exercise.reps) : null,
              time_seconds: exercise.time_seconds.trim() ? Number(exercise.time_seconds) : null,
              weight: exercise.weight.trim() ? Number(exercise.weight) : null,
            }
          )
        )
      );

      await loadWorkout();
      await loadExercises();

      setIsEditing(false);
      Alert.alert('Success', 'Workout updated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleFinished() {
    try {
      if (!workout) throw new Error('Workout not found.');

      setSaving(true);

      const newStatus = !workout.is_finished;

      await updateWorkout(workout.id, {
        is_finished: newStatus,
      });

      await loadWorkout(); // refresh state
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  }
  
  const readableDate = workout?.performed_at
    ? new Date(`${workout.performed_at}T00:00:00`).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
      <View style={styles.container}>
        {loadingWorkout ? (
          <Text style={styles.emptyText}>Loading workout...</Text>
        ) : !workout ? (
          <Text style={styles.emptyText}>Workout not found.</Text>
        ) : (
          <>
            {isEditing ? (
              <TextInput
                style={styles.titleInput}
                value={draftWorkoutName}
                onChangeText={setDraftWorkoutName}
                placeholder="Workout name"
                placeholderTextColor="#888"
              />
            ) : (
              <Text style={styles.headerText}>{workout.name}</Text>
            )}

            <Text style={styles.subHeaderText}>{readableDate}</Text>

            {/* Planned / Finished status */}
            {isEditing ? (
              <View style={styles.statusRow}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    !draftIsFinished && styles.statusButtonSelected,
                  ]}
                  onPress={() => setDraftIsFinished(false)}
                >
                  <Text style={styles.buttonText}>Planned</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    draftIsFinished && styles.statusButtonSelected,
                  ]}
                  onPress={() => setDraftIsFinished(true)}
                >
                  <Text style={styles.buttonText}>Finished</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.statusText}>
                {workout.is_finished ? 'Finished' : 'Planned'}
              </Text>
            )}

            <Text style={styles.sectionTitle}>Exercises</Text>

            {loadingExercises ? (
              <Text style={styles.emptyText}>Loading exercises...</Text>
            ) : editedExercises.length === 0 ? (
              <Text style={styles.emptyText}>No exercises in this workout yet.</Text>
            ) : (
              editedExercises.map((exercise) => (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <Text style={styles.exerciseTitle}>{exercise.name}</Text>

                  {isEditing ? (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="Sets"
                        placeholderTextColor="#888"
                        keyboardType="numeric"
                        value={exercise.sets}
                        onChangeText={(value) =>
                          updateExerciseField(exercise.id, 'sets', value)
                        }
                      />

                      <TextInput
                        style={styles.input}
                        placeholder="Reps"
                        placeholderTextColor="#888"
                        keyboardType="numeric"
                        value={exercise.reps}
                        onChangeText={(value) =>
                          updateExerciseField(exercise.id, 'reps', value)
                        }
                      />

                      <TextInput
                        style={styles.input}
                        placeholder="Time in seconds"
                        placeholderTextColor="#888"
                        keyboardType="numeric"
                        value={exercise.time_seconds}
                        onChangeText={(value) =>
                          updateExerciseField(exercise.id, 'time_seconds', value)
                        }
                      />

                      <TextInput
                        style={styles.input}
                        placeholder="Weight in kilograms"
                        placeholderTextColor="#888"
                        keyboardType="numeric"
                        value={exercise.weight}
                        onChangeText={(value) =>
                          updateExerciseField(exercise.id, 'weight', value)
                        }
                      />

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveExercise(exercise.exercise_id)}
                      >
                        <Text style={styles.buttonText}>Remove Exercise</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      {exercise.sets && exercise.reps ? (
                        <Text style={styles.exerciseMeta}>
                          {exercise.sets} sets × {exercise.reps} reps
                        </Text>
                      ) : null}

                      {exercise.time_seconds ? (
                        <Text style={styles.exerciseMeta}>
                          {exercise.time_seconds} seconds
                        </Text>
                      ) : null}

                      {exercise.weight ? (
                        <Text style={styles.exerciseMeta}>
                          Weight: {exercise.weight}
                        </Text>
                      ) : null}
                    </>
                  )}
                </View>
              ))
            )}

            {/* Add more exercises while editing */}
            {isEditing && (
              <>
                <Text style={styles.sectionTitle}>Add Exercise</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Search exercises..."
                  placeholderTextColor="#888"
                  value={search}
                  onChangeText={setSearch}
                />

                <View style={styles.addListContainer}>
                  {loadingAllExercises ? (
                    <Text style={styles.emptyText}>Loading exercises...</Text>
                  ) : filteredExercisesToAdd.length === 0 ? (
                    <Text style={styles.emptyText}>No exercises found.</Text>
                  ) : (
                    <ScrollView nestedScrollEnabled>
                      {filteredExercisesToAdd.map((exercise) => (
                        <TouchableOpacity
                          key={exercise.id}
                          style={styles.addExerciseRow}
                          onPress={() => handleAddExercise(exercise)}
                        >
                          <Text style={styles.exerciseRowText}>{exercise.name}</Text>
                          <Text style={styles.addText}>Add</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </>
            )}

            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveChanges}
                  disabled={saving}
                >
                  <Text style={styles.buttonText}>
                    {saving ? 'Saving Changes...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelEdit}
                  disabled={saving}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>Edit Workout</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleToggleFinished}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving
                  ? 'Updating...'
                  : workout?.is_finished
                  ? 'Mark as Planned'
                  : 'Mark as Finished'}
              </Text>
          </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </>
        )}
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
    marginBottom: 8,
    lineHeight: 36,
  },
  titleInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 16,
    borderRadius: 16,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#93c5fd',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusText: {
    color: '#f5c842',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statusButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  statusButtonSelected: {
    backgroundColor: '#0a7ea4',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  exerciseTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  exerciseMeta: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  addListContainer: {
    maxHeight: 220,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
  },
  addExerciseRow: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseRowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  addText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: '#020975',
    padding: 18,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#0a7ea4',
    padding: 18,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#7f1d1d',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#7f1d1d',
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#1a1a1a',
    padding: 18,
    borderRadius: 16,
    marginTop: 4,
    marginBottom: 24,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  finishButton: {
    backgroundColor: '#16a34a',
    padding: 18,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
});