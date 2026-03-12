import { Profiler, useState } from 'react'
import { Alert } from 'react-native'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { createProfile } from '@/lib/api/profiles'
import * as WebBrowser from 'expo-web-browser'

export function useAuth() {
    const [loading, setLoading] = useState(false)

    // Takes email password and username to sign up.
    async function signUp(
        email: string,
        password: string
    ) {
        setLoading(true)


        try {
            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) throw error
            if (data.user) {
                await createProfile(
                    data.user.id,
                    {
                        username: email.split('@')[0],
                        goal: "",
                        current_streak: 0
                    }
                )
            }
            Alert.alert('Success', 'Check your email to confirm your account!')
        } catch (error: any) {
            Alert.alert('Error', error.message)
        } finally {
            setLoading(false)
        }
    }

    // Takes an email and password to log in or sign in.
    async function signIn(
        email: string,
        password: string
    ) {
        setLoading(true)

        try {
            const {data, error} = await supabase.auth.signInWithPassword(
                { email, password }
            )
            if (error) throw error
            router.replace('/(tabs)/home' as any)
        } catch (error: any) {
            Alert.alert('Error', error.message)
        } finally {
            setLoading(false)
        }
    }

    // Signs in with Google Authentication
    async function googleSignIn() {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'https://jxuvpkwfpejflxlcopww.supabase.co/auth/v1/callback',
            skipBrowserRedirect: true,
          },
        })
    
        if (error) return Alert.alert('Error', error.message)
    
        const result = await WebBrowser.openAuthSessionAsync(
          data.url ?? '',
          'fitrepo://'
        )
    
        if (result.type === 'success') {
          await supabase.auth.exchangeCodeForSession(result.url)
        }
    }
    
    async function signOut() {
        await supabase.auth.signOut()
    }

    return { loading, signIn, signUp, googleSignIn, signOut}
}