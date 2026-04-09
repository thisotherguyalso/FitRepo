import { supabase } from '@/lib/supabase'

function isInvalidRefreshTokenError(error: unknown) {
  return (
    error instanceof Error &&
    /invalid refresh token|refresh token not found/i.test(error.message)
  )
}

export async function recoverInvalidSession() {
  const { error } = await supabase.auth.getSession()

  if (error && isInvalidRefreshTokenError(error)) {
    await supabase.auth.signOut({ scope: 'local' })
    return true
  }

  return false
}
