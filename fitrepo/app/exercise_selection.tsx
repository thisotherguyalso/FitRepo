import { Alert, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, UIManager, View } from 'react-native'
import { useEffect, useMemo, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ButtonComponent } from '@/components/button-component'
import { ExerciseInfoPanel } from '@/components/exercise-info-panel'
import { SetComposerSheet } from '@/components/set-composer-sheet'
import { WorkoutSetEditor } from '@/components/workout-set-editor'
import { useWorkouts } from '@/hooks/use-workouts'
import { useExercises } from '@/hooks/use-exercises'
import { inferExerciseTags } from '@/lib/exercise-tags'
import {
  createEditableExerciseGroup,
  createEditableSet,
  flattenEditableExercises,
  type EditableExerciseGroup,
} from '@/lib/workout-editor'
import { AppColors, AppRadius, sharedStyles, useAppColors } from '@/constants/styles'

const MUSCLE_FILTERS = ['All', 'Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps', 'Quads', 'Hamstrings', 'Glutes', 'Core'] as const

export default function ExerciseSelection() {
  const { date, name } = useLocalSearchParams<{ date?: string; name?: string }>()
  const { exercises, loading: exercisesLoading } = useExercises()
  const { planWorkout, loading } = useWorkouts()
  const [selectedExercises, setSelectedExercises] = useState<EditableExerciseGroup[]>([])
  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({})
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false)
  const [showExerciseInfo, setShowExerciseInfo] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<(typeof MUSCLE_FILTERS)[number]>('All')
  const [activeComposer, setActiveComposer] = useState<{ exerciseId: string; setId?: string } | null>(null)

  const colors = useAppColors()
  const readableDate = date
    ? new Date(date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
    : 'Selected day'

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }, [])

  const filteredExercises = useMemo(() => {
    // keep the library list clean by hiding stuff already in the plan
    const existingIds = new Set(selectedExercises.map((item) => item.exercise_id))
    const trimmed = search.trim().toLowerCase()

    return exercises.filter((exercise) => {
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
  }, [exercises, search, selectedExercises, selectedFilter])

  function addExercise(exercise: { id: string; name: string; type: string; image_url?: string; description?: string }) {
    setSelectedExercises((prev) => [...prev, createEditableExerciseGroup(exercise)])
    setCollapsedExercises((prev) => ({ ...prev, [exercise.id]: false }))
    setShowExerciseInfo((prev) => ({ ...prev, [exercise.id]: false }))
    setShowExerciseLibrary(false)
    setSearch('')
    // dropping an exercise in with zero sets looks like it saved, then vanishes on persist.
    // open the first-set sheet right away so the flow matches what the user expects.
    setActiveComposer({ exerciseId: exercise.id })
  }

  function removeExercise(exerciseId: string) {
    setSelectedExercises((prev) => prev.filter((item) => item.exercise_id !== exerciseId))
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
    // this makes the fold feel way less janky than a hard mount/unmount snap
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCollapsedExercises((prev) => ({ ...prev, [exerciseId]: !prev[exerciseId] }))
  }

  function toggleExerciseInfo(exerciseId: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setShowExerciseInfo((prev) => ({ ...prev, [exerciseId]: !prev[exerciseId] }))
  }

  function removeSet(exerciseId: string, setId: string) {
    setSelectedExercises((prev) =>
      prev
        .map((exercise) => {
          if (exercise.exercise_id !== exerciseId) return exercise

          const nextSets = exercise.sets.filter((set) => set.id !== setId)
          return { ...exercise, sets: nextSets }
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

    setSelectedExercises((prev) =>
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

  async function handleSaveWorkout() {
    try {
      if (!date) throw new Error('No workout date was provided.')
      if (selectedExercises.length === 0) throw new Error('Please choose at least one exercise.')

      const fallbackWorkoutName = selectedExercises[0]?.name?.trim()
      const finalWorkoutName = (typeof name === 'string' ? name.trim() : '') || fallbackWorkoutName

      if (!finalWorkoutName) {
        throw new Error('Workout needs at least one exercise so it has something to be named after.')
      }

      const flattenedExercises = flattenEditableExercises('', selectedExercises).map((exercise) => ({
        exercise_id: exercise.exercise_id,
        reps: exercise.reps,
        time_seconds: exercise.time_seconds,
        weight: exercise.weight,
        set_notes: exercise.set_notes,
        order_index: exercise.order_index,
      }))

      if (flattenedExercises.length === 0) {
        throw new Error('Add at least one set before saving the workout.')
      }

      // flatten the grouped UI back into db rows since the table still stores one row per planned set
      await planWorkout({
        name: finalWorkoutName,
        performed_at: date,
        is_finished: false,
        exercises: flattenedExercises,
      })

      Alert.alert('Success', 'Workout created successfully.')
      router.replace('/(tabs)/workouts')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ParallaxScrollView>
        <Pressable style={styles.topBackButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={16} color={colors.text} />
          <Text style={[styles.topBackText, { color: colors.text }]}>Back</Text>
        </Pressable>

        <View style={[sharedStyles.card, styles.heroCard, { backgroundColor: colors.tabBar, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.textAccent }]}>BUILD YOUR SESSION</Text>
          <Text style={[styles.header, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.subheader, { color: colors.textMuted }]}>
            Group exercises cleanly, then tune each set like a real training plan.
          </Text>
          <View style={styles.heroMetaRow}>
            <View style={[styles.heroChip, { backgroundColor: colors.panelStrong }]}>
              <Text style={[styles.heroChipText, { color: colors.text }]}>{readableDate}</Text>
            </View>
            <View style={[styles.heroChip, { backgroundColor: colors.overlay }]}>
              <Text style={[styles.heroChipText, { color: colors.text }]}>
                {selectedExercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)} planned sets
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Workout plan</Text>
        {selectedExercises.length === 0 ? (
          <View style={[sharedStyles.card, styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.textSubtle }]}>
              Start by adding an exercise. Each one opens into individual sets you can tune.
            </Text>
            <View style={styles.emptyCardAction}>
              <ButtonComponent
                onPress={() => setShowExerciseLibrary(true)}
                text="Add exercise"
                style={styles.compactButton}
                textStyle={styles.compactButtonText}
              />
            </View>
          </View>
        ) : (
          selectedExercises.map((exercise) => (
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
                <View style={styles.exerciseHeaderActions}>
                  <Pressable
                    style={[styles.infoButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                    onPress={() => toggleExerciseInfo(exercise.exercise_id)}
                  >
                    <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                  </Pressable>
                  <Pressable
                    style={[styles.iconButton, { backgroundColor: colors.panelStrong }]}
                    onPress={() => openAddSet(exercise.exercise_id)}
                  >
                    <Text style={[styles.iconButtonText, { color: colors.text }]}>+ Set</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.iconButton, { backgroundColor: colors.overlay }]}
                    onPress={() => removeExercise(exercise.exercise_id)}
                  >
                    <Text style={[styles.iconButtonText, { color: colors.textMuted }]}>Remove</Text>
                  </Pressable>
                </View>
              </View>

              {showExerciseInfo[exercise.exercise_id] ? (
                <ExerciseInfoPanel
                  name={exercise.name}
                  type={exercise.type}
                  description={exercise.description}
                  imageUrl={exercise.image_url}
                />
              ) : null}

              {!collapsedExercises[exercise.exercise_id]
                ? (
                    <WorkoutSetEditor
                      exercise={exercise}
                      editable
                      onAddSet={() => openAddSet(exercise.exercise_id)}
                      onEditSet={(setId) => openEditSet(exercise.exercise_id, setId)}
                      onRemoveSet={(setId) => removeSet(exercise.exercise_id, setId)}
                    />
                  )
                : (
                    <View style={[styles.collapsedHint, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
                      <Text style={[styles.collapsedHintText, { color: colors.textMuted }]}>
                        {exercise.sets.length} sets tucked away. Tap the header to expand.
                      </Text>
                    </View>
                  )}
            </View>
          ))
        )}

        {selectedExercises.length > 0 ? (
          <View style={styles.addMoreRow}>
            <ButtonComponent
              onPress={() => setShowExerciseLibrary((prev) => !prev)}
              text={showExerciseLibrary ? 'Hide exercise library' : 'Add another exercise'}
              style={styles.compactButton}
              textStyle={styles.compactButtonText}
            />
          </View>
        ) : null}

        {showExerciseLibrary ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Exercise library</Text>
            <TextInput
              style={[
                sharedStyles.input,
                styles.searchInput,
                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
              ]}
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
              {exercisesLoading ? (
                <Text style={[styles.emptyText, { color: colors.textSubtle }]}>Loading exercises...</Text>
              ) : filteredExercises.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSubtle }]}>No matching exercises found.</Text>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                  {filteredExercises.map((exercise) => (
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
                      <View style={styles.libraryCopy}>
                        <Text style={[styles.libraryTitle, { color: colors.text }]}>{exercise.name}</Text>
                        <Text style={[styles.librarySubtitle, { color: colors.textMuted }]}>
                          {exercise.type === 'timed' ? 'Timed intervals' : 'Strength / reps'}
                        </Text>
                      </View>
                      <View style={[styles.addPill, { backgroundColor: colors.panelStrong }]}>
                        <Text style={[styles.addPillText, { color: colors.text }]}>Add</Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          </>
        ) : null}

        <SetComposerSheet
          visible={Boolean(activeComposer)}
          exerciseName={
            selectedExercises.find((exercise) => exercise.exercise_id === activeComposer?.exerciseId)?.name ?? 'Exercise'
          }
          type={
            selectedExercises.find((exercise) => exercise.exercise_id === activeComposer?.exerciseId)?.type ?? 'reps'
          }
          initialSet={
            activeComposer?.setId
              ? selectedExercises
                  .find((exercise) => exercise.exercise_id === activeComposer.exerciseId)
                  ?.sets.find((set) => set.id === activeComposer.setId) ?? null
              : null
          }
          onClose={() => setActiveComposer(null)}
          onSave={handleSaveSet}
        />

        <View style={styles.actions}>
          <ButtonComponent onPress={handleSaveWorkout} text={loading ? 'Saving workout...' : 'Save workout'} />
          <ButtonComponent
            onPress={() => router.back()}
            text="Back"
            style={{ backgroundColor: colors.secondary }}
          />
        </View>
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
    gap: 14,
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
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.4,
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subheader: {
    fontSize: 15,
    lineHeight: 22,
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  heroChip: {
    borderRadius: AppRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  searchInput: {
    marginBottom: 4,
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
  libraryCard: {
    maxHeight: 250,
    padding: 8,
  },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  libraryCopy: {
    flex: 1,
    paddingRight: 10,
  },
  libraryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  librarySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addPill: {
    borderRadius: AppRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  addPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
  },
  emptyCardAction: {
    marginTop: 12,
    width: '100%',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
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
    letterSpacing: -0.4,
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
  iconButton: {
    borderRadius: AppRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  iconButtonText: {
    fontSize: 11,
    fontWeight: '700',
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
})
