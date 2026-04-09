import { useState, useEffect } from 'react'
import { Exercise } from '@/types/database'
import { getExercises, createExercise, deleteExercise } from '@/lib/api/exercises'

export function useExercises() {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState(false) // loading is to check if async still loading

    useEffect(() => {
        loadExercises()
    }, [])

    async function loadExercises() {
        setLoading(true)
        try {
            const data = await getExercises()
            setExercises(data ?? [])
        } catch (error: any) {
            console.error(error.message)
            setExercises([])
        } finally {
            setLoading(false)
        }
    }
    return { exercises, loading, loadExercises }
}

export function addExercise(exercise: { id: string; name: string }) {
    return createExercise(exercise)
}

export function removeExercise(id: string) {
    return deleteExercise(id)
}

export function updateExercise(exercise: Exercise, editedName: string) {
    
}
