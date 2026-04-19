import { useEffect } from 'react'
import { Stack } from "expo-router"
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { recoverInvalidSession } from '@/lib/auth-session'
import { useAppColors } from '@/constants/styles'


export default function RootLayout() {

  const colors = useAppColors();

  useEffect(() => {
    // local auth storage can get stale after provider logins/logouts, so sweep bad refresh tokens on boot
    void recoverInvalidSession()
  }, [])
  

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.tabBar }}>
        <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  )
}
