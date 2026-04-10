import { supabase } from '../supabase'
import { HistoryEntry } from '@/types/database'

// Gets all history entries for a workout
export async function getWorkoutHistory(workout_id: string) {
    const { data, error } = await supabase
        .from('history_entry')
        .select('*')
        .eq('workout_id', workout_id)
        .order('exercise_id')
        .order('set_number', { ascending: true })
    if (error) throw error
    return data
}

// Gets all history entries for a specific exercise in a workout
export async function getExerciseHistory(
    workout_id: string,
    exercise_id: string
) {
    const { data, error } = await supabase
        .from('history_entry')
        .select('*')
        .eq('workout_id', workout_id)
        .eq('exercise_id', exercise_id)
        .order('set_number', { ascending: true })
    if (error) throw error
    return data
}

// Gets a single history entry by workout, exercise, and set number
export async function getHistoryEntry(
    workout_id: string,
    exercise_id: string,
    set_number: number
) {
    const { data, error } = await supabase
        .from('history_entry')
        .select('*')
        .eq('workout_id', workout_id)
        .eq('exercise_id', exercise_id)
        .eq('set_number', set_number)
        .single()
    if (error) throw error
    return data
}

// Creates a new history entry (logs a set)
// In historyEntries.ts
export async function createHistoryEntry(
    user_id: string,
    workout_id: string,
    exercise_id: string,
    entry: Omit<HistoryEntry, 'id' | 'user_id' | 'workout_id' | 'exercise_id' | 'created_at'>
) {
    const { data, error } = await supabase
        .from('history_entry')
        .upsert({
            ...entry,
            user_id,
            workout_id,
            exercise_id,
        }, {
            onConflict: 'workout_id,exercise_id,set_number',
        })
        .select()
        .single()
    if (error) throw error
    return data
}

// Updates an existing history entry
export async function updateHistoryEntry(
    workout_id: string,
    exercise_id: string,
    set_number: number,
    entry: Partial<Pick<HistoryEntry, 'reps' | 'time_seconds' | 'weight'>>
) {
    const { data, error } = await supabase
        .from('history_entry')
        .update(entry)
        .eq('workout_id', workout_id)
        .eq('exercise_id', exercise_id)
        .eq('set_number', set_number)
        .select()
        .single()
    if (error) throw error
    return data
}

// Deletes a history entry
export async function deleteHistoryEntry(
    workout_id: string,
    exercise_id: string,
    set_number: number
) {
    const { error } = await supabase
        .from('history_entry')
        .delete()
        .eq('workout_id', workout_id)
        .eq('exercise_id', exercise_id)
        .eq('set_number', set_number)
    if (error) throw error
}

// Deletes all history entries for an exercise in a workout
export async function clearExerciseHistory(
    workout_id: string,
    exercise_id: string
) {
    const { error } = await supabase
        .from('history_entry')
        .delete()
        .eq('workout_id', workout_id)
        .eq('exercise_id', exercise_id)
    if (error) throw error
}