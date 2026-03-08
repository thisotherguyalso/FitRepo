import { useState, useEffect } from 'react'
import { WorkoutPreset } from '@/types/database'
import { getWorkoutPresets } from '@/lib/api/workoutPresets'

export function usePresets() {
    const [presets, setPresets] = useState<WorkoutPreset[]>([])

    useEffect(() => {
        loadPresets()
    }, [])

    async function loadPresets() {
        const data = await getWorkoutPresets()
        setPresets(data ?? [])
    }

    return { presets }
}
