import { Pressable, Text, StyleSheet, TextInput, Alert, View, ScrollView, ActivityIndicator } from 'react-native';
import { useMemo, useState } from 'react';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ButtonComponent } from '@/components/button-component';
import { useLocalSearchParams, router } from 'expo-router';
import { createWorkoutFromPreset } from '@/lib/api/createWorkoutFromPreset';
import { usePresets } from '@/hooks/use-presets';
import { AppRadius, sharedStyles, useAppColors } from '@/constants/styles';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getExercisesInPreset } from '@/lib/api/presetExercises';

type PresetPreviewExercise = {
  id: string
  exercise_id: string
  sets: number | null
  reps: number | null
  time_seconds: number | null
  order_index: number
  exercises?: {
    name?: string
    type?: 'timed' | 'reps'
  } | null
}

export default function PresetList() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { presets, loading: loadingPresets } = usePresets();

  const [creatingPresetWorkout, setCreatingPresetWorkout] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [previewingPresetId, setPreviewingPresetId] = useState<string | null>(null);
  const [previewExercises, setPreviewExercises] = useState<PresetPreviewExercise[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const colors = useAppColors();

  const readableDate = date
    ? new Date(date).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const filteredPresets = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed) return presets;
    return presets.filter((preset) =>
      preset.name.toLowerCase().includes(trimmed)
    );
  }, [search, presets]);

  function formatPresetExercise(exercise: PresetPreviewExercise) {
    const setCount = exercise.sets ?? 1

    if (exercise.exercises?.type === 'timed') {
      return `${setCount} set${setCount !== 1 ? 's' : ''} • ${exercise.time_seconds ?? 30}s`
    }

    return `${setCount} set${setCount !== 1 ? 's' : ''} • ${exercise.reps ?? 10} reps`
  }

  async function handleOpenPresetPreview(preset_id: string) {
    try {
      setPreviewingPresetId(preset_id);
      setPreviewExercises([]);
      setPreviewLoading(true);
      const data = await getExercisesInPreset(preset_id);
      setPreviewExercises((data ?? []) as PresetPreviewExercise[]);
    } catch (error: any) {
      setPreviewingPresetId(null);
      Alert.alert('Error', error.message);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleUsePreset(preset_id: string) {
    try {
      if (!date) throw new Error('No workout date was provided.');
      setCreatingPresetWorkout(preset_id);

      // keep the loading state tied to one preset row so the whole list doesn't feel frozen
      const workout = await createWorkoutFromPreset(preset_id, date);

      Alert.alert('Success', 'Workout created from preset.');
      setPreviewingPresetId(null);
      router.replace({
        pathname: '/view_workout',
        params: { workout_id: workout.id, return_to: 'workouts' },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCreatingPresetWorkout(null);
    }
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ParallaxScrollView>
        <LinearGradient
          colors={[colors.primary, colors.background]}
          style={sharedStyles.background}
        />

        <Pressable style={styles.topBackButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={16} color={colors.text} />
          <Text style={[styles.topBackText, { color: colors.text }]}>Back</Text>
        </Pressable>

        <View style={[sharedStyles.card, styles.heroCard, { backgroundColor: colors.tabBar, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.textAccent }]}>GLOBAL PRESETS</Text>
          <Text style={[styles.header, { color: colors.text }]}>Load a preset</Text>
          <Text style={[styles.subheader, { color: colors.textMuted }]}>
            Pick any saved preset and drop it straight onto {readableDate || 'your selected date'}.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Find presets</Text>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Search presets..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Available presets</Text>
        <View style={[sharedStyles.card, styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {loadingPresets ? (
            <Text style={[styles.emptyText, { color: colors.textSubtle }]}>Loading presets...</Text>
          ) : filteredPresets.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSubtle }]}>
              {search.trim() ? 'No matching presets found.' : 'No presets available yet.'}
            </Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator nestedScrollEnabled>
              {filteredPresets.map((preset) => {
                const isCreating = creatingPresetWorkout === preset.id;
                const isPreviewing = previewingPresetId === preset.id;

                return (
                  <View key={preset.id} style={styles.presetStack}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.listRow,
                        {
                          backgroundColor: colors.surfaceAlt,
                          borderColor: colors.border,
                          opacity: isCreating ? 0.55 : pressed ? 0.92 : 1,
                        },
                      ]}
                      onPress={() => {
                        if (isPreviewing) {
                          setPreviewingPresetId(null)
                          setPreviewExercises([])
                          return
                        }

                        void handleOpenPresetPreview(preset.id)
                      }}
                      disabled={isCreating}
                    >
                      <View style={styles.listRowContent}>
                        <View style={styles.listRowHeading}>
                          <Text style={[styles.listRowTitle, { color: colors.text }]}>{preset.name}</Text>
                          <View
                            style={[
                              styles.visibilityPill,
                              {
                                backgroundColor: preset.is_public ? colors.primary : colors.overlay,
                              },
                            ]}
                          >
                            <Text style={styles.visibilityPillText}>
                              {preset.is_public ? 'Public' : 'Private'}
                            </Text>
                          </View>
                        </View>
                        {preset.created_at && (
                          <Text style={[styles.listRowSubtitle, { color: colors.textMuted }]}>
                            {preset.is_public ? 'Shared preset' : 'Private preset'} • Created {new Date(preset.created_at).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.usePill, { backgroundColor: colors.panelStrong }]}>
                        <Text style={[styles.useText, { color: colors.text }]}>
                          {isCreating ? 'Creating...' : isPreviewing ? 'Hide' : 'Preview'}
                        </Text>
                      </View>
                    </Pressable>

                    {isPreviewing ? (
                      <View style={[styles.inlinePreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.previewEyebrow, { color: colors.textAccent }]}>PRESET PREVIEW</Text>
                        <Text style={[styles.previewTitle, { color: colors.text }]}>{preset.name}</Text>
                        <Text style={[styles.previewSubtitle, { color: colors.textMuted }]}>
                          Quick look before you drop it onto {readableDate || 'your selected date'}.
                        </Text>

                        <View style={[sharedStyles.card, styles.previewListCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                          {previewLoading ? (
                            <View style={styles.previewLoading}>
                              <ActivityIndicator color={colors.textAccent} />
                              <Text style={[styles.previewLoadingText, { color: colors.textMuted }]}>Loading preset...</Text>
                            </View>
                          ) : previewExercises.length === 0 ? (
                            <Text style={[styles.emptyText, { color: colors.textSubtle }]}>No exercises in this preset yet.</Text>
                          ) : (
                            previewExercises.map((exercise, index) => (
                              <View
                                key={exercise.id}
                                style={[styles.previewExerciseRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                              >
                                <View style={[styles.previewIndexPill, { backgroundColor: colors.panelStrong }]}>
                                  <Text style={[styles.previewIndexText, { color: colors.text }]}>{index + 1}</Text>
                                </View>
                                <View style={styles.previewExerciseCopy}>
                                  <Text style={[styles.previewExerciseName, { color: colors.text }]}>
                                    {exercise.exercises?.name ?? 'Exercise'}
                                  </Text>
                                  <Text style={[styles.previewExerciseMeta, { color: colors.textMuted }]}>
                                    {formatPresetExercise(exercise)}
                                  </Text>
                                </View>
                              </View>
                            ))
                          )}
                        </View>

                        <View style={styles.previewActions}>
                          <ButtonComponent
                            onPress={() => {
                              void handleUsePreset(preset.id);
                            }}
                            text={creatingPresetWorkout === preset.id ? 'Creating workout...' : 'Use preset'}
                            disabled={previewLoading || creatingPresetWorkout === preset.id}
                          />
                        </View>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        <ButtonComponent
          text="Back"
          onPress={() => router.back()}
          style={{ backgroundColor: colors.secondary }}
        />

      </ParallaxScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  topBackButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  topBackText: {
    fontSize: 14,
    fontWeight: '700',
  },
  heroCard: {
    gap: 10,
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.2,
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subheader: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 6,
  },
  searchInput: {
    borderWidth: 1,
    padding: 14,
    borderRadius: AppRadius.md,
    marginBottom: 16,
    fontSize: 16,
  },
  listContainer: {
    maxHeight: 400,
    padding: 8,
    marginBottom: 24,
  },
  presetStack: {
    marginBottom: 8,
  },
  listRow: {
    borderRadius: AppRadius.md,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listRowContent: {
    flex: 1,
  },
  listRowHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  listRowTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  listRowSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  visibilityPill: {
    borderRadius: AppRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  visibilityPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  usePill: {
    borderRadius: AppRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  useText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    padding: 8,
  },
  inlinePreview: {
    borderWidth: 1,
    borderRadius: 20,
    marginTop: 8,
    padding: 14,
    gap: 10,
  },
  previewSheet: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 10,
  },
  previewEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  previewSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewListCard: {
    maxHeight: 320,
    padding: 8,
  },
  previewLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  previewLoadingText: {
    fontSize: 14,
  },
  previewExerciseRow: {
    borderWidth: 1,
    borderRadius: AppRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewIndexPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIndexText: {
    fontSize: 12,
    fontWeight: '800',
  },
  previewExerciseCopy: {
    flex: 1,
  },
  previewExerciseName: {
    fontSize: 14,
    fontWeight: '700',
  },
  previewExerciseMeta: {
    fontSize: 12,
    marginTop: 3,
  },
  previewActions: {
    gap: 10,
  },
});
