import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { AppColors, sharedStyles } from '@/constants/styles'

export default function Setup() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!username.trim()) return Alert.alert('Please enter a username')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('profiles').upsert({ 
        id: user.id,
        username,
        started_at: new Date().toISOString(),
        })
      if (error) Alert.alert('Error', error.message)
      else router.replace('/(tabs)/home' as any)
    }
    setLoading(false)
  }

  return (
    <View style={[sharedStyles.screen, sharedStyles.screenContent, styles.container]}>
      <Text style={[sharedStyles.title, styles.title]}>What should we call you?</Text>
      <Text style={[sharedStyles.mutedText, styles.subtitle]}>You can change this later</Text>

      <TextInput
        style={[sharedStyles.input, styles.input]}
        placeholder="Username"
        placeholderTextColor="#666"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TouchableOpacity style={[sharedStyles.button, styles.button]} onPress={handleSave} disabled={loading}>
        <Text style={sharedStyles.buttonText}>{loading ? 'Saving...' : 'Continue'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: AppColors.primary,
  },
})
