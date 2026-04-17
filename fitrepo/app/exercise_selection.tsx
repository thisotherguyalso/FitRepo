import { Alert, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, UIManager, View } from 'react-native'
import { useEffect, useMemo, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ButtonComponent } from '@/components/button-component'
import { useWorkouts } from '@/hooks/use-workouts'
import { useExercises } from '@/hooks/use-exercises'
import {
  createEditableExerciseGroup,
  createEditableSet,
  flattenEditableExercises,
  type EditableExerciseGroup,
} from '@/lib/workout-editor'
import { AppColors, AppRadius, sharedStyles, useAppColors } from '@/constants/styles'

export default function ExerciseSelection() {
  const { date, name } = useLocalSearchParams<{ date?: string; name?: string }>()
  const { exercises, loading: exercisesLoading } = useExercises()
  const { planWorkout, loading } = useWorkouts()
  const [selectedExercises, setSelectedExercises] = useState<EditableExerciseGroup[]>([])
  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')

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
      if (!trimmed) return true
      return exercise.name.toLowerCase().includes(trimmed)
    })
  }, [exercises, search, selectedExercises])

  function addExercise(exercise: { id: string; name: string; type: string }) {
    setSelectedExercises((prev) => [...prev, createEditableExerciseGroup(exercise)])
    setCollapsedExercises((prev) => ({ ...prev, [exercise.id]: false }))
  }

  function removeExercise(exerciseId: string) {
    setSelectedExercises((prev) => prev.filter((item) => item.exercise_id !== exerciseId))
    setCollapsedExercises((prev) => {
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

  function addSet(exerciseId: string) {
    setSelectedExercises((prev) =>
      prev.map((exercise) =>
        exercise.exercise_id === exerciseId
          ? {
              ...exercise,
              sets: [
                ...exercise.sets,
                // new sets start blank on purpose so you can build weird pyramids/drop sets manually
                createEditableSet(exercise.type, {}, exercise.exercise_id, exercise.sets.length),
              ],
            }
          : exercise
      )
    )
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

  function updateSetField(
    exerciseId: string,
    setId: string,
    field: 'reps' | 'time_seconds' | 'weight',
    value: string
  ) {
    setSelectedExercises((prev) =>
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

  async function handleSaveWorkout() {
    try {
      if (!date) throw new Error('No workout date was provided.')
      if (!name) throw new Error('No workout name was provided.')
      if (selectedExercises.length === 0) throw new Error('Please choose at least one exercise.')

      // flatten the grouped UI back into db rows since the table still stores one row per planned set
      await planWorkout({
        name,
        performed_at: date,
        is_finished: false,
        exercises: flattenEditableExercises('', selectedExercises).map((exercise) => ({
          exercise_id: exercise.exercise_id,
          sets: exercise.sets,
          reps: exercise.reps,
          time_seconds: exercise.time_seconds,
          weight: exercise.weight,
          order_index: exercise.order_index,
        })),
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

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Add exercises</Text>
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

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Workout plan</Text>
        {selectedExercises.length === 0 ? (
          <View style={[sharedStyles.card, styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.textSubtle }]}>
              Start by adding an exercise. Each one opens into individual sets you can tune.
            </Text>
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
                    style={[styles.iconButton, { backgroundColor: colors.panelStrong }]}
                    onPress={() => addSet(exercise.exercise_id)}
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

              {!collapsedExercises[exercise.exercise_id]
                ? exercise.sets.map((set, index) => (
                    <View key={set.id} style={[styles.setCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                      <View style={styles.setHeader}>
                        <Text style={[styles.setLabel, { color: colors.textAccent }]}>Set {index + 1}</Text>
                        {exercise.sets.length > 1 ? (
                          <Pressable onPress={() => removeSet(exercise.exercise_id, set.id)}>
                            <Text style={[styles.removeSetText, { color: colors.danger }]}>Delete</Text>
                          </Pressable>
                        ) : (
                          <View />
                        )}
                      </View>

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
                            onChangeText={(value) =>
                              updateSetField(exercise.exercise_id, set.id, 'time_seconds', value)
                            }
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
                    </View>
                  ))
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
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 8,
  },
  searchInput: {
    marginBottom: 4,
  },
  libraryCard: {
    maxHeight: 300,
    padding: 10,
  },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: AppRadius.md,
    borderWidth: 1,
    marginBottom: 10,
  },
  libraryCopy: {
    flex: 1,
    paddingRight: 12,
  },
  libraryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  librarySubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  addPill: {
    borderRadius: AppRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
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
    letterSpacing: -0.4,
  },
  exerciseSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  iconButton: {
    borderRadius: AppRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconButtonText: {
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
    alignItems: 'center',
  },
  setLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
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
})
