import { useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { getWorkouts, getWorkout, createWorkout, updateWorkout, deleteWorkout } from '@/lib/api/workouts'
import { getExercises, getExercise } from '@/lib/api/exercises'
import { getExercisesInWorkout, getExerciseInWorkout, addExerciseToWorkout, updateWorkoutExercise, removeExerciseFromWorkout } from '@/lib/api/workoutExercises'
import { getWorkoutPresets, getWorkoutPreset, createWorkoutPreset, updateWorkoutPreset, deleteWorkoutPreset } from '@/lib/api/workoutPresets'
import { getExercisesInPreset, getExerciseInPreset, addExerciseToPreset, updatePresetExercise, removeExerciseFromPreset } from '@/lib/api/presetExercises'
import { getProfile, updateProfile } from '@/lib/api/profiles'

const TEST_WORKOUT_ID = '2ece9bc0-18a7-4ba1-9dc6-59754ce5e885'
const TEST_PRESET_ID = '17610822-bab4-4faa-b263-9d8349667dde'
const TEST_EXERCISE_ID = '28d35f25-2403-4549-87b4-5a40fbb10c6f'
const TEST_USER_ID = '0ba26597-5479-4fe5-8eef-bb477bf0f6bc'


type TestResult = {
  name: string
  status: 'idle' | 'loading' | 'success' | 'error'
  result?: string
  error?: string
}

type Section = {
  title: string
  tests: TestResult[]
}

const INITIAL_SECTIONS: Section[] = [
  {
    title: 'Workouts',
    tests: [
      { name: 'getWorkouts()', status: 'idle' },
      { name: 'getWorkout(id)', status: 'idle' },
      { name: 'createWorkout()', status: 'idle' },
      { name: 'updateWorkout()', status: 'idle' },
      { name: 'deleteWorkout()', status: 'idle' },
    ]
  },
  {
    title: 'Exercises',
    tests: [
      { name: 'getExercises()', status: 'idle' },
      { name: 'getExercise(id)', status: 'idle' },
    ]
  },
  {
    title: 'Workout Exercises',
    tests: [
      { name: 'getExercisesInWorkout()', status: 'idle' },
      { name: 'getExerciseInWorkout()', status: 'idle' },
      { name: 'addExerciseToWorkout()', status: 'idle' },
      { name: 'updateWorkoutExercise()', status: 'idle' },
      { name: 'removeExerciseFromWorkout()', status: 'idle' },
    ]
  },
  {
    title: 'Workout Presets',
    tests: [
      { name: 'getWorkoutPresets()', status: 'idle' },
      { name: 'getWorkoutPreset(id)', status: 'idle' },
      { name: 'createWorkoutPreset()', status: 'idle' },
      { name: 'updateWorkoutPreset()', status: 'idle' },
      { name: 'deleteWorkoutPreset()', status: 'idle' },
    ]
  },
  {
    title: 'Preset Exercises',
    tests: [
      { name: 'getExercisesInPreset()', status: 'idle' },
      { name: 'getExerciseInPreset()', status: 'idle' },
      { name: 'addExerciseToPreset()', status: 'idle' },
      { name: 'updatePresetExercise()', status: 'idle' },
      { name: 'removeExerciseFromPreset()', status: 'idle' },
    ]
  },
  {
    title: 'Profiles',
    tests: [
      { name: 'getProfile()', status: 'idle' },
      { name: 'updateProfile()', status: 'idle' },
    ]
  },
]

export default function TestScreen() {
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS)
  const [createdWorkoutId, setCreatedWorkoutId] = useState<string | null>(null)
  const [createdPresetId, setCreatedPresetId] = useState<string | null>(null)
  const [addedExerciseWorkoutId, setAddedExerciseWorkoutId] = useState<string | null>(null)
  const [addedExercisePresetId, setAddedExercisePresetId] = useState<string | null>(null)

  function setTest(sectionTitle: string, testName: string, update: Partial<TestResult>) {
    setSections(prev => prev.map(section =>
      section.title === sectionTitle
        ? { ...section, tests: section.tests.map(t => t.name === testName ? { ...t, ...update } : t) }
        : section
    ))
  }

  function loading(section: string, name: string) {
    setTest(section, name, { status: 'loading' })
  }

  function success(section: string, name: string, result: string) {
    setTest(section, name, { status: 'success', result })
  }

  function fail(section: string, name: string, e: any) {
    setTest(section, name, { status: 'error', error: e.message })
  }

  const handlers: Record<string, () => void> = {

    // --- WORKOUTS ---
    'getWorkouts()': async () => {
      loading('Workouts', 'getWorkouts()')
      try {
        const data = await getWorkouts()
        success('Workouts', 'getWorkouts()', `${data?.length} workout(s) found`)
      } catch (e) { fail('Workouts', 'getWorkouts()', e) }
    },

    'getWorkout(id)': async () => {
      loading('Workouts', 'getWorkout(id)')
      try {
        const data = await getWorkout(TEST_WORKOUT_ID)
        success('Workouts', 'getWorkout(id)', `Found: "${data?.name}"`)
      } catch (e) { fail('Workouts', 'getWorkout(id)', e) }
    },

    'createWorkout()': async () => {
      loading('Workouts', 'createWorkout()')
      try {
        const data = await createWorkout({ name: 'Test Workout', performed_at: new Date().toISOString().split('T')[0], is_finished: false })
        setCreatedWorkoutId(data?.id)
        success('Workouts', 'createWorkout()', `Created: "${data?.name}"`)
      } catch (e) { fail('Workouts', 'createWorkout()', e) }
    },

    'updateWorkout()': async () => {
      loading('Workouts', 'updateWorkout()')
      try {
        const data = await updateWorkout(TEST_WORKOUT_ID, { name: 'Updated Push Day' })
        success('Workouts', 'updateWorkout()', `Updated name to: "${data?.name}"`)
      } catch (e) { fail('Workouts', 'updateWorkout()', e) }
    },

    'deleteWorkout()': async () => {
      loading('Workouts', 'deleteWorkout()')
      if (!createdWorkoutId) { fail('Workouts', 'deleteWorkout()', { message: 'Run createWorkout() first' }); return }
      try {
        await deleteWorkout(createdWorkoutId)
        setCreatedWorkoutId(null)
        success('Workouts', 'deleteWorkout()', `Deleted workout successfully`)
      } catch (e) { fail('Workouts', 'deleteWorkout()', e) }
    },

    // --- EXERCISES ---
    'getExercises()': async () => {
      loading('Exercises', 'getExercises()')
      try {
        const data = await getExercises()
        success('Exercises', 'getExercises()', `${data?.length} exercise(s) found`)
      } catch (e) { fail('Exercises', 'getExercises()', e) }
    },

    'getExercise(id)': async () => {
      loading('Exercises', 'getExercise(id)')
      try {
        const data = await getExercise(TEST_EXERCISE_ID)
        success('Exercises', 'getExercise(id)', `Found: "${data?.name}" (${data?.type})`)
      } catch (e) { fail('Exercises', 'getExercise(id)', e) }
    },

    // --- WORKOUT EXERCISES ---
    'getExercisesInWorkout()': async () => {
      loading('Workout Exercises', 'getExercisesInWorkout()')
      try {
        const data = await getExercisesInWorkout(TEST_WORKOUT_ID)
        success('Workout Exercises', 'getExercisesInWorkout()', `${data?.length} exercise(s) in workout`)
      } catch (e) { fail('Workout Exercises', 'getExercisesInWorkout()', e) }
    },

    'getExerciseInWorkout()': async () => {
      loading('Workout Exercises', 'getExerciseInWorkout()')
      if (!addedExerciseWorkoutId) { fail('Workout Exercises', 'getExerciseInWorkout()', { message: 'Run addExerciseToWorkout() first' }); return }
      try {
        await getExerciseInWorkout(TEST_EXERCISE_ID, TEST_WORKOUT_ID)
        success('Workout Exercises', 'getExerciseInWorkout()', `Found exercise in workout`)
      } catch (e) { fail('Workout Exercises', 'getExerciseInWorkout()', e) }
    },

    'addExerciseToWorkout()': async () => {
      loading('Workout Exercises', 'addExerciseToWorkout()')
      try {
        const data = await addExerciseToWorkout(TEST_WORKOUT_ID, TEST_EXERCISE_ID, {
          reps: 10,
          time_seconds: null,
          order_index: 1,
          weight: 20,
          set_notes: null,
        })
        setAddedExerciseWorkoutId(data?.id)
        success('Workout Exercises', 'addExerciseToWorkout()', `Added one workout set row`)
      } catch (e) { fail('Workout Exercises', 'addExerciseToWorkout()', e) }
    },

    'updateWorkoutExercise()': async () => {
      loading('Workout Exercises', 'updateWorkoutExercise()')
      if (!addedExerciseWorkoutId) { fail('Workout Exercises', 'updateWorkoutExercise()', { message: 'Run addExerciseToWorkout() first' }); return }
      try {
        await updateWorkoutExercise(TEST_WORKOUT_ID, TEST_EXERCISE_ID, { reps: 12, weight: 25 })
        success('Workout Exercises', 'updateWorkoutExercise()', `Updated matching workout rows`)
      } catch (e) { fail('Workout Exercises', 'updateWorkoutExercise()', e) }
    },

    'removeExerciseFromWorkout()': async () => {
      loading('Workout Exercises', 'removeExerciseFromWorkout()')
      if (!addedExerciseWorkoutId) { fail('Workout Exercises', 'removeExerciseFromWorkout()', { message: 'Run addExerciseToWorkout() first' }); return }
      try {
        await removeExerciseFromWorkout(TEST_EXERCISE_ID, TEST_WORKOUT_ID)
        setAddedExerciseWorkoutId(null)
        success('Workout Exercises', 'removeExerciseFromWorkout()', `Removed exercise from workout`)
      } catch (e) { fail('Workout Exercises', 'removeExerciseFromWorkout()', e) }
    },

    // --- WORKOUT PRESETS ---
    'getWorkoutPresets()': async () => {
      loading('Workout Presets', 'getWorkoutPresets()')
      try {
        const data = await getWorkoutPresets()
        success('Workout Presets', 'getWorkoutPresets()', `${data?.length} preset(s) found`)
      } catch (e) { fail('Workout Presets', 'getWorkoutPresets()', e) }
    },

    'getWorkoutPreset(id)': async () => {
      loading('Workout Presets', 'getWorkoutPreset(id)')
      try {
        const data = await getWorkoutPreset(TEST_PRESET_ID)
        success('Workout Presets', 'getWorkoutPreset(id)', `Found: "${data?.name}"`)
      } catch (e) { fail('Workout Presets', 'getWorkoutPreset(id)', e) }
    },

    'createWorkoutPreset()': async () => {
      loading('Workout Presets', 'createWorkoutPreset()')
      try {
        const data = await createWorkoutPreset({ name: 'Test Preset', is_public: false })
        setCreatedPresetId(data?.id)
        success('Workout Presets', 'createWorkoutPreset()', `Created: "${data?.name}"`)
      } catch (e) { fail('Workout Presets', 'createWorkoutPreset()', e) }
    },

    'updateWorkoutPreset()': async () => {
      loading('Workout Presets', 'updateWorkoutPreset()')
      try {
        const data = await updateWorkoutPreset(TEST_PRESET_ID, { name: 'Updated Preset' })
        success('Workout Presets', 'updateWorkoutPreset()', `Updated name to: "${data?.name}"`)
      } catch (e) { fail('Workout Presets', 'updateWorkoutPreset()', e) }
    },

    'deleteWorkoutPreset()': async () => {
      loading('Workout Presets', 'deleteWorkoutPreset()')
      if (!createdPresetId) { fail('Workout Presets', 'deleteWorkoutPreset()', { message: 'Run createWorkoutPreset() first' }); return }
      try {
        await deleteWorkoutPreset(createdPresetId)
        setCreatedPresetId(null)
        success('Workout Presets', 'deleteWorkoutPreset()', `Deleted preset successfully`)
      } catch (e) { fail('Workout Presets', 'deleteWorkoutPreset()', e) }
    },

    // --- PRESET EXERCISES ---
    'getExercisesInPreset()': async () => {
      loading('Preset Exercises', 'getExercisesInPreset()')
      try {
        const data = await getExercisesInPreset(TEST_PRESET_ID)
        success('Preset Exercises', 'getExercisesInPreset()', `${data?.length} exercise(s) in preset`)
      } catch (e) { fail('Preset Exercises', 'getExercisesInPreset()', e) }
    },

    'getExerciseInPreset()': async () => {
      loading('Preset Exercises', 'getExerciseInPreset()')
      if (!addedExercisePresetId) { fail('Preset Exercises', 'getExerciseInPreset()', { message: 'Run addExerciseToPreset() first' }); return }
      try {
        await getExerciseInPreset(TEST_EXERCISE_ID, TEST_PRESET_ID)
        success('Preset Exercises', 'getExerciseInPreset()', `Found exercise in preset`)
      } catch (e) { fail('Preset Exercises', 'getExerciseInPreset()', e) }
    },

    'addExerciseToPreset()': async () => {
      loading('Preset Exercises', 'addExerciseToPreset()')
      try {
        const data = await addExerciseToPreset(TEST_PRESET_ID, TEST_EXERCISE_ID, { sets: 3, reps: 10, time_seconds: null, order_index: 1, weight: 50})
        setAddedExercisePresetId(data?.id)
        success('Preset Exercises', 'addExerciseToPreset()', `Added exercise — 3 sets x 10 reps`)
      } catch (e) { fail('Preset Exercises', 'addExerciseToPreset()', e) }
    },

    'updatePresetExercise()': async () => {
      loading('Preset Exercises', 'updatePresetExercise()')
      if (!addedExercisePresetId) { fail('Preset Exercises', 'updatePresetExercise()', { message: 'Run addExerciseToPreset() first' }); return }
      try {
        await updatePresetExercise(TEST_PRESET_ID, TEST_EXERCISE_ID, { sets: 5, reps: 8 })
        success('Preset Exercises', 'updatePresetExercise()', `Updated to 5 sets x 8 reps`)
      } catch (e) { fail('Preset Exercises', 'updatePresetExercise()', e) }
    },

    'removeExerciseFromPreset()': async () => {
      loading('Preset Exercises', 'removeExerciseFromPreset()')
      if (!addedExercisePresetId) { fail('Preset Exercises', 'removeExerciseFromPreset()', { message: 'Run addExerciseToPreset() first' }); return }
      try {
        await removeExerciseFromPreset(TEST_EXERCISE_ID, TEST_PRESET_ID)
        setAddedExercisePresetId(null)
        success('Preset Exercises', 'removeExerciseFromPreset()', `Removed exercise from preset`)
      } catch (e) { fail('Preset Exercises', 'removeExerciseFromPreset()', e) }
    },

    // --- PROFILES ---
    'getProfile()': async () => {
      loading('Profiles', 'getProfile()')
      try {
        const data = await getProfile(TEST_USER_ID)
        success('Profiles', 'getProfile()', `Found profile: "${data?.username ?? 'no username'}"`)
      } catch (e) { fail('Profiles', 'getProfile()', e) }
    },

    'updateProfile()': async () => {
      loading('Profiles', 'updateProfile()')
      try {
        const data = await updateProfile(TEST_USER_ID, { username: 'testuser_updated' })
        success('Profiles', 'updateProfile()', `Updated username to: "${data?.username}"`)
      } catch (e) { fail('Profiles', 'updateProfile()', e) }
    },
  }

  function resetAll() {
    setSections(INITIAL_SECTIONS)
    setCreatedWorkoutId(null)
    setCreatedPresetId(null)
    setAddedExerciseWorkoutId(null)
    setAddedExercisePresetId(null)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>API Tests</Text>
        <Text style={styles.subtitle}>Run each function and verify results</Text>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {section.tests.map((test) => (
            <View key={test.name} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.fnName}>{test.name}</Text>
                <TouchableOpacity
                  style={[styles.button, test.status === 'loading' && styles.buttonDisabled]}
                  onPress={handlers[test.name]}
                  disabled={test.status === 'loading'}
                >
                  {test.status === 'loading'
                    ? <ActivityIndicator size="small" color="#000" />
                    : <Text style={styles.buttonText}>Run</Text>
                  }
                </TouchableOpacity>
              </View>

              {test.status !== 'idle' && (
                <View style={[
                  styles.result,
                  test.status === 'success' && styles.resultSuccess,
                  test.status === 'error' && styles.resultError,
                ]}>
                  <Text style={[styles.resultIcon, test.status === 'error' && styles.resultIconError]}>
                    {test.status === 'success' ? '✓' : '✗'}
                  </Text>
                  <Text style={styles.resultText}>
                    {test.status === 'success' ? test.result : test.error}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.resetButton} onPress={resetAll}>
        <Text style={styles.resetText}>Reset All</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#444',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#242424',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fnName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e0e0e0',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 7,
    minWidth: 52,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#2a2a2a',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  result: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  resultSuccess: {
    backgroundColor: '#0d2818',
    borderWidth: 1,
    borderColor: '#1a5c35',
  },
  resultError: {
    backgroundColor: '#2a0d0d',
    borderWidth: 1,
    borderColor: '#5c1a1a',
  },
  resultIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4ade80',
  },
  resultIconError: {
    color: '#f87171',
  },
  resultText: {
    fontSize: 12,
    color: '#aaa',
    flex: 1,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  resetButton: {
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  resetText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '600',
  },
})
