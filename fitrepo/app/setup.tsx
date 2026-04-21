import { useMemo, useState } from 'react'
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { ButtonComponent } from '@/components/button-component'
import { createProfile, updateProfile } from '@/lib/api/profiles'
import { supabase } from '@/lib/supabase'
import { sharedStyles, useAppColors } from '@/constants/styles'

export default function Setup() {
  const [username, setUsername] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [bodyWeightKg, setBodyWeightKg] = useState('')
  const [loading, setLoading] = useState(false)
  const colors = useAppColors()
  const buttonText = useMemo(() => (loading ? 'Saving...' : 'Continue'), [loading])

  async function handleSave() {
    if (!username.trim()) return Alert.alert('Please enter a username')
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const payload = {
        username: username.trim(),
        goal: '',
        current_streak: 0,
        height_cm: heightCm.trim() ? Number(heightCm) : null,
        body_weight_kg: bodyWeightKg.trim() ? Number(bodyWeightKg) : null,
      }

      try {
        // setup can be reopened later, so try update first and only insert if the row doesn't exist yet
        await updateProfile(user.id, payload)
      } catch {
        try {
          await createProfile(user.id, payload)
        } catch (error: any) {
          Alert.alert('Error', error.message)
          setLoading(false)
          return
        }
      }

      router.replace('/(tabs)/home' as any)
    }

    setLoading(false)
  }

  return (
    <View style={[sharedStyles.screen, styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      <View style={[sharedStyles.screenContent, styles.container]}>
        <View style={[sharedStyles.card, styles.card, { backgroundColor: colors.tabBar, borderColor: colors.borderStrong }]}>
          <Text style={[styles.eyebrow, { color: colors.textAccent }]}>SETUP</Text>
          <Text style={[sharedStyles.title, styles.title]}>What should we call you?</Text>
          <Text style={[sharedStyles.mutedText, styles.subtitle]}>
            Drop in your nickname, then add your current metrics so the app feels like yours right away.
          </Text>

          <TextInput
            style={[sharedStyles.input, styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Nickname"
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="words"
          />

          <View style={styles.metricRow}>
            <TextInput
              style={[sharedStyles.input, styles.metricInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="Height (cm)"
              placeholderTextColor={colors.textMuted}
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
            />

            <TextInput
              style={[sharedStyles.input, styles.metricInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="Body weight (kg)"
              placeholderTextColor={colors.textMuted}
              value={bodyWeightKg}
              onChangeText={setBodyWeightKg}
              keyboardType="numeric"
            />
          </View>

          <ButtonComponent onPress={handleSave} text={buttonText} disabled={loading} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    justifyContent: 'center',
  },
  card: {
    gap: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.2,
    textAlign: 'center',
  },
  title: {
    fontSize: 30,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 21,
  },
  input: {
    marginBottom: 4,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricInput: {
    flex: 1,
  }
})
