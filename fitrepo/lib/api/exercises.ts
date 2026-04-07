import { Exercise } from '@/types/database'
import { supabase } from '../supabase'

// Gets all exercises
export async function getExercises() {
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true })

    if (error) throw error
    return data as Exercise[]
}

// Gets a specific exercise based on id
export async function getExercise(id: string) {
    const { data, error } = await supabase.from('exercises').select('*').eq('id', id).single()
    if (error) throw error
    return data
}

export async function createExercise(exercise: { id: string; name: string }) {
    // get the currently logged in user
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) throw new Error('No authenticated user found.')

    const { data, error } = await supabase
        .from('exercises')
        .insert({
            ...exercise,
        })
        .select()
        .single()
    if (error) throw error
    return data
}

// Deletes an exercise
export async function deleteExercise(id: string) {
    const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)
    if (error) throw error
}