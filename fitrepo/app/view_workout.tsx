import { Text, StyleSheet, View, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useEffect, useMemo, useState } from 'react';
import { getWorkout, updateWorkout } from '@/lib/api/workouts';
import { updateWorkoutExercise, addExerciseToWorkout, removeExerciseFromWorkout } from '@/lib/api/workoutExercises';
import { useWorkoutExercises } from '@/hooks/use-workout-exercises';
import { useExercises } from '@/hooks/use-exercises';
import { Workout } from '@/types/database';
import { createWorkoutPreset } from '@/lib/api/workoutPresets';
import { addExerciseToPreset } from '@/lib/api/presetExercises';
import { AppColors, AppRadius, AppSpacing, sharedStyles } from '@/constants/styles';
import { LinearGradient } from 'expo-linear-gradient';
import { ButtonComponent } from '@/components/button-component';
import {
  EditableExercise,
  mapWorkoutExercisesToEditable,
  toNullableNumber,
} from '@/lib/workout-editor';

export default function ViewWorkout() {
  const params = useLocalSearchParams<{ workout_id?: string | string[] }>();
  const workout_id = Array.isArray(params.workout_id)
    ? params.workout_id[0]
    : params.workout_id;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(false);

  const {
    exercises,
    loading: loadingExercises,
    loadExercises,
  } = useWorkoutExercises(workout_id ?? '');

  const { exercises: allExercises, loading: loadingAllExercises } = useExercises();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftWorkoutName, setDraftWorkoutName] = useState('');
  const [editedExercises, setEditedExercises] = useState<EditableExercise[]>([]);
  const [search, setSearch] = useState('');
  const [showPresetSave, setShowPresetSave] = useState(false);
  const [presetName, setPresetName] = useState('');

  const readableDate = workout?.performed_at
    ? new Date(`${workout.performed_at}T00:00:00`).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  useEffect(() => {
    if (!workout_id) return;
    void loadWorkout();
  }, [workout_id]);

  useEffect(() => {
    if (!workout) return;
    setDraftWorkoutName(workout.name);
  }, [workout]);

  useEffect(() => {
    setEditedExercises(mapWorkoutExercisesToEditable(exercises));
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

  const filteredExercisesToAdd = useMemo(() => {
    const existingIds = new Set(editedExercises.map((e) => e.exercise_id));
    const trimmed = search.trim().toLowerCase();

    return allExercises.filter((exercise) => {
      if (existingIds.has(exercise.id)) return false;
      if (!trimmed) return true;
      return exercise.name.toLowerCase().includes(trimmed);
    });
  }, [allExercises, editedExercises, search]);

  function updateExerciseField(id: string, field: keyof EditableExercise, value: string) {
    setEditedExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === id ? { ...exercise, [field]: value } : exercise
      )
    );
  }

  async function handleAddExercise(exercise: { id: string; name: string }) {
    if (!workout) {
      Alert.alert('Error', 'Workout not found.');
      return;
    }

    const alreadyExists = editedExercises.some((item) => item.exercise_id === exercise.id);
    if (alreadyExists) return;

    setEditedExercises((prev) => [
      ...prev,
      {
        id: `new-${exercise.id}`,
        workout_id: workout.id,
        exercise_id: exercise.id,
        name: exercise.name,
        sets: '',
        reps: '',
        time_seconds: '',
        weight: '',
      },
    ]);
    setSearch('');
  }

  function handleRemoveExercise(exercise_id: string) {
    setEditedExercises((prev) =>
      prev.filter((exercise) => exercise.exercise_id !== exercise_id)
    );
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setDraftWorkoutName(workout?.name ?? '');
    setSearch('');
    setEditedExercises(mapWorkoutExercisesToEditable(exercises));
  }

  async function handleSaveChanges() {
    try {
      if (!workout) throw new Error('Workout not found.');
      if (!draftWorkoutName.trim()) throw new Error('Workout name cannot be empty.');

      setSaving(true);

      await updateWorkout(workout.id, { name: draftWorkoutName.trim() });

      const originalExerciseIds = new Set(exercises.map((e: any) => e.exercise_id));
      const editedExerciseIds = new Set(editedExercises.map((e) => e.exercise_id));

      const removedExercises = exercises.filter(
        (e: any) => !editedExerciseIds.has(e.exercise_id)
      );

      await Promise.all(
        removedExercises.map((e: any) =>
          removeExerciseFromWorkout(e.exercise_id, workout.id)
        )
      );

      const newExercises = editedExercises.filter(
        (e) => !originalExerciseIds.has(e.exercise_id)
      );

      await Promise.all(
        newExercises.map((exercise, index) =>
          addExerciseToWorkout(workout.id, exercise.exercise_id, {
            sets: toNullableNumber(exercise.sets),
            reps: toNullableNumber(exercise.reps),
            time_seconds: toNullableNumber(exercise.time_seconds),
            weight: toNullableNumber(exercise.weight),
            order_index: index,
          })
        )
      );

      const existingExercises = editedExercises.filter((e) =>
        originalExerciseIds.has(e.exercise_id)
      );

      await Promise.all(
        existingExercises.map((exercise) =>
          updateWorkoutExercise(exercise.workout_id, exercise.exercise_id, {
            sets: toNullableNumber(exercise.sets),
            reps: toNullableNumber(exercise.reps),
            time_seconds: toNullableNumber(exercise.time_seconds),
            weight: toNullableNumber(exercise.weight),
          })
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
      await updateWorkout(workout.id, { is_finished: !workout.is_finished });
      await loadWorkout();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAsPreset() {
    try {
      if (!workout) throw new Error('Workout not found.');

      const finalPresetName = presetName.trim() || workout.name;
      if (!finalPresetName) throw new Error('Preset name cannot be empty.');

      setSaving(true);

      const preset = await createWorkoutPreset({ name: finalPresetName });

      await Promise.all(
        exercises.map((exercise: any, index: number) =>
          addExerciseToPreset(preset.id, exercise.exercise_id, {
            sets: exercise.sets ?? null,
            reps: exercise.reps ?? null,
            time_seconds: exercise.time_seconds ?? null,
            weight: exercise.weight ?? null,
            order_index: index,
          })
        )
      );

      Alert.alert('Success', 'Preset saved successfully.');
      setShowPresetSave(false);
      setPresetName('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
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

        <View style={styles.container}>
          {loadingWorkout || loadingExercises ? (
            <Text style={styles.emptyText}>Loading workout...</Text>
          ) : !workout ? (
            <Text style={styles.emptyText}>Workout not found.</Text>
          ) : (
            <>
              {/* Header */}
              {isEditing ? (
                <TextInput
                  style={styles.titleInput}
                  value={draftWorkoutName}
                  onChangeText={setDraftWorkoutName}
                  placeholder="Workout name"
                  placeholderTextColor="#666"
                />
              ) : (
                <Text style={styles.header}>{workout.name}</Text>
              )}

              <Text style={styles.subheader}>{readableDate}</Text>

              {/* Status Badge */}
              <View style={[styles.statusBadge, workout.is_finished && styles.statusBadgeFinished]}>
                <Text style={styles.statusText}>
                  {workout.is_finished ? 'Completed' : 'Planned'}
                </Text>
              </View>

              {/* Exercises */}
              <Text style={styles.sectionTitle}>Exercises</Text>

              {editedExercises.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No exercises added yet.</Text>
                </View>
              ) : (
                editedExercises.map((exercise) => (
                  <View key={exercise.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{exercise.name}</Text>

                    {isEditing ? (
                      <>
                        <TextInput
                          style={styles.input}
                          placeholder="Sets"
                          placeholderTextColor="#666"
                          keyboardType="numeric"
                          value={exercise.sets}
                          onChangeText={(v) => updateExerciseField(exercise.id, 'sets', v)}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Reps"
                          placeholderTextColor="#666"
                          keyboardType="numeric"
                          value={exercise.reps}
                          onChangeText={(v) => updateExerciseField(exercise.id, 'reps', v)}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Time (seconds)"
                          placeholderTextColor="#666"
                          keyboardType="numeric"
                          value={exercise.time_seconds}
                          onChangeText={(v) => updateExerciseField(exercise.id, 'time_seconds', v)}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Weight"
                          placeholderTextColor="#666"
                          keyboardType="numeric"
                          value={exercise.weight}
                          onChangeText={(v) => updateExerciseField(exercise.id, 'weight', v)}
                        />
                        <ButtonComponent
                          onPress={() => handleRemoveExercise(exercise.exercise_id)}
                          text="Remove"
                          style={styles.removeButton}
                        />
                      </>
                    ) : (
                      <View style={styles.metaRow}>
                        {exercise.sets && <Text style={styles.metaText}>{exercise.sets} sets</Text>}
                        {exercise.reps && <Text style={styles.metaText}>{exercise.reps} reps</Text>}
                        {exercise.time_seconds && <Text style={styles.metaText}>{exercise.time_seconds}s</Text>}
                        {exercise.weight && <Text style={styles.metaText}>{exercise.weight}kg</Text>}
                      </View>
                    )}
                  </View>
                ))
              )}

              {/* Add Exercise (when editing) */}
              {isEditing && (
                <>
                  <Text style={styles.sectionTitle}>Add Exercise</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search exercises..."
                    placeholderTextColor="#666"
                    value={search}
                    onChangeText={setSearch}
                  />
                  <View style={styles.listContainer}>
                    {loadingAllExercises ? (
                      <Text style={styles.emptyText}>Loading...</Text>
                    ) : filteredExercisesToAdd.length === 0 ? (
                      <Text style={styles.emptyText}>No exercises found.</Text>
                    ) : (
                      <ScrollView showsVerticalScrollIndicator nestedScrollEnabled>
                        {filteredExercisesToAdd.map((exercise) => (
                          <TouchableOpacity
                            key={exercise.id}
                            style={styles.listRow}
                            onPress={() => handleAddExercise(exercise)}
                          >
                            <Text style={styles.listRowTitle}>{exercise.name}</Text>
                            <Text style={styles.addText}>Add</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                {isEditing ? (
                  <>
                    <ButtonComponent
                      onPress={handleSaveChanges}
                      text={saving ? 'Saving...' : 'Save Changes'}
                      style={styles.saveButton}
                    />
                    <ButtonComponent
                      onPress={handleCancelEdit}
                      text="Cancel"
                      style={styles.cancelButton}
                    />
                  </>
                ) : (
                  <>
                    <ButtonComponent
                      onPress={() => setIsEditing(true)}
                      text="Edit Workout"
                      style={styles.editButton}
                    />

                    <ButtonComponent
                      onPress={() => {
                        setPresetName(workout.name);
                        setShowPresetSave((prev) => !prev);
                      }}
                      text="Save as Preset"
                      style={styles.presetButton}
                    />

                    {showPresetSave && (
                      <View style={styles.presetCard}>
                        <TextInput
                          style={styles.input}
                          placeholder="Preset name"
                          placeholderTextColor="#666"
                          value={presetName}
                          onChangeText={setPresetName}
                        />
                        <ButtonComponent
                          onPress={handleSaveAsPreset}
                          text={saving ? 'Saving...' : 'Confirm Save'}
                          style={styles.saveButton}
                        />
                      </View>
                    )}

                    <ButtonComponent
                      onPress={handleToggleFinished}
                      text={saving ? 'Updating...' : workout.is_finished ? 'Mark as Planned' : 'Mark as Finished'}
                      style={workout.is_finished ? styles.markPlannedButton : styles.markFinishedButton}
                    />
                  </>
                )}

                <ButtonComponent onPress={() => router.back()} text="Back" />
              </View>
            </>
          )}
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
  container: {
    flex: 1,
  },
  header: {
    color: AppColors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#1c1c1f',
    color: AppColors.text,
    padding: 16,
    borderRadius: AppRadius.lg,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheader: {
    color: '#93c5fd',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'center',
    backgroundColor: '#1c1c1f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: AppRadius.md,
    marginBottom: 24,
  },
  statusBadgeFinished: {
    backgroundColor: '#166534',
  },
  statusText: {
    color: AppColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
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
  cardTitle: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaText: {
    color: AppColors.text,
    fontSize: 14,
    opacity: 0.6,
  },
  input: {
    backgroundColor: '#141417',
    color: AppColors.text,
    padding: 14,
    borderRadius: AppRadius.md,
    marginBottom: 10,
    fontSize: 16,
  },
  searchInput: {
    backgroundColor: '#1c1c1f',
    color: AppColors.text,
    padding: 14,
    borderRadius: AppRadius.md,
    marginBottom: 12,
    fontSize: 16,
  },
  listContainer: {
    maxHeight: 200,
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
  listRowTitle: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  addText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '700',
  },
  presetCard: {
    backgroundColor: '#1c1c1f',
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    marginBottom: 12,
  },
  actions: {
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#166534',
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#7f1d1d',
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#7f1d1d',
    padding: 14,
    borderRadius: AppRadius.md,
    alignItems: 'center',
    marginTop: 4,
  },
  presetButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
  markFinishedButton: {
    backgroundColor: '#166534',
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
  markPlannedButton: {
    backgroundColor: '#b45309',
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
  },
});