import { supabase } from '../supabase'
import { Profile } from '@/types/database'

type ProfileInsert = Omit<Profile, 'id' | 'started_at'>

function isMissingColumnError(message: string | undefined) {
    const normalized = message?.toLowerCase() ?? ''
    return normalized.includes('column') && normalized.includes('does not exist')
}

function stripOptionalMetrics<T extends Record<string, unknown>>(profile: T) {
    const { height_cm, body_weight_kg, ...rest } = profile
    return rest
}

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
    let { data, error } = await supabase.from('profiles')
        .update(profile)
        .eq("id", id)
        .select().single()

    // older dbs might not have the metric columns yet, so retry without them instead of nuking profile saves
    if (error && isMissingColumnError(error.message)) {
        ;({ data, error } = await supabase.from('profiles')
            .update(stripOptionalMetrics(profile))
            .eq("id", id)
            .select().single())
    }

    if (error) throw error
    return data
}

// Creates a profile
export async function createProfile(
    user_id: string,
    profile: ProfileInsert
) {
  let { data, error } = await supabase.from('profiles')
    .insert({
        id: user_id,
        ...profile
    }).select().single()

  if (error && isMissingColumnError(error.message)) {
    // same fallback here so signups still work on projects that haven't added the new profile fields yet
    ;({ data, error } = await supabase.from('profiles')
      .insert({
        id: user_id,
        ...stripOptionalMetrics(profile)
      }).select().single())
  }

  if (error) throw error
  return data
}
