import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { getProfile, updateProfile } from '@/lib/api/profiles'
import { getPreviousWorkout, getWorkouts } from '@/lib/api/workouts'
import { supabase } from '@/lib/supabase'
import { Workout } from '@/types/database'

function toLocalDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function parseWorkoutDate(value: string) {
  // adding noon avoids the weird timezone drift you get from parsing yyyy-mm-dd as midnight utc
  return new Date(`${value}T12:00:00`)
}

function calculateCurrentStreak(workouts: Workout[]) {
  const completedDays = Array.from(
    new Set(
      workouts
        .filter((workout) => workout.is_finished)
        .map((workout) => workout.performed_at)
    )
  ).sort((a, b) => a.localeCompare(b))

  if (completedDays.length === 0) {
    return 0
  }

  const latest = parseWorkoutDate(completedDays[completedDays.length - 1])
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const latestKey = toLocalDateKey(latest)
  if (latestKey !== toLocalDateKey(today) && latestKey !== toLocalDateKey(yesterday)) {
    return 0
  }

  let streak = 0
  let cursor = new Date(latest)

  for (let index = completedDays.length - 1; index >= 0; index -= 1) {
    const currentKey = completedDays[index]
    if (currentKey !== toLocalDateKey(cursor)) {
      break
    }

    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

function getSafeErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Unknown error'
  }

  // cloudflare/supabase can dump a whole html page here. trim it so metro doesn't scream the entire document back at you.
  return error.message.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220)
}

export function useHomeStats() {
  const [userName, setUserName] = useState('')
  const [currentStreak, setCurrentStreak] = useState(0)
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [previousWorkout, setPreviousWorkout] = useState('')
  const [previousWorkoutDate, setPreviousWorkoutDate] = useState<Date | null>(null)
  const [heightCm, setHeightCm] = useState<number | null>(null)
  const [bodyWeightKg, setBodyWeightKg] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      void loadStats()
    }, [])
  )

  async function loadStats() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const [profileResult, previousResult, workoutsResult] = await Promise.allSettled([
        getProfile(user.id),
        getPreviousWorkout(),
        getWorkouts(),
      ])

      const profile = profileResult.status === 'fulfilled' ? profileResult.value : null
      const workouts = workoutsResult.status === 'fulfilled' ? workoutsResult.value ?? [] : []
      const previous =
        previousResult.status === 'fulfilled'
          ? previousResult.value
          : workouts
              .filter((workout) => workout.is_finished)
              .sort((a, b) => b.performed_at.localeCompare(a.performed_at))[0] ?? null

      const streak = calculateCurrentStreak(workouts)

      setUserName(profile?.username ?? user.email ?? 'there')
      setCurrentStreak(streak)
      setTotalWorkouts(workouts.length)
      setPreviousWorkout(previous?.name ?? 'None')
      setPreviousWorkoutDate(previous?.performed_at ? parseWorkoutDate(previous.performed_at) : null)
      setHeightCm(profile?.height_cm ?? null)
      setBodyWeightKg(profile?.body_weight_kg ?? null)

      if (profile && profile.current_streak !== streak) {
        // keep the profile field in sync for any other screens that still read it
        void updateProfile(user.id, { current_streak: streak }).catch(() => {})
      }

      if (profileResult.status === 'rejected') {
        console.warn(`profile stats failed: ${getSafeErrorMessage(profileResult.reason)}`)
      }

      if (previousResult.status === 'rejected') {
        console.warn(`previous workout lookup failed: ${getSafeErrorMessage(previousResult.reason)}`)
      }

      if (workoutsResult.status === 'rejected') {
        console.warn(`workout stats failed: ${getSafeErrorMessage(workoutsResult.reason)}`)
      }
    } catch (error) {
      console.warn(`home stats failed: ${getSafeErrorMessage(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return {
    userName,
    currentStreak,
    totalWorkouts,
    previousWorkout,
    previousWorkoutDate,
    heightCm,
    bodyWeightKg,
    loading,
  }
}
