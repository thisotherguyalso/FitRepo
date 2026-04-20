import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { AppRadius, useAppColors } from '@/constants/styles'
import type { EditableExerciseGroup } from '@/lib/workout-editor'

type WorkoutSetEditorProps = {
  exercise: EditableExerciseGroup
  editable?: boolean
  onAddSet?: () => void
  onEditSet?: (setId: string) => void
  onRemoveSet?: (setId: string) => void
}
function formatSetPrimary(exerciseType: 'reps' | 'timed', value: string) {
  if (!value.trim()) {
    return exerciseType === 'timed' ? '-- sec' : '-- reps'
  }

  return exerciseType === 'timed' ? `${value} sec` : `${value} reps`
}

export function WorkoutSetEditor({
  exercise,
  editable = false,
  onAddSet,
  onEditSet,
  onRemoveSet,
}: WorkoutSetEditorProps) {
  const colors = useAppColors()

  return (
    <View style={styles.stack}>
      {exercise.sets.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No sets yet.</Text>
          {editable ? (
            <Pressable style={[styles.addSetButton, { backgroundColor: colors.panelStrong }]} onPress={onAddSet}>
              <Text style={[styles.addSetText, { color: colors.text }]}>Add first set</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        exercise.sets.map((set, index) => (
          <View key={set.id} style={[styles.rowCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Set {index + 1}</Text>
              <Text style={[styles.rowMeta, { color: colors.textMuted }]}>
                {formatSetPrimary(exercise.type, exercise.type === 'timed' ? set.time_seconds : set.reps)}
                {'  '}•{'  '}
                {set.weight.trim() ? `${set.weight} kg` : 'Bodyweight'}
              </Text>
              {set.set_notes.trim() ? (
                <Text style={[styles.rowNotes, { color: colors.textMuted }]} numberOfLines={2}>
                  {set.set_notes}
                </Text>
              ) : null}
            </View>

            {editable ? (
              <View style={styles.rowActions}>
                <Pressable style={[styles.iconButton, { backgroundColor: colors.panel }]} onPress={() => onEditSet?.(set.id)}>
                  <Ionicons name="create-outline" size={16} color={colors.text} />
                </Pressable>
                {exercise.sets.length > 1 ? (
                  <Pressable style={[styles.iconButton, { backgroundColor: colors.overlay }]} onPress={() => onRemoveSet?.(set.id)}>
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        ))
      )}

      {editable && exercise.sets.length > 0 ? (
        <Pressable style={[styles.addSetButton, { backgroundColor: colors.panelStrong }]} onPress={onAddSet}>
          <Text style={[styles.addSetText, { color: colors.text }]}>Add set</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 8,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: AppRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  rowCopy: {
    flex: 1,
    paddingRight: 10,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  rowNotes: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetButton: {
    alignSelf: 'flex-start',
    borderRadius: AppRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addSetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: AppRadius.md,
    padding: 12,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
  },
})
