import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes"

export enum ExerciseType {
    timed = "timed",
    reps = "reps"
}

export type Workout = {
    id: number
    user_id: string
    name: string
    performed_at: string
    is_finished: boolean
    created_at: string
}

export type Exercise = {
    id: number
    name: string
    image_url: string
    type: ExerciseType
    description: string
}

export type WorkoutExercise = {
    id: number
    sets: number
    reps: number
    time_seconds: number
    workout_id: number 
    exercise_id: number
}

export type Profile = {
    id: number
    username: string
    started_at: string
    goal: string
    current_streak: number
}

export type WorkoutPreset = {
    id: number
    user_id: number
    name: string
    created_at: string
}

export type PresetExercise = {
    id: number
    sets: number
    reps: number
    time_seconds: number
    preset_id: number 
    exercise_id: number
}