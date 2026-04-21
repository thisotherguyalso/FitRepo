import { getProfile } from '@/lib/api/profiles'
import { supabase } from '@/lib/supabase'

export function resolveEffectiveWeight(weight: number | null | undefined, bodyWeightKg: number | null | undefined) {
  if (weight != null) {
    return weight
  }

  return bodyWeightKg ?? null
}

export async function getCurrentUserBodyWeightKg() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  try {
    const profile = await getProfile(user.id)
    return profile?.body_weight_kg ?? null
  } catch {
    // don't hard fail over a missing profile. just fall back to the old null weight behavior.
    return null
  }
}
