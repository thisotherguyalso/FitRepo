import { supabase } from '../supabase'
import { PresetExercise } from '@/types/database'

export async function getExercisesInPreset(
    preset_id: string
) {
    const { data, error } = await supabase.from('preset_exercises')
        .select('*, exercises ( name, type, image_url ) ')
        .eq('preset_id', preset_id)
    if (error) throw error
    return data
}

export async function getExerciseInPreset(
    exercise_id: string,
    preset_id: string
) {
    const { data, error } = await supabase.from('preset_exercises')
        .select('*, exercises ( name, type, image_url ) ')
        .eq('preset_id', preset_id)
        .eq('exercise_id', exercise_id)
        .single()
    if (error) throw error
    return data
}

export async function addExerciseToPreset(
    preset_id: string,
    exercise_id: string,
    preset_exercise: Omit<PresetExercise, 'id' | 'preset_id' | 'exercise_id'>
) {
    const { data, error } = await supabase.from('preset_exercises')
        .insert({
            sets: preset_exercise.sets,
            reps: preset_exercise.reps,
            time_seconds: preset_exercise.time_seconds,
            preset_id: preset_id,
            exercise_id: exercise_id
        }).select().single()
    if (error) throw error
    return data
}

export async function updatePresetExercise(
    preset_id: string,
    exercise_id: string,
    preset_exercise: Partial<PresetExercise>
) {
    const { data, error } = await supabase.from('preset_exercises')
        .update(preset_exercise)
        .eq('preset_id', preset_id)
        .eq('exercise_id', exercise_id)
        .select().single()
    if (error) throw error
    return data
}

export async function removeExerciseFromPreset(
    exercise_id: string,
    preset_id: string
) {
    const { error } = await supabase.from('preset_exercises')
    .delete()
    .eq('preset_id', preset_id)
    .eq('exercise_id', exercise_id)
    if (error) throw error
}