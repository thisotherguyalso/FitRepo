import { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import * as Linking from 'expo-linking'

export default function RootLayout() {
  const router = useRouter()

  useEffect(() => {
    // Handle deep links
    Linking.addEventListener('url', ({ url }) => {
      if (url) supabase.auth.exchangeCodeForSession(url)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) checkProfile(session.user.id)
      else router.replace('/login' as any)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) checkProfile(session.user.id)
      else router.replace('/login' as any)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('username').eq('id', userId).single()
    if (!data?.username) router.replace('/setup' as any)
    else router.replace('/(tabs)/home' as any)
  }

  return <Stack screenOptions={{ headerShown: false }} />
}