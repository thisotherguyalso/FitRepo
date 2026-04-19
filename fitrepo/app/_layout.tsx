import { useEffect } from 'react'
import { Stack } from "expo-router"
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { recoverInvalidSession } from '@/lib/auth-session'

import * as NavigationBar from 'expo-navigation-bar'
import { useColorScheme } from 'react-native'


export default function RootLayout() {
 const scheme = useColorScheme()
  
  useEffect(() => {
    // local auth storage can get stale after provider logins/logouts, so sweep bad refresh tokens on boot
    void recoverInvalidSession()
    void NavigationBar.setBackgroundColorAsync(
      scheme === 'light' ? 'rgba(245, 242, 234, 0.0)' : 'rgba(0,0,0,0.0)'
    )
    void NavigationBar.setPositionAsync('absolute')
  }, [scheme])
  

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  )
}
