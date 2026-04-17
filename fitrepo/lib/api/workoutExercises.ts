import { supabase } from '../supabase'
import { WorkoutExercise } from '@/types/database'
import { EXERCISE_RELATION_SELECT } from './exerciseRelations'
import { resolveEffectiveWeight } from '@/lib/bodyweight'

export type WorkoutSummary = {
    workout_id: string
    totalSets: number
    totalVolume: number
}

// Gets all exercises in a specific workout
export async function getExercisesInWorkout(
    workout_id: string
) {
    const { data, error } = await supabase.from('workout_exercises')
        .select(EXERCISE_RELATION_SELECT)
        .eq('workout_id', workout_id)
        .order('order_index', { ascending: true })
    if (error) throw error
    return data
}

// Gets a specific exercise in a specific workout
export async function getExerciseInWorkout(
    exercise_id: string,
    workout_id: string
) {
    const { data, error } = await supabase.from('workout_exercises')
        .select(EXERCISE_RELATION_SELECT)
        .eq('workout_id', workout_id)
        .eq('exercise_id', exercise_id)
        .single()
    if (error) throw error
    return data
}

// Adds an exercise to a workout with sets, reps, or time
export async function addExerciseToWorkout(
    workout_id: string,
    exercise_id: string,
    workout_exercise: Omit<WorkoutExercise, 'id' | 'workout_id' | 'exercise_id'>
) {
    const { data, error } = await supabase.from('workout_exercises')
        .insert({
            ...workout_exercise,
            workout_id,
            exercise_id,
        }).select().single()
    if (error) throw error
    return data
}

// Updates the sets, reps, or time of an exercise in a workout
export async function updateWorkoutExercise(
    workout_id: string,
    exercise_id: string,
    workout_exercise: Partial<WorkoutExercise>
) {
    const { data, error } = await supabase.from('workout_exercises')
        .update(workout_exercise)
        .eq('workout_id', workout_id)
        .eq('exercise_id', exercise_id)
        .select().single()
    if (error) throw error
    return data
}

export async function updateWorkoutExerciseById(
    id: string,
    workout_exercise: Partial<WorkoutExercise>
) {
    const { data, error } = await supabase.from('workout_exercises')
        .update(workout_exercise)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data
}

// Removes an exercise from a workout
export async function removeExerciseFromWorkout(
    exercise_id: string,
    workout_id: string
) {
    const { error } = await supabase.from('workout_exercises')
    .delete()
    .eq('workout_id', workout_id)
    .eq('exercise_id', exercise_id)
    if (error) throw error
}

export async function clearWorkoutExercises(
    workout_id: string
) {
    const { error } = await supabase.from('workout_exercises')
        .delete()
        .eq('workout_id', workout_id)
    if (error) throw error
}

export async function getWorkoutSummaries(workoutIds: string[], bodyWeightKg: number | null = null) {
    if (workoutIds.length === 0) {
        return [] as WorkoutSummary[]
    }

    const { data, error } = await supabase
        .from('workout_exercises')
        .select('workout_id, sets, reps, weight')
        .in('workout_id', workoutIds)

    if (error) throw error

    const summaries = new Map<string, WorkoutSummary>()

    for (const row of data ?? []) {
        const current = summaries.get(row.workout_id) ?? {
            workout_id: row.workout_id,
            totalSets: 0,
            totalVolume: 0,
        }

        const setCount = row.sets ?? 1
        const effectiveWeight = resolveEffectiveWeight(row.weight, bodyWeightKg) ?? 0
        const volume = (row.reps ?? 0) * effectiveWeight * setCount

        current.totalSets += setCount
        current.totalVolume += volume
        summaries.set(row.workout_id, current)
    }

    return workoutIds.map((id) => summaries.get(id) ?? {
        workout_id: id,
        totalSets: 0,
        totalVolume: 0,
    })
}
