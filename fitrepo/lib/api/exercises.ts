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