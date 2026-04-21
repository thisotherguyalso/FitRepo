import { supabase } from '../supabase'

export async function getAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  // a bunch of api helpers assume a user exists, so fail loud here instead of returning null everywhere
  if (!user) throw new Error('No authenticated user found.')

  return user
}
