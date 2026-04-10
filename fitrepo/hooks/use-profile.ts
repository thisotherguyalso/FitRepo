import { useState, useEffect } from 'react'
import { Profile } from '@/types/database'
import { getProfile } from '@/lib/api/profiles'
import { supabase } from '@/lib/supabase'

export function useProfile() {
    const [profile, setProfile] = useState<Profile | null>(null)

    useEffect(() => {
        void loadProfile()
    }, [])

    async function loadProfile() {
        const { data: { user }} = await supabase.auth.getUser()
        if (!user) return
        const data = await getProfile(user.id)
        setProfile(data ?? null)
    }

    return { profile }
}
