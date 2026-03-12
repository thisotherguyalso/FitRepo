import { useState, useEffect } from 'react'
import { Workout } from '@/types/database'
import { getWorkouts, createWorkout } from '@/lib/api/workouts'

export function useWorkouts() {
    const [workouts, setWorkouts] = useState<Workout[]>([])
    const [loading, setLoading] = useState(false)

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

    async function planWorkout(workout: Omit<Workout, 'id' | 'user_id' | 'created_at'>) {
        setLoading(true)
        try {
            const data = await createWorkout(workout)
            setWorkouts(prev => [...prev, data])
        } catch (error: any) {
            console.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return { loading, workouts, markedDates, planWorkout }
}
