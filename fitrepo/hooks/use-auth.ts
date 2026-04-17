import { useState } from 'react'
import { Alert } from 'react-native'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { createProfile, getProfile } from '@/lib/api/profiles'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { recoverInvalidSession } from '@/lib/auth-session'

export function useAuth() {
    const [loading, setLoading] = useState(false)

    async function routeAfterAuth(userId: string) {
        try {
            const profile = await getProfile(userId)

            // if the nickname/setup stuff is still empty, shove them through setup instead of pretending they're done
            if (!profile?.username?.trim()) {
                router.replace('/setup' as any)
                return
            }

            router.replace('/(tabs)/home' as any)
        } catch {
            router.replace('/setup' as any)
        }
    }

    // Takes email password and username to sign up.
    async function signUp(
        email: string,
        password: string
    ) {
        setLoading(true)


        try {
            await recoverInvalidSession()
            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) throw error
            if (data.user) {
                await createProfile(
                    data.user.id,
                    {
                        // leave setup incomplete on purpose so the first real login still asks for nickname + stats
                        username: '',
                        goal: "",
                        current_streak: 0,
                        height_cm: null,
                        body_weight_kg: null,
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
            await recoverInvalidSession()
            const { error } = await supabase.auth.signInWithPassword(
                { email, password }
            )
            if (error) throw error;
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) throw new Error('No signed-in user found after login.')
            await routeAfterAuth(user.id)
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    // Signs in with Google Authentication
    async function googleSignIn() {
        setLoading(true)

        try {
            await recoverInvalidSession()

            const redirectTo = AuthSession.makeRedirectUri({
                scheme: 'fitrepo',
                path: 'auth/callback',
            })

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo,
                    skipBrowserRedirect: true,
                },
            })

            if (error) throw error
            if (!data?.url) {
                throw new Error('Google sign-in did not return an authorization URL.')
            }

            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)

            if (result.type !== 'success' || !('url' in result) || !result.url) {
                return
            }

            const callbackUrl = new URL(result.url)
            const code = callbackUrl.searchParams.get('code')
            const authErrorDescription =
                callbackUrl.searchParams.get('error_description') ??
                callbackUrl.searchParams.get('error')

            if (authErrorDescription) {
                throw new Error(authErrorDescription)
            }

            if (!code) {
                throw new Error('Google sign-in did not return an authorization code.')
            }

            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

            if (exchangeError) throw exchangeError

            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                throw new Error('No signed-in user found after Google sign-in.')
            }

            await routeAfterAuth(user.id)
        } catch (error: any) {
            Alert.alert('Error', error.message ?? 'Google sign-in failed.')
        } finally {
            setLoading(false)
        }
    }
    
    async function signOut() {
        await supabase.auth.signOut({ scope: 'local' });
        router.replace('/login');
    }

    return { loading, signIn, signUp, googleSignIn, signOut}
}
