import { supabase } from '../supabase'
import { Profile } from '@/types/database'

export async function getProfile(
    id: string
) {
    const { data, error } = await supabase.from('profiles')
        .select('*')
        .eq('id', id)
        .single()
    if (error) throw error
    return data
}

export async function updateProfile(
    id: string,
    profile: Partial<Profile>
) {
    const { data, error } = await supabase.from('profiles')
        .update(profile)
        .eq("id", id)
        .select().single()
    if (error) throw error
    return data
}
