import { Alert, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, UIManager, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ButtonComponent } from '@/components/button-component'
import { ExerciseInfoPanel } from '@/components/exercise-info-panel'
import { SetComposerSheet } from '@/components/set-composer-sheet'
import { WorkoutSetEditor } from '@/components/workout-set-editor'
import { useWorkoutExercises } from '@/hooks/use-workout-exercises'
import { useExercises } from '@/hooks/use-exercises'
import { useWorkoutHistory } from '@/hooks/use-history-entry'
import { inferExerciseTags } from '@/lib/exercise-tags'
import { getWorkout, updateWorkout } from '@/lib/api/workouts'
import { addExerciseToWorkout, clearWorkoutExercises } from '@/lib/api/workoutExercises'
import { createWorkoutPreset } from '@/lib/api/workoutPresets'
import { addExerciseToPreset } from '@/lib/api/presetExercises'
import { getCurrentUserBodyWeightKg, resolveEffectiveWeight } from '@/lib/bodyweight'
import {
  createEditableExerciseGroup,
  createEditableSet,
  flattenEditableExercises,
  mapWorkoutExercisesToEditableGroups,
  type EditableExerciseGroup,
} from '@/lib/workout-editor'
import { Workout, type HistoryEntry } from '@/types/database'
import { AppColors, AppRadius, sharedStyles, useAppColors } from '@/constants/styles'

const MUSCLE_FILTERS = ['All', 'Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps', 'Quads', 'Hamstrings', 'Glutes', 'Core'] as const

export default function ViewWorkout() {
  const params = useLocalSearchParams<{ workout_id?: string | string[]; return_to?: string | string[] }>()
  const workoutId = Array.isArray(params.workout_id) ? params.workout_id[0] : params.workout_id
  const returnTo = Array.isArray(params.return_to) ? params.return_to[0] : params.return_to
  const colors = useAppColors()

  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loadingWorkout, setLoadingWorkout] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draftWorkoutName, setDraftWorkoutName] = useState('')
  const [editedExercises, setEditedExercises] = useState<EditableExerciseGroup[]>([])
  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({})
  const [showExerciseInfo, setShowExerciseInfo] = useState<Record<string, boolean>>({})
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<(typeof MUSCLE_FILTERS)[number]>('All')
  const [showPresetSave, setShowPresetSave] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presetIsPublic, setPresetIsPublic] = useState(false)
  const [bodyWeightKg, setBodyWeightKg] = useState<number | null>(null)
  const [activeComposer, setActiveComposer] = useState<{ exerciseId: string; setId?: string } | null>(null)

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
    void getCurrentUserBodyWeightKg().then(setBodyWeightKg)
  }, [])

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
      const tags = inferExerciseTags(exercise.name, exercise.description)
      const matchesFilter = selectedFilter === 'All' || tags.includes(selectedFilter)
      const matchesSearch =
        !trimmed ||
        exercise.name.toLowerCase().includes(trimmed) ||
        (exercise.description ?? '').toLowerCase().includes(trimmed) ||
        tags.some((tag) => tag.toLowerCase().includes(trimmed))

      return matchesFilter && matchesSearch
    })
  }, [allExercises, editedExercises, search, selectedFilter])

  const readableDate = workout?.performed_at
    ? new Date(`${workout.performed_at}T00:00:00`).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  const workoutSummary = useMemo(() => {
    return exercises.reduce(
      (summary, exercise: any) => {
        const effectiveWeight = resolveEffectiveWeight(exercise.weight, bodyWeightKg) ?? 0

        summary.totalSets += 1
        summary.totalVolume += (exercise.reps ?? 0) * effectiveWeight
        return summary
      },
      { totalSets: 0, totalVolume: 0 }
    )
  }, [bodyWeightKg, exercises])

  function formatVolume(volume: number) {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(volume >= 10000 ? 0 : 1)}k kg`
    }

    return `${volume} kg`
  }

  function handleCancelEdit() {
    setIsEditing(false)
    setDraftWorkoutName(workout?.name ?? '')
    setSearch('')
    setEditedExercises(mapWorkoutExercisesToEditableGroups(exercises))
  }

  function addExercise(exercise: { id: string; name: string; type: string; image_url?: string; description?: string }) {
    if (!workout) return

    setEditedExercises((prev) => [
      ...prev,
      createEditableExerciseGroup({
        ...exercise,
        workout_id: workout.id,
      }),
    ])
    setCollapsedExercises((prev) => ({ ...prev, [exercise.id]: false }))
    setShowExerciseInfo((prev) => ({ ...prev, [exercise.id]: false }))
    setShowExerciseLibrary(false)
    setSearch('')
    // same deal as create flow. adding an exercise with no sets feels broken because nothing persists.
    setActiveComposer({ exerciseId: exercise.id })
  }

  function removeExercise(exerciseId: string) {
    setEditedExercises((prev) => prev.filter((exercise) => exercise.exercise_id !== exerciseId))
    setCollapsedExercises((prev) => {
      const next = { ...prev }
      delete next[exerciseId]
      return next
    })
    setShowExerciseInfo((prev) => {
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

  function toggleExerciseInfo(exerciseId: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setShowExerciseInfo((prev) => ({ ...prev, [exerciseId]: !prev[exerciseId] }))
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

  function openAddSet(exerciseId: string) {
    setActiveComposer({ exerciseId })
  }

  function openEditSet(exerciseId: string, setId: string) {
    setActiveComposer({ exerciseId, setId })
  }

  function handleSaveSet(values: { reps: string; time_seconds: string; weight: string; set_notes: string }) {
    if (!activeComposer) return

    setEditedExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.exercise_id !== activeComposer.exerciseId) return exercise

        if (activeComposer.setId) {
          return {
            ...exercise,
            sets: exercise.sets.map((set) => (set.id === activeComposer.setId ? { ...set, ...values } : set)),
          }
        }

        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            createEditableSet(exercise.type, values, exercise.exercise_id, exercise.sets.length),
          ],
        }
      })
    )

    setActiveComposer(null)
  }

  async function handleSaveChanges() {
    try {
      if (!workout) throw new Error('Workout not found.')

      const fallbackWorkoutName = editedExercises[0]?.name?.trim()
      const finalWorkoutName = draftWorkoutName.trim() || fallbackWorkoutName

      if (!finalWorkoutName) {
        throw new Error('Workout needs at least one exercise so it has something to be named after.')
      }

      setSaving(true)

      await updateWorkout(workout.id, { name: finalWorkoutName })
      // diffing per-set rows here gets ugly fast once the same exercise shows up multiple times, so we just rebuild it clean
      await clearWorkoutExercises(workout.id)

      const flattened = flattenEditableExercises(workout.id, editedExercises)

      if (flattened.length === 0) {
        throw new Error('Add at least one set before saving the workout.')
      }

      for (const exercise of flattened) {
        await addExerciseToWorkout(workout.id, exercise.exercise_id, {
          reps: exercise.reps,
          time_seconds: exercise.time_seconds,
          weight: exercise.weight,
          set_notes: exercise.set_notes,
          order_index: exercise.order_index,
        })
      }

      await loadWorkout()
      await loadExercises()
      setIsEditing(false)
      setDraftWorkoutName(finalWorkoutName)
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
      const preset = await createWorkoutPreset({
        name: finalPresetName,
        is_public: presetIsPublic,
      })

      // using the raw workout rows here on purpose so presets keep the exact per-set structure
      await Promise.all(
        exercises.map((exercise: any, index: number) =>
          addExerciseToPreset(preset.id, exercise.exercise_id, {
          sets: 1,
          reps: exercise.reps ?? null,
          time_seconds: exercise.time_seconds ?? null,
          // don't bake the last used load into presets. let presets stay reusable templates.
          weight: null,
          order_index: index,
          })
        )
      )

      Alert.alert('Success', 'Preset saved successfully.')
      setShowPresetSave(false)
      setPresetName('')
      setPresetIsPublic(false)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setSaving(false)
    }
  }

  function renderExerciseSets(exercise: EditableExerciseGroup) {
    return (
      <WorkoutSetEditor
        exercise={exercise}
        editable={isEditing}
        onAddSet={() => openAddSet(exercise.exercise_id)}
        onEditSet={(setId) => openEditSet(exercise.exercise_id, setId)}
        onRemoveSet={(setId) => removeSet(exercise.exercise_id, setId)}
      />
    )
  }

  function handleBack() {
    if (returnTo === 'workouts') {
      router.replace('/(tabs)/workouts')
      return
    }

    router.back()
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
            <Pressable style={styles.topBackButton} onPress={handleBack}>
              <Ionicons name="chevron-back" size={16} color={colors.text} />
              <Text style={[styles.topBackText, { color: colors.text }]}>Back</Text>
            </Pressable>

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
                <View style={[styles.heroChip, { backgroundColor: colors.overlay }]}>
                  <Text style={[styles.heroChipText, { color: colors.text }]}>
                    {workoutSummary.totalSets} sets
                  </Text>
                </View>
                <View style={[styles.heroChip, { backgroundColor: colors.overlay }]}>
                  <Text style={[styles.heroChipText, { color: colors.text }]}>
                    {formatVolume(workoutSummary.totalVolume)} volume
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
                      style={[styles.infoButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                      onPress={() => toggleExerciseInfo(exercise.exercise_id)}
                    >
                      <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                    </Pressable>
                    <Pressable
                      style={[styles.smallAction, { backgroundColor: colors.panelStrong }]}
                      onPress={() => openAddSet(exercise.exercise_id)}
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
                    ) : (
                      <Pressable
                        style={[styles.infoButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                        onPress={() => toggleExerciseInfo(exercise.exercise_id)}
                      >
                        <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                      </Pressable>
                    )}
                  </View>

                  {showExerciseInfo[exercise.exercise_id] ? (
                    <ExerciseInfoPanel
                      name={exercise.name}
                      type={exercise.type}
                      description={exercise.description}
                      imageUrl={exercise.image_url}
                    />
                  ) : null}

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
                <View style={styles.addMoreRow}>
                  <ButtonComponent
                    onPress={() => setShowExerciseLibrary((prev) => !prev)}
                    text={showExerciseLibrary ? 'Hide exercise library' : 'Add another exercise'}
                    style={styles.compactButton}
                    textStyle={styles.compactButtonText}
                  />
                </View>
                {showExerciseLibrary ? (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Exercise library</Text>
                    <TextInput
                      style={[sharedStyles.input, styles.searchInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder="Search exercises"
                      placeholderTextColor={colors.textMuted}
                      value={search}
                      onChangeText={setSearch}
                    />
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.filterRow}
                    >
                      {MUSCLE_FILTERS.map((filter) => {
                        const active = selectedFilter === filter

                        return (
                          <Pressable
                            key={filter}
                            style={[
                              styles.filterChip,
                              {
                                backgroundColor: active ? colors.primary : colors.surfaceAlt,
                                borderColor: active ? colors.primary : colors.border,
                              },
                            ]}
                            onPress={() => setSelectedFilter(filter)}
                          >
                            <Text style={[styles.filterChipText, { color: active ? '#fff' : colors.text }]}>
                              {filter}
                            </Text>
                          </Pressable>
                        )
                      })}
                    </ScrollView>
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
              </>
            ) : null}

            <SetComposerSheet
              visible={Boolean(activeComposer)}
              exerciseName={
                editedExercises.find((exercise) => exercise.exercise_id === activeComposer?.exerciseId)?.name ?? 'Exercise'
              }
              type={
                editedExercises.find((exercise) => exercise.exercise_id === activeComposer?.exerciseId)?.type ?? 'reps'
              }
              initialSet={
                activeComposer?.setId
                  ? editedExercises
                      .find((exercise) => exercise.exercise_id === activeComposer.exerciseId)
                      ?.sets.find((set) => set.id === activeComposer.setId) ?? null
                  : null
              }
              onClose={() => setActiveComposer(null)}
              onSave={handleSaveSet}
            />

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
                      setPresetIsPublic(false)
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
                      <Pressable
                        style={[
                          styles.visibilityToggle,
                          {
                            backgroundColor: colors.surfaceAlt,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => setPresetIsPublic((prev) => !prev)}
                      >
                        <View style={styles.visibilityCopy}>
                          <Text style={[styles.visibilityTitle, { color: colors.text }]}>
                            {presetIsPublic ? 'Public preset' : 'Private preset'}
                          </Text>
                          <Text style={[styles.visibilitySubtitle, { color: colors.textMuted }]}>
                            {presetIsPublic
                              ? 'Anyone signed in can use this preset.'
                              : 'Only you can see and use this preset.'}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.visibilityBadge,
                            { backgroundColor: presetIsPublic ? colors.primary : colors.overlay },
                          ]}
                        >
                          <Text style={[styles.visibilityBadgeText, { color: '#fff' }]}>
                            {presetIsPublic ? 'Public' : 'Private'}
                          </Text>
                        </View>
                      </Pressable>
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

              <ButtonComponent onPress={handleBack} text="Back" style={{ backgroundColor: colors.secondary }} />
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
  topBackButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  topBackText: {
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  exerciseCard: {
    gap: 10,
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
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
    gap: 6,
    alignItems: 'flex-end',
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  exerciseSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAction: {
    borderRadius: AppRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  smallActionText: {
    fontSize: 11,
    fontWeight: '700',
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
    maxHeight: 230,
    padding: 8,
  },
  libraryRow: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  libraryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  libraryAddText: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchInput: {
    paddingVertical: 12,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: AppRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  addMoreRow: {
    marginTop: -2,
    marginBottom: 2,
  },
  compactButton: {
    paddingVertical: 12,
  },
  compactButtonText: {
    fontSize: 14,
  },
  visibilityToggle: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: AppRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  visibilityCopy: {
    flex: 1,
    gap: 4,
  },
  visibilityTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  visibilitySubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  visibilityBadge: {
    borderRadius: AppRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  visibilityBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
})
