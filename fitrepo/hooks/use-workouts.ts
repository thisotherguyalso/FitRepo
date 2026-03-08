import { useState, useEffect } from 'react'
import { Workout } from '@/types/database'
import { getWorkouts } from '@/lib/api/workouts'

export function useWorkouts() {
    const [workouts, setWorkouts] = useState<Workout[]>([])

    useEffect(() => {
        loadWorkouts()
    }, [])

    async function loadWorkouts() {
        const data = await getWorkouts()
        setWorkouts(data ?? [])
    }

    const markedDates = workouts.reduce((acc, workout) => {
        acc[workout.performed_at] = {
            marked: true,
            dotColor: workout.is_finished ? '#f5c842' : '#3b82f6'
        }
        return acc
    }, {} as Record<string, any>)

    return { workouts, markedDates }
}
