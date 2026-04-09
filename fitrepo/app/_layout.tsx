import { useEffect } from 'react'
import { Stack } from "expo-router"
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { recoverInvalidSession } from '@/lib/auth-session'

export default function RootLayout() {
  useEffect(() => {
    void recoverInvalidSession()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  )
}
