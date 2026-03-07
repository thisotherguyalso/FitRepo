import { supabase } from '../supabase'

export async function getExercises() {
    const { data, error } = await supabase.from('exercises').select('*')
    if (error) throw error
    return data
}

export async function getExercise(id: string) {
    const { data, error } = await supabase.from('exercises').select('*').eq('id', id).single()
    if (error) throw error
    return data
}