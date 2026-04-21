import { supabase } from '../supabase'
import { Workout } from '@/types/database'
import { getAuthenticatedUser } from './auth'

// Gets all workouts.
export async function getWorkouts() {
    const user = await getAuthenticatedUser()

    const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('performed_at', { ascending: true })

    if (error) throw error
    return data
}

// Gets the most recent workout before today
export async function getPreviousWorkout() {
    const user = await getAuthenticatedUser()

    const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_finished', true)
        .order('performed_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) throw error
    return data
}
// Gets a specific workout based on id.
export async function getWorkout(id: string) {
    const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single()
    if (error) throw error
    return data
}

// Creates a workout. Only needs name, performed_at, and is_finished.
// Will throw an error if creating another workout for the same day.
export async function createWorkout(
    workout: Omit<Workout, 'id' | 'user_id' | 'created_at'>
) {
    const user = await getAuthenticatedUser()

    const { data, error } = await supabase
        .from('workouts')
        .insert({
            ...workout,
            user_id: user.id,
        })
        .select()
        .single()

    if (error) throw error
    return data
}

// Updates a certain attribute of a workout.
export async function updateWorkout(
    id: string,
    workout: Partial<Workout>
) {
    const { data, error } = await supabase
        .from('workouts')
        .update(workout)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

// Deletes a workout.
export async function deleteWorkout(
    id: string
) {
    const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)
    if (error) throw error
}
