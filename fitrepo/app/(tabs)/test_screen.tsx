import { useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { getWorkouts, getWorkout, createWorkout, updateWorkout, deleteWorkout } from '@/lib/api/workouts'

const TEST_WORKOUT_ID = '2ece9bc0-18a7-4ba1-9dc6-59754ce5e885'

type TestResult = {
  name: string
  status: 'idle' | 'loading' | 'success' | 'error'
  result?: any
  error?: string
}

const INITIAL_TESTS: TestResult[] = [
  { name: 'getWorkouts()', status: 'idle' },
  { name: 'getWorkout(id)', status: 'idle' },
  { name: 'createWorkout()', status: 'idle' },
  { name: 'updateWorkout()', status: 'idle' },
  { name: 'deleteWorkout()', status: 'idle' },
]

export default function TestScreen() {
  const [tests, setTests] = useState<TestResult[]>(INITIAL_TESTS)
  const [createdId, setCreatedId] = useState<string | null>(null)

  function setTest(name: string, update: Partial<TestResult>) {
    setTests(prev => prev.map(t => t.name === name ? { ...t, ...update } : t))
  }

  async function runGetWorkouts() {
    setTest('getWorkouts()', { status: 'loading' })
    try {
      const data = await getWorkouts()
      setTest('getWorkouts()', { status: 'success', result: `${data?.length} workout(s) found` })
    } catch (e: any) {
      setTest('getWorkouts()', { status: 'error', error: e.message })
    }
  }

  async function runGetWorkout() {
    setTest('getWorkout(id)', { status: 'loading' })
    try {
      const data = await getWorkout(TEST_WORKOUT_ID)
      setTest('getWorkout(id)', { status: 'success', result: `Found: "${data?.name}"` })
    } catch (e: any) {
      setTest('getWorkout(id)', { status: 'error', error: e.message })
    }
  }

  async function runCreateWorkout() {
    setTest('createWorkout()', { status: 'loading' })
    try {
      const data = await createWorkout({
        name: 'Test Workout',
        performed_at: new Date().toISOString().split('T')[0],
        is_finished: false,
      })
      setCreatedId(data?.id)
      setTest('createWorkout()', { status: 'success', result: `Created: "${data?.name}" (id saved for delete test)` })
    } catch (e: any) {
      setTest('createWorkout()', { status: 'error', error: e.message })
    }
  }

  async function runUpdateWorkout() {
    setTest('updateWorkout()', { status: 'loading' })
    try {
      const data = await updateWorkout(TEST_WORKOUT_ID, { name: 'Updated Push Day' })
      setTest('updateWorkout()', { status: 'success', result: `Updated name to: "${data?.name}"` })
    } catch (e: any) {
      setTest('updateWorkout()', { status: 'error', error: e.message })
    }
  }

  async function runDeleteWorkout() {
    setTest('deleteWorkout()', { status: 'loading' })
    const idToDelete = createdId
    if (!idToDelete) {
      setTest('deleteWorkout()', { status: 'error', error: 'Run createWorkout() first to get an id to delete' })
      return
    }
    try {
      await deleteWorkout(idToDelete)
      setCreatedId(null)
      setTest('deleteWorkout()', { status: 'success', result: `Deleted workout: ${idToDelete}` })
    } catch (e: any) {
      setTest('deleteWorkout()', { status: 'error', error: e.message })
    }
  }

  const handlers: Record<string, () => void> = {
    'getWorkouts()': runGetWorkouts,
    'getWorkout(id)': runGetWorkout,
    'createWorkout()': runCreateWorkout,
    'updateWorkout()': runUpdateWorkout,
    'deleteWorkout()': runDeleteWorkout,
  }

  function resetAll() {
    setTests(INITIAL_TESTS)
    setCreatedId(null)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>API Tests</Text>
        <Text style={styles.subtitle}>Workouts</Text>
      </View>

      {tests.map((test) => (
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
              <Text style={styles.resultIcon}>
                {test.status === 'success' ? '✓' : test.status === 'error' ? '✗' : ''}
              </Text>
              <Text style={styles.resultText}>
                {test.status === 'success' ? test.result : test.error}
              </Text>
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.resetButton} onPress={resetAll}>
        <Text style={styles.resetText}>Reset All</Text>
      </TouchableOpacity>

      {createdId && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>⚠ Created workout id saved — run deleteWorkout() to clean up</Text>
        </View>
      )}
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#242424',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fnName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e0e0e0',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#333',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  result: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#4ade80',
  },
  resultText: {
    fontSize: 13,
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
    borderColor: '#333',
    alignItems: 'center',
  },
  resetText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
  },
  notice: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#1a1500',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a3800',
  },
  noticeText: {
    color: '#a07800',
    fontSize: 12,
    lineHeight: 18,
  },
})