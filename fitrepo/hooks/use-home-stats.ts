import { useState, useEffect } from 'react'
import { getProfile } from '@/lib/api/profiles'
import { getPreviousWorkout, getWorkouts } from '@/lib/api/workouts'
import { supabase } from '@/lib/supabase'

export function useHomeStats() {
    const [userName, setUserName] = useState('')
    const [currentStreak, setCurrentStreak] = useState(0)
    const [totalWorkouts, setTotalWorkouts] = useState(0)
    const [previousWorkout, setPreviousWorkout] = useState('')
    const [previousWorkoutDate, setPreviousWorkoutDate] = useState<Date | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    async function loadStats() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const [profile, previous, workouts] = await Promise.all([
                getProfile(user.id),
                getPreviousWorkout(),
                getWorkouts()
            ])

            setUserName(profile?.username ?? user.email ?? 'there')
            setCurrentStreak(profile?.current_streak ?? 0)
            setTotalWorkouts(workouts?.length ?? 0)
            setPreviousWorkout(previous?.name ?? 'None')
            setPreviousWorkoutDate(previous?.performed_at ? new Date(previous.performed_at) : null)
        } catch (error: any) {
            console.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return { userName, currentStreak, totalWorkouts, previousWorkout, previousWorkoutDate, loading }
}
