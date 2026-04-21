import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useEffect, useState } from 'react'

import { ButtonComponent } from '@/components/button-component'
import { AppRadius, useAppColors } from '@/constants/styles'
import type { EditableSet } from '@/lib/workout-editor'

type SetComposerSheetProps = {
  visible: boolean
  exerciseName: string
  type: 'reps' | 'timed'
  initialSet?: EditableSet | null
  onClose: () => void
  onSave: (values: Pick<EditableSet, 'reps' | 'time_seconds' | 'weight' | 'set_notes'>) => void
}

export function SetComposerSheet({
  visible,
  exerciseName,
  type,
  initialSet,
  onClose,
  onSave,
}: SetComposerSheetProps) {
  const colors = useAppColors()
  const [reps, setReps] = useState('')
  const [timeSeconds, setTimeSeconds] = useState('')
  const [weight, setWeight] = useState('')
  const [setNotes, setSetNotes] = useState('')

  useEffect(() => {
    if (!visible) return
    setReps(initialSet?.reps ?? '')
    setTimeSeconds(initialSet?.time_seconds ?? '')
    setWeight(initialSet?.weight ?? '')
    setSetNotes(initialSet?.set_notes ?? '')
  }, [initialSet, visible])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.textAccent }]}>SET DETAILS</Text>
          <Text style={[styles.title, { color: colors.text }]}>{exerciseName}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {type === 'reps'
              ? 'Add reps, load, and any note for this set.'
              : 'Add time, load, and any note for this set.'}
          </Text>

          <View style={styles.form}>
            {type === 'reps' ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                placeholder="Reps"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={reps}
                onChangeText={setReps}
              />
            ) : (
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                placeholder="Seconds"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={timeSeconds}
                onChangeText={setTimeSeconds}
              />
            )}

            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
              placeholder="Weight in kg, or leave blank for bodyweight"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />

            <TextInput
              style={[styles.input, styles.notesInput, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
              placeholder="Set notes"
              placeholderTextColor={colors.textMuted}
              value={setNotes}
              onChangeText={setSetNotes}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.actions}>
            <ButtonComponent
              onPress={() => onSave({ reps, time_seconds: timeSeconds, weight, set_notes: setNotes })}
              text="Save set"
            />
            <ButtonComponent
              onPress={onClose}
              text="Cancel"
              style={{ backgroundColor: colors.secondary }}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(6, 12, 20, 0.48)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 10,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    gap: 10,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: AppRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  notesInput: {
    minHeight: 92,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
})
