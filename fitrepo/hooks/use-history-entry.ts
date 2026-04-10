import { useState, useEffect, useCallback } from 'react'
import { HistoryEntry } from '@/types/database'
import {
  getWorkoutHistory,
  getExerciseHistory,
  createHistoryEntry,
  updateHistoryEntry,
  deleteHistoryEntry,
} from '@/lib/api/historyEntries'

export function useWorkoutHistory(workout_id: string) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHistory = useCallback(async () => {
    if (!workout_id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getWorkoutHistory(workout_id)
      setHistory(data ?? [])
    } catch (err: any) {
      setError(err.message)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [workout_id])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  return { history, loading, error, refetch: loadHistory }
}

export function useExerciseHistoryInWorkout(workout_id: string, exercise_id: string) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadHistory = useCallback(async () => {
    if (!workout_id || !exercise_id) return
    setLoading(true)
    try {
      const data = await getExerciseHistory(workout_id, exercise_id)
      setHistory(data ?? [])
    } catch (err) {
      console.error('Failed to load exercise history:', err)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [workout_id, exercise_id])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  return { history, loading, refetch: loadHistory }
}

export function useHistoryActions(user_id: string, workout_id: string) {
  const [saving, setSaving] = useState(false)

  const logSet = useCallback(
    async (
      exercise_id: string,
      set_number: number,
      data: { reps?: number | null; time_seconds?: number | null; weight?: number | null }
    ) => {
      setSaving(true)
      try {
        const entry = await createHistoryEntry(user_id, workout_id, exercise_id, {
          set_number,
          reps: data.reps ?? null,
          time_seconds: data.time_seconds ?? null,
          weight: data.weight ?? null,
        })
        return entry
      } catch (err) {
        console.error('Failed to log set:', err)
        throw err
      } finally {
        setSaving(false)
      }
    },
    [user_id, workout_id]
  )

  const editSet = useCallback(
    async (
      exercise_id: string,
      set_number: number,
      data: { reps?: number; time_seconds?: number; weight?: number }
    ) => {
      setSaving(true)
      try {
        const entry = await updateHistoryEntry(workout_id, exercise_id, set_number, data)
        return entry
      } catch (err) {
        console.error('Failed to update set:', err)
        throw err
      } finally {
        setSaving(false)
      }
    },
    [workout_id]
  )

  const removeSet = useCallback(
    async (exercise_id: string, set_number: number) => {
      setSaving(true)
      try {
        await deleteHistoryEntry(workout_id, exercise_id, set_number)
      } catch (err) {
        console.error('Failed to delete set:', err)
        throw err
      } finally {
        setSaving(false)
      }
    },
    [workout_id]
  )

  return { logSet, editSet, removeSet, saving }
}