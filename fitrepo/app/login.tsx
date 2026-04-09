import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { useAuth } from '@/hooks/use-auth'
import { AppColors, sharedStyles } from '@/constants/styles'

WebBrowser.maybeCompleteAuthSession()

export default function Login() {
  // sets the states that triggers re-rendering of the screen
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const { loading, signUp, signIn, googleSignIn } = useAuth()

  return (
    <View style={[sharedStyles.screen, sharedStyles.screenContent, styles.container]}>
      <Text style={[sharedStyles.title, styles.title]}>FitRepo</Text>

      <TextInput
        style={[sharedStyles.input, styles.input]}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"/>

      <TextInput
        style={[sharedStyles.input, styles.input]}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry/>

      <TouchableOpacity style={[sharedStyles.button, styles.button]}
      onPress={() => isSignUp ? signUp(email, password) : signIn(email, password)}
      disabled={loading}>
        <Text style={sharedStyles.buttonText}>{loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[sharedStyles.button, styles.googleButton]} onPress={googleSignIn}>
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggle}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
  },
  title: {
    fontSize: 36,
    marginBottom: 40,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: AppColors.primary,
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: AppColors.text,
    marginBottom: 16,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  toggle: {
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
  },
})
