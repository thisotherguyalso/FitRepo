import { useEffect, useMemo, useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown } from 'react-native-reanimated'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ButtonComponent } from '@/components/button-component'
import { getProfile, updateProfile } from '@/lib/api/profiles'
import { supabase } from '@/lib/supabase'
import { sharedStyles, useAppColors } from '@/constants/styles'

export default function ProfileScreen() {
  const colors = useAppColors()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState('')
  const [goal, setGoal] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [bodyWeightKg, setBodyWeightKg] = useState('')

  const trimmedUsername = username.trim()
  const previewName = trimmedUsername || 'athlete'
  const previewGoal = goal.trim() || 'No goal set yet'
  const previewHeight = heightCm.trim() ? `${heightCm.trim()} cm` : '--'
  const previewWeight = bodyWeightKg.trim() ? `${bodyWeightKg.trim()} kg` : '--'
  const hasDraftChanges = Boolean(username.trim() || goal.trim() || heightCm.trim() || bodyWeightKg.trim())

  useEffect(() => {
    void loadProfile()
  }, [])

  async function loadProfile() {
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login' as any)
        return
      }

      const profile = await getProfile(user.id)
      setUsername(profile?.username ?? '')
      setGoal(profile?.goal ?? '')
      setHeightCm(profile?.height_cm != null ? String(profile.height_cm) : '')
      setBodyWeightKg(profile?.body_weight_kg != null ? String(profile.body_weight_kg) : '')
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!username.trim()) {
      Alert.alert('Missing nickname', 'Drop in the name you want the app to call you.')
      return
    }

    setSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You need to be signed in to update your profile.')
      }

      await updateProfile(user.id, {
        username: username.trim(),
        goal: goal.trim(),
        height_cm: heightCm.trim() ? Number(heightCm) : null,
        body_weight_kg: bodyWeightKg.trim() ? Number(bodyWeightKg) : null,
      })

      router.back()
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const actionLabel = useMemo(() => (saving ? 'Saving...' : 'Save profile'), [saving])

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ParallaxScrollView>
        <LinearGradient
          colors={[colors.primary, colors.secondary, colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[sharedStyles.background, styles.heroGlow]}
        />

        <Animated.View
          entering={FadeInDown.duration(240)}
          style={[sharedStyles.card, styles.heroCard, { backgroundColor: colors.tabBar, borderColor: colors.borderStrong }]}
        >
          <Text style={[styles.eyebrow, { color: colors.textAccent2 }]}>PROFILE</Text>
          <Text style={[styles.title, { color: '#fff' }]}>Tune your profile</Text>
          <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.82)' }]}>
            Nickname, body metrics, and goals all live here now.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(280).delay(40)}
          style={[sharedStyles.card, styles.previewCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
        >
          <View style={styles.previewHeader}>
            <View style={[styles.previewBadge, { backgroundColor: colors.panelStrong }]}>
              <Text style={[styles.previewBadgeText, { color: colors.textAccent }]}>LIVE PREVIEW</Text>
            </View>
            <Text style={[styles.previewName, { color: colors.text }]}>{previewName}</Text>
            <Text style={[styles.previewGoal, { color: colors.textMuted }]}>{previewGoal}</Text>
          </View>

          <View style={styles.previewMetricsRow}>
            <View style={[styles.previewMetric, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="barbell-outline" size={18} color={colors.textAccent} />
              <Text style={[styles.previewMetricValue, { color: colors.text }]}>{previewWeight}</Text>
              <Text style={[styles.previewMetricLabel, { color: colors.textMuted }]}>Body Weight</Text>
            </View>
            <View style={[styles.previewMetric, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="resize-outline" size={18} color={colors.textAccent} />
              <Text style={[styles.previewMetricValue, { color: colors.text }]}>{previewHeight}</Text>
              <Text style={[styles.previewMetricLabel, { color: colors.textMuted }]}>Height</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(320).delay(90)}
          style={[sharedStyles.card, styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          {loading ? (
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading profile...</Text>
          ) : (
            <>
              <View style={styles.fieldHeader}>
                <Ionicons name="person-circle-outline" size={18} color={colors.textAccent} />
                <Text style={[styles.fieldHeaderText, { color: colors.text }]}>Identity</Text>
              </View>

              <TextInput
                style={[sharedStyles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                placeholder="Nickname"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
              />

              <TextInput
                style={[sharedStyles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                placeholder="Goal"
                placeholderTextColor={colors.textMuted}
                value={goal}
                onChangeText={setGoal}
              />

              <View style={styles.fieldHeader}>
                <Ionicons name="fitness-outline" size={18} color={colors.textAccent} />
                <Text style={[styles.fieldHeaderText, { color: colors.text }]}>Metrics</Text>
              </View>

              <View style={styles.metricRow}>
                <TextInput
                  style={[sharedStyles.input, styles.metricInput, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                  placeholder="Height (cm)"
                  placeholderTextColor={colors.textMuted}
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="numeric"
                />

                <TextInput
                  style={[sharedStyles.input, styles.metricInput, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                  placeholder="Body weight (kg)"
                  placeholderTextColor={colors.textMuted}
                  value={bodyWeightKg}
                  onChangeText={setBodyWeightKg}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.actions}>
                <ButtonComponent onPress={handleSave} text={actionLabel} disabled={saving} />
                <ButtonComponent
                  onPress={() => router.back()}
                  text={hasDraftChanges ? 'Back without saving' : 'Back'}
                  style={{ backgroundColor: colors.secondary }}
                  disabled={saving}
                />
              </View>
            </>
          )}
        </Animated.View>
      </ParallaxScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  heroGlow: {
    height: 290,
  },
  heroCard: {
    gap: 10,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.4,
  },
  title: {
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  formCard: {
    gap: 14,
  },
  previewCard: {
    gap: 16,
  },
  previewHeader: {
    gap: 8,
  },
  previewBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  previewName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  previewGoal: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewMetricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  previewMetric: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  previewMetricValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  previewMetricLabel: {
    fontSize: 13,
  },
  loadingText: {
    fontSize: 15,
    textAlign: 'center',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  fieldHeaderText: {
    fontSize: 16,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricInput: {
    flex: 1,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
})
