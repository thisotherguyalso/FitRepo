import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'

import { AppRadius, useAppColors } from '@/constants/styles'
import { inferExerciseTags } from '@/lib/exercise-tags'
import { resolveExerciseImageUrl } from '@/lib/exercise-images'

type ExerciseInfoPanelProps = {
  name: string
  type: 'reps' | 'timed'
  description?: string
  imageUrl?: string
}

export function ExerciseInfoPanel({
  name,
  type,
  description,
  imageUrl,
}: ExerciseInfoPanelProps) {
  const colors = useAppColors()
  const tags = inferExerciseTags(name, description)
  const resolvedImageUrl = resolveExerciseImageUrl(imageUrl)

  return (
    <View style={[styles.panel, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={[styles.imageWrap, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          {resolvedImageUrl ? (
            <Image source={{ uri: resolvedImageUrl }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={[styles.imageFallback, { backgroundColor: colors.overlay }]}>
              <Text style={[styles.imageFallbackText, { color: colors.textMuted }]}>
                {type === 'timed' ? 'Timed' : 'Reps'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.copy}>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            {description?.trim() || 'No exercise description yet.'}
          </Text>
        </View>
      </View>

      <View style={styles.tagsRow}>
        {tags.map((tag) => (
          <View key={`${name}-${tag}`} style={[styles.tag, { backgroundColor: colors.panelStrong }]}>
            <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: AppRadius.md,
    padding: 12,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  imageWrap: {
    width: 76,
    height: 76,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  imageFallbackText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  copy: {
    flex: 1,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: AppRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
})
