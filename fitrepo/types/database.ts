import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes"

enum ExerciseType {
    Timed = "timed",
    Repbased = "rep-based"
}

type Workout = {
    id: number
    created_at: string
    name: string
    performed_at: string
    is_finished: boolean
    user_id: string
}

type Exercise = {
    id: number
    created_at: string
    name: string
    image_url: string
    user_id: number
    type: ExerciseType
}

type WorkoutExercise = {
    id: number
    created_at: string
    set_count: number
    rep_count: number
    time_per_set_seconds: number
    workout_id: number 
    exercise_id: number
    user_id: number
}

type Profile = {
    user_id: number
    created_at: string
    username: string
    goal: string
    current_streak: number
}

type WorkoutPreset = {
    id: number
    created_at: string
    name: string
    user_id: number
}

type PresetExercise = {
    id: number
    created_at: string
    set_count: number
    rep_count: number
    time_per_set_seconds: number
    preset_id: number 
    exercise_id: number
    user_id: number
}