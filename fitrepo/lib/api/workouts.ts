import { supabase } from '../supabase'
import { Workout } from '@/types/database'

export async function getWorkouts() {
    const { data, error } = await supabase.from('workouts').select('*')
    if (error) throw error
    return data
}

export async function getWorkout(id: string) {
    const { data, error } = await supabase.from('workouts').select('*').eq('id', id).single()
    if (error) throw error
    return data
}

export async function createWorkout(
    workout: Omit<Workout, 'id' | 'user_id' | 'created_at'>
) {
    const { data, error } = await supabase.from('workouts').insert(workout).select().single()
    if (error) throw error
    return data
}

export async function updateWorkout(
    id: string,
    workout: Partial<Workout>
) {
    const { data, error } = await supabase.from('workouts').update(workout).eq('id', id).select().single()
    if (error) throw error
    return data
}

export async function deleteWorkout(
    id: string
) {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (error) throw error
}