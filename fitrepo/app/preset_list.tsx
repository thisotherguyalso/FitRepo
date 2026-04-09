import { TouchableOpacity, Text, StyleSheet, TextInput, Alert, View, ScrollView } from 'react-native';
import { useMemo, useState } from 'react';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useLocalSearchParams, router } from 'expo-router';
import { createWorkoutFromPreset } from '@/lib/api/createWorkoutFromPreset';
import { usePresets } from '@/hooks/use-presets';
import { AppColors, AppRadius, AppSpacing, sharedStyles } from '@/constants/styles';
import { LinearGradient } from 'expo-linear-gradient';

export default function PresetList() {
  const { date } = useLocalSearchParams<{
    date?: string;
  }>();
  const { presets, loading: loadingPresets } = usePresets();

  const [creatingPresetWorkout, setCreatingPresetWorkout] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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

  async function handleUsePreset(preset_id: string) {
    try {
      if (!date) throw new Error('No workout date was provided.');
      setCreatingPresetWorkout(preset_id);
      const workout = await createWorkoutFromPreset(preset_id, date);

      Alert.alert('Success', 'Workout created from preset.');
      router.replace({
        pathname: '/view_workout',
        params: {
          workout_id: workout.id,
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCreatingPresetWorkout(null);
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
      <LinearGradient
        colors={['#020975fb', '#151718']}
        style={sharedStyles.background}
      />
      <View style={styles.container}>
        <Text style={[sharedStyles.title, styles.headerText]}>
          Presets for {'\n'}{readableDate || 'Selected Date'}
        </Text>

        <Text style={[sharedStyles.sectionTitle, styles.sectionTitle]}>Find Presets</Text>

        <TextInput
          style={[sharedStyles.input, styles.searchInput]}
          placeholder="Search presets..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />

        <Text style={[sharedStyles.sectionTitle, styles.sectionTitle]}>Available Presets</Text>

        <View style={styles.listContainer}>
          {loadingPresets ? (
            <Text style={[sharedStyles.emptyText, styles.emptyText]}>Loading presets...</Text>
          ) : filteredPresets.length === 0 ? (
            <Text style={[sharedStyles.emptyText, styles.emptyText]}>
              {search.trim()
                ? 'No matching presets found.'
                : 'No presets available yet.'}
            </Text>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {filteredPresets.map((preset) => {
                const isCreating = creatingPresetWorkout === preset.id;

                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={[sharedStyles.card, styles.listRow, isCreating && styles.listRowSelected]}
                    onPress={() => handleUsePreset(preset.id)}
                    disabled={isCreating}
                  >
                    <View>
                      <Text style={[sharedStyles.sectionTitle, styles.listRowTitle]}>{preset.name}</Text>

                      {preset.created_at ? (
                        <Text style={styles.listRowSubtitle}>
                          Created {new Date(preset.created_at).toLocaleDateString()}
                        </Text>
                      ) : null}
                    </View>

                    <Text style={styles.addText}>
                      {isCreating ? 'Creating...' : 'Use'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity
          style={[sharedStyles.button, styles.backButton]}
          onPress={() => router.back()}
        >
          <Text style={sharedStyles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  headerText: {
    fontSize: 30,
    marginTop: 12,
    marginBottom: 20,
    lineHeight: 36,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 12,
    marginTop: 12,
  },
  searchInput: {
    marginBottom: 16,
  },
  listContainer: {
    maxHeight: 320,
    backgroundColor: AppColors.panelAlt,
    borderRadius: AppRadius.lg,
    padding: 8,
    marginBottom: 12,
  },
  listRow: {
    paddingVertical: 14,
    paddingHorizontal: AppSpacing.md,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listRowSelected: {
    opacity: 0.5,
  },
  listRowTitle: {
    fontSize: 16,
  },
  listRowSubtitle: {
    color: '#93c5fd',
    fontSize: 13,
    marginTop: 2,
  },
  addText: {
    color: AppColors.secondary,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#c62b2b',
    marginBottom: 24,
  },
});
