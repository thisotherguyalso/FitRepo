import { TouchableOpacity, Text, StyleSheet, TextInput, Alert, View, ScrollView } from 'react-native';
import { useMemo, useState } from 'react';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ButtonComponent } from '@/components/button-component';
import { useLocalSearchParams, router } from 'expo-router';
import { createWorkoutFromPreset } from '@/lib/api/createWorkoutFromPreset';
import { usePresets } from '@/hooks/use-presets';
import { AppColors, AppRadius, sharedStyles } from '@/constants/styles';
import { LinearGradient } from 'expo-linear-gradient';

export default function PresetList() {
  const { date } = useLocalSearchParams<{ date?: string }>();
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

      // keep the loading state tied to one preset row so the whole list doesn't feel frozen
      const workout = await createWorkoutFromPreset(preset_id, date);

      Alert.alert('Success', 'Workout created from preset.');
      router.replace({
        pathname: '/view_workout',
        params: { workout_id: workout.id },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCreatingPresetWorkout(null);
    }
  }

  return (
    <View style={styles.wrapper}>
      <ParallaxScrollView>
        <LinearGradient
          colors={['#020975', '#0d0d12']}
          style={sharedStyles.background}
        />

        {/* Header */}
        <Text style={styles.header}>Load Preset</Text>
        <Text style={styles.subheader}>{readableDate || 'Selected Date'}</Text>

        {/* Search */}
        <Text style={styles.sectionTitle}>Find Presets</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search presets..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />

        {/* Available Presets */}
        <Text style={styles.sectionTitle}>Available Presets</Text>
        <View style={styles.listContainer}>
          {loadingPresets ? (
            <Text style={styles.emptyText}>Loading presets...</Text>
          ) : filteredPresets.length === 0 ? (
            <Text style={styles.emptyText}>
              {search.trim() ? 'No matching presets found.' : 'No presets available yet.'}
            </Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator nestedScrollEnabled>
              {filteredPresets.map((preset) => {
                const isCreating = creatingPresetWorkout === preset.id;

                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={[styles.listRow, isCreating && styles.listRowSelected]}
                    onPress={() => handleUsePreset(preset.id)}
                    disabled={isCreating}
                  >
                    <View style={styles.listRowContent}>
                      <Text style={styles.listRowTitle}>{preset.name}</Text>
                      {preset.created_at && (
                        <Text style={styles.listRowSubtitle}>
                          Created {new Date(preset.created_at).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.useText}>
                      {isCreating ? 'Creating...' : 'Use'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Back Button */}
        <ButtonComponent
          text="Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </ParallaxScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0d0d12',
  },
  header: {
    color: AppColors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheader: {
    color: '#93c5fd',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  searchInput: {
    backgroundColor: '#1c1c1f',
    color: AppColors.text,
    padding: 14,
    borderRadius: AppRadius.md,
    marginBottom: 16,
    fontSize: 16,
  },
  listContainer: {
    maxHeight: 400,
    backgroundColor: '#141417',
    borderRadius: AppRadius.lg,
    padding: 8,
    marginBottom: 24,
  },
  listRow: {
    backgroundColor: '#1c1c1f',
    borderRadius: AppRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listRowSelected: {
    opacity: 0.5,
  },
  listRowContent: {
    flex: 1,
  },
  listRowTitle: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  listRowSubtitle: {
    color: '#93c5fd',
    fontSize: 13,
    marginTop: 4,
  },
  useText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: AppColors.text,
    fontSize: 15,
    opacity: 0.5,
    padding: 8,
  },
  backButton: {
    backgroundColor: '#7f1d1d',
    padding: 16,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
    marginBottom: 24,
  },
});
