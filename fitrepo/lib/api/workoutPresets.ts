import { supabase } from '../supabase'
import { WorkoutPreset } from '@/types/database'

// Gets all workout presets
export async function getWorkoutPresets() {
    const { data, error } = await supabase.from('workout_presets').select('*')
    if (error) throw error
    return data
}

// Gets a specific workout preset based on id
export async function getWorkoutPreset(id: string) {
    const { data, error } = await supabase.from('workout_presets').select('*').eq('id', id).single()
    if (error) throw error
    return data
}

// Creates a workout preset
export async function createWorkoutPreset(
    workout_preset: Omit<WorkoutPreset, 'id' | 'user_id' | 'created_at'>
) {
    const { data, error } = await supabase.from('workout_presets').insert(workout_preset).select().single()
    if (error) throw error
    return data
}

// Updates a workout preset name
export async function updateWorkoutPreset(
    id: string,
    workout_preset: Partial<WorkoutPreset>
) {
    const { data, error } = await supabase.from('workout_presets').update(workout_preset).eq('id', id).select().single()
    if (error) throw error
    return data
}

// Deletes a workout preset
export async function deleteWorkoutPreset(
    id: string
) {
    const { error } = await supabase.from('workout_presets').delete().eq('id', id)
    if (error) throw error
}