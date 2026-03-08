import { useState, useEffect } from 'react'
import { Exercise } from '@/types/database'
import { getExercises } from '@/lib/api/exercises'

export function useExercises() {
    const [exercises, setExercises] = useState<Exercise[]>([])

    useEffect(() => {
        loadExercises()
    }, [])

    async function loadExercises() {
        const data = await getExercises()
        setExercises(data ?? [])
    }

    return { exercises }
}
