import { TouchableOpacity, Text, StyleSheet, TextInput, Alert, View, ScrollView } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useLocalSearchParams, router } from 'expo-router';
import { getWorkoutPresets } from '@/lib/api/workoutPresets';
import { createWorkoutFromPreset } from '@/lib/api/createWorkoutFromPreset';

type WorkoutPreset = {
  id: string;
  name: string;
  created_at?: string;
};

export default function PresetList() {
  const { date } = useLocalSearchParams<{
    date?: string;
  }>();

  const [presets, setPresets] = useState<WorkoutPreset[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [creatingPresetWorkout, setCreatingPresetWorkout] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const readableDate = date
    ? new Date(date).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  useEffect(() => {
    void loadPresets();
  }, []);

  async function loadPresets() {
    try {
      setLoadingPresets(true);
      const data = await getWorkoutPresets();
      setPresets(data ?? []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoadingPresets(false);
    }
  }

  // filters presets based on the search bar text
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
      <View style={styles.container}>
        <Text style={styles.headerText}>
          Presets for {'\n'}{readableDate || 'Selected Date'}
        </Text>

        <Text style={styles.sectionTitle}>Find Presets</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search presets..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />

        <Text style={styles.sectionTitle}>Available Presets</Text>

        <View style={styles.listContainer}>
          {loadingPresets ? (
            <Text style={styles.emptyText}>Loading presets...</Text>
          ) : filteredPresets.length === 0 ? (
            <Text style={styles.emptyText}>
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
                    style={[styles.listRow, isCreating && styles.listRowSelected]}
                    onPress={() => handleUsePreset(preset.id)}
                    disabled={isCreating}
                  >
                    <View>
                      <Text style={styles.listRowTitle}>{preset.name}</Text>
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
          style={styles.backButton}
          onPress={() => {
            router.back();
          }}
        >
          <Text style={styles.buttonText}>Back</Text>
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
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
    lineHeight: 36,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 12,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  listContainer: {
    maxHeight: 320,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 8,
    marginBottom: 12,
  },
  listRow: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listRowSelected: {
    opacity: 0.5,
  },
  listRowTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  listRowSubtitle: {
    color: '#93c5fd',
    fontSize: 13,
    marginTop: 2,
  },
  addText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#c62b2b',
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});