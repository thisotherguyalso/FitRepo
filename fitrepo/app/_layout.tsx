import { useEffect } from "react"
import { Stack } from "expo-router"
import { supabase } from "@/lib/supabase"
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function RootLayout() {
    useEffect(() => {
        supabase.auth.signInWithPassword({
            email: 'test@test.com',
            password: 'test'
        }).then(({ data, error }) => {
            if (error) console.log('sign in error:', error)
            else console.log('signed in as:', data.user?.email)
        })
    }, [])

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
    )
}