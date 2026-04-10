import { useCallback, useEffect, useState } from 'react'
import { WorkoutPreset } from '@/types/database'
import { getWorkoutPresets } from '@/lib/api/workoutPresets'

export function usePresets() {
    const [presets, setPresets] = useState<WorkoutPreset[]>([])
    const [loading, setLoading] = useState(false)

    const loadPresets = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getWorkoutPresets()
            setPresets(data ?? [])
        } catch (error: any) {
            console.error(error.message)
            setPresets([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadPresets()
    }, [loadPresets])

    return { presets, loading, loadPresets }
}
