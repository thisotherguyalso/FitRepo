import { supabase } from '../supabase'
import { Profile } from '@/types/database'

// Gets a user's profile based on id
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

// Updates a user's profile
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

// Creates a profile
export async function createProfile(
    user_id: string,
    profile: Omit<Profile, 'id' | 'started_at'>
) {
  const { data, error } = await supabase.from('profiles')
    .insert({
        id: user_id,
        ...profile
    }).select().single()
  if (error) throw error
  return data
}