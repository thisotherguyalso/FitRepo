import { Alert, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, UIManager, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ButtonComponent } from '@/components/button-component'
import { useWorkoutExercises } from '@/hooks/use-workout-exercises'
import { useExercises } from '@/hooks/use-exercises'
import { useWorkoutHistory } from '@/hooks/use-history-entry'
import { getWorkout, updateWorkout } from '@/lib/api/workouts'
import { addExerciseToWorkout, clearWorkoutExercises } from '@/lib/api/workoutExercises'
import { createWorkoutPreset } from '@/lib/api/workoutPresets'
import { addExerciseToPreset } from '@/lib/api/presetExercises'
import {
  createEditableExerciseGroup,
  createEditableSet,
  flattenEditableExercises,
  mapWorkoutExercisesToEditableGroups,
  type EditableExerciseGroup,
} from '@/lib/workout-editor'
import { Workout, type HistoryEntry } from '@/types/database'
import { AppColors, AppRadius, sharedStyles, useAppColors } from '@/constants/styles'

export default function ViewWorkout() {
  const params = useLocalSearchParams<{ workout_id?: string | string[] }>()
  const workoutId = Array.isArray(params.workout_id) ? params.workout_id[0] : params.workout_id
  const colors = useAppColors()

  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loadingWorkout, setLoadingWorkout] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draftWorkoutName, setDraftWorkoutName] = useState('')
  const [editedExercises, setEditedExercises] = useState<EditableExerciseGroup[]>([])
  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')
  const [showPresetSave, setShowPresetSave] = useState(false)
  const [presetName, setPresetName] = useState('')

  const { exercises, loading: loadingExercises, loadExercises } = useWorkoutExercises(workoutId ?? '')
  const { exercises: allExercises, loading: loadingAllExercises } = useExercises()
  const { history } = useWorkoutHistory(workoutId ?? '')

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }, [])

  const loadWorkout = useCallback(async () => {
    setLoadingWorkout(true)
    try {
      const data = await getWorkout(workoutId as string)
      setWorkout(data)
    } catch (error: any) {
      console.error(error.message)
      setWorkout(null)
    } finally {
      setLoadingWorkout(false)
    }
  }, [workoutId])

  useEffect(() => {
    if (!workoutId) return
    void loadWorkout()
  }, [workoutId, loadWorkout])

  useEffect(() => {
    if (!workout) return
    setDraftWorkoutName(workout.name)
  }, [workout])

  useEffect(() => {
    // workout_exercises comes back as flat rows, so regroup it here before the editor touches it
    setEditedExercises(mapWorkoutExercisesToEditableGroups(exercises))
  }, [exercises])

  useEffect(() => {
    setCollapsedExercises((prev) => {
      const next: Record<string, boolean> = {}

      for (const exercise of editedExercises) {
        // keep whatever fold state the user already picked, even after add/remove/set edits
        next[exercise.exercise_id] = prev[exercise.exercise_id] ?? false
      }

      return next
    })
  }, [editedExercises])

  const historyByExercise = useMemo(() => {
    const grouped: Record<string, HistoryEntry[]> = {}

    for (const entry of history) {
      if (!grouped[entry.exercise_id]) {
        grouped[entry.exercise_id] = []
      }
      grouped[entry.exercise_id].push(entry)
    }

    for (const exerciseId of Object.keys(grouped)) {
      grouped[exerciseId].sort((a, b) => a.set_number - b.set_number)
    }

    return grouped
  }, [history])

  const filteredExercisesToAdd = useMemo(() => {
    const existingIds = new Set(editedExercises.map((exercise) => exercise.exercise_id))
    const trimmed = search.trim().toLowerCase()

    return allExercises.filter((exercise) => {
      if (existingIds.has(exercise.id)) return false
      if (!trimmed) return true
      return exercise.name.toLowerCase().includes(trimmed)
    })
  }, [allExercises, editedExercises, search])

  const readableDate = workout?.performed_at
    ? new Date(`${workout.performed_at}T00:00:00`).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  function handleCancelEdit() {
    setIsEditing(false)
    setDraftWorkoutName(workout?.name ?? '')
    setSearch('')
    setEditedExercises(mapWorkoutExercisesToEditableGroups(exercises))
  }

  function addExercise(exercise: { id: string; name: string; type: string }) {
    if (!workout) return

    setEditedExercises((prev) => [
      ...prev,
      createEditableExerciseGroup({
        ...exercise,
        workout_id: workout.id,
      }),
    ])
    setCollapsedExercises((prev) => ({ ...prev, [exercise.id]: false }))
    setSearch('')
  }

  function removeExercise(exerciseId: string) {
    setEditedExercises((prev) => prev.filter((exercise) => exercise.exercise_id !== exerciseId))
    setCollapsedExercises((prev) => {
      const next = { ...prev }
      delete next[exerciseId]
      return next
    })
  }

  function toggleExerciseCollapse(exerciseId: string) {
    // same trick as create flow. not fancy, just enough to make the accordion feel expensive.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCollapsedExercises((prev) => ({ ...prev, [exerciseId]: !prev[exerciseId] }))
  }

  function addSet(exerciseId: string) {
    setEditedExercises((prev) =>
      prev.map((exercise) =>
        exercise.exercise_id === exerciseId
          ? {
              ...exercise,
              sets: [
                ...exercise.sets,
                // same deal as create flow: every set is its own row under the hood, so make a fresh draft slot
                createEditableSet(exercise.type, {}, exercise.exercise_id, exercise.sets.length),
              ],
            }
          : exercise
      )
    )
  }

  function removeSet(exerciseId: string, setId: string) {
    setEditedExercises((prev) =>
      prev
        .map((exercise) => {
          if (exercise.exercise_id !== exerciseId) return exercise
          return {
            ...exercise,
            sets: exercise.sets.filter((set) => set.id !== setId),
          }
        })
        .filter((exercise) => exercise.sets.length > 0)
    )
  }

  function updateSetField(
    exerciseId: string,
    setId: string,
    field: 'reps' | 'time_seconds' | 'weight',
    value: string
  ) {
    setEditedExercises((prev) =>
      prev.map((exercise) =>
        exercise.exercise_id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)),
            }
          : exercise
      )
    )
  }

  async function handleSaveChanges() {
    try {
      if (!workout) throw new Error('Workout not found.')
      if (!draftWorkoutName.trim()) throw new Error('Workout name cannot be empty.')

      setSaving(true)

      await updateWorkout(workout.id, { name: draftWorkoutName.trim() })
      // diffing per-set rows here gets ugly fast once the same exercise shows up multiple times, so we just rebuild it clean
      await clearWorkoutExercises(workout.id)

      const flattened = flattenEditableExercises(workout.id, editedExercises)

      for (const exercise of flattened) {
        await addExerciseToWorkout(workout.id, exercise.exercise_id, {
          sets: exercise.sets,
          reps: exercise.reps,
          time_seconds: exercise.time_seconds,
          weight: exercise.weight,
          order_index: exercise.order_index,
        })
      }

      await loadWorkout()
      await loadExercises()
      setIsEditing(false)
      Alert.alert('Success', 'Workout updated successfully.')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleFinished() {
    try {
      if (!workout) throw new Error('Workout not found.')
      setSaving(true)
      await updateWorkout(workout.id, { is_finished: !workout.is_finished })
      await loadWorkout()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAsPreset() {
    try {
      if (!workout) throw new Error('Workout not found.')

      const finalPresetName = presetName.trim() || workout.name
      if (!finalPresetName) throw new Error('Preset name cannot be empty.')

      setSaving(true)
      const preset = await createWorkoutPreset({ name: finalPresetName })

      // using the raw workout rows here on purpose so presets keep the exact per-set structure
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
      )

      Alert.alert('Success', 'Preset saved successfully.')
      setShowPresetSave(false)
      setPresetName('')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setSaving(false)
    }
  }

  function renderExerciseSets(exercise: EditableExerciseGroup) {
    return exercise.sets.map((set, index) => (
      <View
        key={set.id}
        style={[styles.setCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
      >
        <View style={styles.setHeader}>
          <Text style={[styles.setLabel, { color: colors.textAccent }]}>Set {index + 1}</Text>
          {isEditing && exercise.sets.length > 1 ? (
            <Pressable onPress={() => removeSet(exercise.exercise_id, set.id)}>
              <Text style={[styles.removeSetText, { color: colors.danger }]}>Delete</Text>
            </Pressable>
          ) : (
            <View />
          )}
        </View>

        {isEditing ? (
          <View style={styles.setInputRow}>
            {exercise.type === 'reps' ? (
              <TextInput
                style={[styles.setInput, { backgroundColor: colors.panel, color: colors.text, borderColor: colors.border }]}
                placeholder="Reps"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={set.reps}
                onChangeText={(value) => updateSetField(exercise.exercise_id, set.id, 'reps', value)}
              />
            ) : (
              <TextInput
                style={[styles.setInput, { backgroundColor: colors.panel, color: colors.text, borderColor: colors.border }]}
                placeholder="Seconds"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={set.time_seconds}
                onChangeText={(value) => updateSetField(exercise.exercise_id, set.id, 'time_seconds', value)}
              />
            )}
            <TextInput
              style={[styles.setInput, { backgroundColor: colors.panel, color: colors.text, borderColor: colors.border }]}
              placeholder="Weight"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={set.weight}
              onChangeText={(value) => updateSetField(exercise.exercise_id, set.id, 'weight', value)}
            />
          </View>
        ) : (
          <View style={styles.readOnlySetMeta}>
            {exercise.type === 'reps' ? (
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {set.reps ? `${set.reps} reps` : 'Open reps'}
              </Text>
            ) : (
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {set.time_seconds ? `${set.time_seconds}s` : 'Open time'}
              </Text>
            )}
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {set.weight ? `${set.weight}kg` : 'Bodyweight'}
            </Text>
          </View>
        )}
      </View>
    ))
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ParallaxScrollView>
        {loadingWorkout || loadingExercises ? (
          <Text style={[styles.emptyText, { color: colors.textSubtle }]}>Loading workout...</Text>
        ) : !workout ? (
          <Text style={[styles.emptyText, { color: colors.textSubtle }]}>Workout not found.</Text>
        ) : (
          <>
            <View style={[sharedStyles.card, styles.heroCard, { backgroundColor: colors.tabBar, borderColor: colors.border }]}>
              {isEditing ? (
                <TextInput
                  style={[sharedStyles.input, styles.titleInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  value={draftWorkoutName}
                  onChangeText={setDraftWorkoutName}
                  placeholder="Workout name"
                  placeholderTextColor={colors.textMuted}
                />
              ) : (
                <Text style={[styles.header, { color: colors.text }]}>{workout.name}</Text>
              )}
              <Text style={[styles.subheader, { color: colors.textMuted }]}>{readableDate}</Text>
              <View style={styles.heroMeta}>
                <View style={[styles.heroChip, { backgroundColor: colors.panelStrong }]}>
                  <Text style={[styles.heroChipText, { color: colors.text }]}>
                    {editedExercises.length} exercises
                  </Text>
                </View>
                <View style={[styles.heroChip, { backgroundColor: workout.is_finished ? colors.accent1Alt : colors.accent2Alt }]}>
                  <Text style={[styles.heroChipText, { color: colors.text }]}>
                    {workout.is_finished ? 'Completed' : 'Planned'}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Exercise groups</Text>
            {editedExercises.length === 0 ? (
              <View style={[sharedStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.emptyText, { color: colors.textSubtle }]}>No exercises added yet.</Text>
              </View>
            ) : (
              editedExercises.map((exercise) => (
                <View
                  key={exercise.id}
                  style={[sharedStyles.card, styles.exerciseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.exerciseHeader}>
                    <Pressable style={styles.exerciseHeaderCopy} onPress={() => toggleExerciseCollapse(exercise.exercise_id)}>
                      <View style={styles.exerciseTitleRow}>
                        <Text style={[styles.exerciseTitle, { color: colors.text }]}>{exercise.name}</Text>
                        <Ionicons
                          name={collapsedExercises[exercise.exercise_id] ? 'chevron-down' : 'chevron-up'}
                          size={20}
                          color={colors.textMuted}
                        />
                      </View>
                      <Text style={[styles.exerciseSubtitle, { color: colors.textMuted }]}>
                        {exercise.type === 'timed' ? 'Interval block' : 'Strength block'} • {exercise.sets.length} sets
                      </Text>
                    </Pressable>
                    {isEditing ? (
                      <View style={styles.exerciseHeaderActions}>
                        <Pressable
                          style={[styles.smallAction, { backgroundColor: colors.panelStrong }]}
                          onPress={() => addSet(exercise.exercise_id)}
                        >
                          <Text style={[styles.smallActionText, { color: colors.text }]}>+ Set</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.smallAction, { backgroundColor: colors.overlay }]}
                          onPress={() => removeExercise(exercise.exercise_id)}
                        >
                          <Text style={[styles.smallActionText, { color: colors.textMuted }]}>Remove</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>

                  {!collapsedExercises[exercise.exercise_id] ? renderExerciseSets(exercise) : (
                    <View style={[styles.collapsedHint, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
                      <Text style={[styles.collapsedHintText, { color: colors.textMuted }]}>
                        {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'} hidden for now. Tap the header if you want the full block.
                      </Text>
                    </View>
                  )}

                  {!collapsedExercises[exercise.exercise_id] && !isEditing && workout.is_finished && historyByExercise[exercise.exercise_id]?.length ? (
                    <View style={styles.historyStack}>
                      {historyByExercise[exercise.exercise_id].map((entry) => (
                        <View
                          key={entry.id}
                          style={[styles.historyRow, { backgroundColor: colors.overlay, borderColor: colors.border }]}
                        >
                          <Text style={[styles.historySetLabel, { color: colors.textAccent }]}>Completed set {entry.set_number}</Text>
                          <Text style={[styles.historyMetaText, { color: colors.textMuted }]}>
                            {entry.reps ? `${entry.reps} reps` : entry.time_seconds ? `${entry.time_seconds}s` : 'No log'}
                            {entry.weight ? ` • ${entry.weight}kg` : ''}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              ))
            )}

            {isEditing ? (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Add another exercise</Text>
                <TextInput
                  style={[sharedStyles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="Search exercises"
                  placeholderTextColor={colors.textMuted}
                  value={search}
                  onChangeText={setSearch}
                />
                <View style={[sharedStyles.card, styles.libraryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {loadingAllExercises ? (
                    <Text style={[styles.emptyText, { color: colors.textSubtle }]}>Loading...</Text>
                  ) : filteredExercisesToAdd.length === 0 ? (
                    <Text style={[styles.emptyText, { color: colors.textSubtle }]}>No exercises found.</Text>
                  ) : (
                    <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                      {filteredExercisesToAdd.map((exercise) => (
                        <Pressable
                          key={exercise.id}
                          style={({ pressed }) => [
                            styles.libraryRow,
                            {
                              backgroundColor: colors.surfaceAlt,
                              borderColor: colors.border,
                              opacity: pressed ? 0.92 : 1,
                            },
                          ]}
                          onPress={() => addExercise(exercise)}
                        >
                          <Text style={[styles.libraryTitle, { color: colors.text }]}>{exercise.name}</Text>
                          <Text style={[styles.libraryAddText, { color: colors.textAccent }]}>Add</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </>
            ) : null}

            <View style={styles.actions}>
              {isEditing ? (
                <>
                  <ButtonComponent onPress={handleSaveChanges} text={saving ? 'Saving...' : 'Save changes'} />
                  <ButtonComponent
                    onPress={handleCancelEdit}
                    text="Cancel"
                    style={{ backgroundColor: colors.secondary }}
                  />
                </>
              ) : (
                <>
                  <ButtonComponent onPress={() => setIsEditing(true)} text="Edit workout" />
                  <ButtonComponent
                    onPress={() => {
                      setPresetName(workout.name)
                      setShowPresetSave((prev) => !prev)
                    }}
                    text="Save as preset"
                    style={{ backgroundColor: colors.secondary }}
                  />

                  {showPresetSave ? (
                    <View style={[sharedStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <TextInput
                        style={[sharedStyles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                        placeholder="Preset name"
                        placeholderTextColor={colors.textMuted}
                        value={presetName}
                        onChangeText={setPresetName}
                      />
                      <View style={{ height: 12 }} />
                      <ButtonComponent
                        onPress={handleSaveAsPreset}
                        text={saving ? 'Saving preset...' : 'Confirm preset save'}
                      />
                    </View>
                  ) : null}

                  <ButtonComponent
                    onPress={handleToggleFinished}
                    text={saving ? 'Updating...' : workout.is_finished ? 'Mark as planned' : 'Mark as finished'}
                    style={{ backgroundColor: workout.is_finished ? colors.warning : colors.success }}
                  />
                </>
              )}

              <ButtonComponent onPress={() => router.back()} text="Back" style={{ backgroundColor: colors.secondary }} />
            </View>
          </>
        )}
      </ParallaxScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  heroCard: {
    gap: 10,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subheader: {
    fontSize: 15,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  heroChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: AppRadius.pill,
  },
  heroChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  exerciseCard: {
    gap: 14,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  exerciseHeaderCopy: {
    flex: 1,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  exerciseHeaderActions: {
    gap: 8,
    alignItems: 'flex-end',
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  exerciseSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  smallAction: {
    borderRadius: AppRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  setCard: {
    borderRadius: AppRadius.md,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  setLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  removeSetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  setInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: AppRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  readOnlySetMeta: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyStack: {
    gap: 8,
    marginTop: 4,
  },
  historyRow: {
    borderWidth: 1,
    borderRadius: AppRadius.md,
    padding: 12,
  },
  historySetLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyMetaText: {
    fontSize: 13,
    marginTop: 4,
  },
  collapsedHint: {
    borderWidth: 1,
    borderRadius: AppRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  collapsedHintText: {
    fontSize: 14,
    lineHeight: 20,
  },
  libraryCard: {
    maxHeight: 260,
    padding: 10,
  },
  libraryRow: {
    borderWidth: 1,
    borderRadius: AppRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  libraryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  libraryAddText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
})
