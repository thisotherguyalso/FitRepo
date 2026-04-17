import { supabase } from '../supabase'
import { WorkoutPreset } from '@/types/database'
import { getAuthenticatedUser } from './auth'

// Gets all workout presets
export async function getWorkoutPresets() {
    const user = await getAuthenticatedUser()
    const { data, error } = await supabase
        .from('workout_presets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    if (error) throw error
    return data
}

// Gets a specific workout preset based on id
export async function getWorkoutPreset(id: string) {
    const user = await getAuthenticatedUser()
    const { data, error } = await supabase
        .from('workout_presets')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
    if (error) throw error
    return data
}

// Creates a workout preset
export async function createWorkoutPreset(
    workout_preset: Omit<WorkoutPreset, 'id' | 'user_id' | 'created_at'>
) {
    const user = await getAuthenticatedUser()
    const { data, error } = await supabase
        .from('workout_presets')
        .insert({
            ...workout_preset,
            user_id: user.id,
        })
        .select()
        .single()
    if (error) throw error
    return data
}

// Updates a workout preset name
export async function updateWorkoutPreset(
    id: string,
    workout_preset: Partial<WorkoutPreset>
) {
    const user = await getAuthenticatedUser()
    const { data, error } = await supabase
        .from('workout_presets')
        .update(workout_preset)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
    if (error) throw error
    return data
}

// Deletes a workout preset
export async function deleteWorkoutPreset(
    id: string
) {
    const user = await getAuthenticatedUser()
    const { error } = await supabase
        .from('workout_presets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
    if (error) throw error
}
