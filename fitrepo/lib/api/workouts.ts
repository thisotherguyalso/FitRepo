import { supabase } from '../supabase'
import { Workout } from '@/types/database'

// Gets all workouts.
export async function getWorkouts() {
    const { data, error } = await supabase.from('workouts').select('*')
    if (error) throw error
    return data
}

// Gets the most recent workout before today
export async function getPreviousWorkout() {
    const today = new Date().toISOString()
    const { data, error } = await supabase.from('workouts').select('*')
        .lt('performed_at', today)
        .order('performed_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    if (error) throw error
    return data
}

// Gets a specific workout based on id.
export async function getWorkout(id: string) {
    const { data, error } = await supabase.from('workouts').select('*').eq('id', id).single()
    if (error) throw error
    return data
}

// Creates a workout. Only needs name, performed_at, and is_finished.
// Will throw an error if creating another workout for the same day.
export async function createWorkout(
    workout: Omit<Workout, 'id' | 'user_id' | 'created_at'>
) {
    // check if workout already exists for today
    const today = new Date().toISOString().split('T')[0]
    
    const { data: existing } = await supabase.from('workouts').select('id').eq('performed_at', today).single()
    if (existing) throw new Error('You already have a workout for today!')
    const { data, error } = await supabase.from('workouts').insert(workout).select().single()
    if (error) throw error
    return data
}

// Updates a certain attribute of a workout.
export async function updateWorkout(
    id: string,
    workout: Partial<Workout>
) {
    const { data, error } = await supabase.from('workouts').update(workout).eq('id', id).select().single()
    if (error) throw error
    return data
}

// Deletes a workout.
export async function deleteWorkout(
    id: string
) {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (error) throw error
}