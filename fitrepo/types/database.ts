export enum ExerciseType {
    timed = "timed",
    reps = "reps"
}

export type Workout = {
    id: string
    user_id: string
    name: string
    performed_at: string
    is_finished: boolean
    created_at: string
}

export type Exercise = {
    id: string
    name: string
    image_url: string
    type: ExerciseType
    description: string
}

export type WorkoutExercise = {
    id: string
    sets: number | null
    reps: number | null
    time_seconds: number | null
    weight: number | null
    workout_id: string
    exercise_id: string
    order_index: number
}

export type Profile = {
    id: string
    username: string
    started_at: string
    goal: string
    current_streak: number
}

export type WorkoutPreset = {
    id: string
    user_id: string
    name: string
    created_at: string
}

export type PresetExercise = {
    id: string
    sets: number | null
    reps: number | null
    time_seconds: number | null
    weight: number | null
    preset_id: string
    exercise_id: string
    order_index: number
}

export type HistoryEntry = {
    id: string
    user_id: string
    workout_id: string
    exercise_id: string
    set_number: number
    reps: number | null
    time_seconds: number | null
    weight: number | null
    created_at: string
}