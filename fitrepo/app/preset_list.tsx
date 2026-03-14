import { TouchableOpacity, Text, StyleSheet, TextInput, Alert, View, ScrollView } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useLocalSearchParams, router } from 'expo-router';
import { getWorkoutPresets } from '@/lib/api/workoutPresets';
import { createWorkoutFromPreset } from '@/lib/api/createWorkoutFromPreset';

// TypeScript type describing one preset object returned from the database/API.
// created_at is optional because some presets may not have that field.
type WorkoutPreset = {
  id: string;
  name: string;
  created_at?: string;
};

export default function PresetList() {
  // Reads route parameters from expo-router.
  // Example: if this page was opened with something like
  // router.push({ pathname: '/preset_list', params: { date: '2026-03-13' } })
  // then `date` will contain that passed value.
  //
  // The generic <{ date?: string }> tells TypeScript what params we expect.
  const { date } = useLocalSearchParams<{
    date?: string;
  }>();

  // Stores the presets fetched from the API/database.
  const [presets, setPresets] = useState<WorkoutPreset[]>([]);

  // Tracks whether presets are currently being loaded.
  // Used to show "Loading presets..." while waiting for the API call to finish.
  const [loadingPresets, setLoadingPresets] = useState(false);

  // Tracks which preset is currently being turned into a workout.
  // We store the preset's id instead of just true/false so only that specific row
  // can show "Creating..." and be visually disabled.
  const [creatingPresetWorkout, setCreatingPresetWorkout] = useState<string | null>(null);

  // Stores the user's search text from the search input.
  const [search, setSearch] = useState('');

  // Converts the raw date param into a more readable format for display.
  //
  // Example:
  // "2026-03-13" -> "March 13, 2026"
  //
  // If date is missing/undefined, fallback to an empty string.
  const readableDate = date
    ? new Date(date).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  useEffect(() => {
    // load presets when the screen first mounts
    //
    // `void` here is a TypeScript/JS convention used when calling an async function
    // inside useEffect without awaiting it.
    //
    // Why?
    // - useEffect itself should not directly be async
    // - loadPresets() returns a Promise
    // - `void` makes it explicit that we are intentionally ignoring that returned Promise
    //
    // So this basically means:
    // "run loadPresets(), and I know it returns a Promise, but that's fine"
    void loadPresets();
  }, []);

  async function loadPresets() {
    try {
      // start loading state before the API call
      setLoadingPresets(true);

      // fetch all saved workout presets
      const data = await getWorkoutPresets();

      // `data ?? []` means:
      // - if data is null or undefined, use []
      // - otherwise use data
      //
      // This prevents crashes if the API unexpectedly returns null/undefined.
      setPresets(data ?? []);
    } catch (error: any) {
      // show popup if fetching fails
      Alert.alert('Error', error.message);
    } finally {
      // finally runs whether try succeeded or catch ran
      // so loading always gets reset
      setLoadingPresets(false);
    }
  }

  // Filters presets based on the user's search input.
  //
  // useMemo memoizes the computed result so React does not redo the filtering
  // on every single render unless `search` or `presets` changes.
  //
  // This is especially useful if the preset list gets large.
  const filteredPresets = useMemo(() => {
    // trim removes leading/trailing spaces
    // toLowerCase makes the search case-insensitive
    const trimmed = search.trim().toLowerCase();

    // if search box is empty after trimming, show all presets
    if (!trimmed) return presets;

    // otherwise only keep presets whose names contain the search text
    return presets.filter((preset) =>
      preset.name.toLowerCase().includes(trimmed)
    );
  }, [search, presets]);

  async function handleUsePreset(preset_id: string) {
    try {
      // guard clause:
      // if the date param wasn't passed into this page,
      // we cannot create a workout for a specific day
      if (!date) throw new Error('No workout date was provided.');

      // mark this specific preset as currently being processed
      // so its button can show "Creating..."
      setCreatingPresetWorkout(preset_id);

      // call the API that creates a brand new workout using this preset
      // and assigns it to the chosen date
      const workout = await createWorkoutFromPreset(preset_id, date);

      Alert.alert('Success', 'Workout created from preset.');

      // replace the current screen with the workout view screen
      //
      // router.replace(...) is different from router.push(...):
      // - push adds a new page on top of the stack
      // - replace swaps the current page with the new one
      //
      // This is often nicer here because once the preset has been used,
      // the user is taken directly to the created workout instead of stacking more pages.
      router.replace({
        pathname: '/view_workout',
        params: {
          workout_id: workout.id,
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      // clear the "creating" state no matter what happened
      setCreatingPresetWorkout(null);
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}
    >
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
          // onChangeText={setSearch} works because React Native passes the new text string
          // directly into setSearch.
        />

        <Text style={styles.sectionTitle}>Available Presets</Text>

        <View style={styles.listContainer}>
          {loadingPresets ? (
            // first condition:
            // show loading state while API call is in progress
            <Text style={styles.emptyText}>Loading presets...</Text>
          ) : filteredPresets.length === 0 ? (
            // second condition:
            // if not loading and there are no results, show a message
            <Text style={styles.emptyText}>
              {search.trim()
                ? 'No matching presets found.'
                : 'No presets available yet.'}
            </Text>
          ) : (
            // otherwise render the actual list of presets
            <ScrollView
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              // nestedScrollEnabled is useful when a ScrollView is placed inside another
              // scrollable parent. Since ParallaxScrollView is also scrollable, this helps
              // avoid scroll conflicts on some devices/platforms.
            >
              {filteredPresets.map((preset) => {
                // true only for the preset currently being created
                const isCreating = creatingPresetWorkout === preset.id;

                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={[styles.listRow, isCreating && styles.listRowSelected]}
                    onPress={() => handleUsePreset(preset.id)}
                    disabled={isCreating}
                    // disabled prevents repeated taps while that preset is being processed
                  >
                    <View>
                      <Text style={styles.listRowTitle}>{preset.name}</Text>

                      {preset.created_at ? (
                        // only show created_at if it exists
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
            // go back to previous page in navigation stack
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
    // flex: 1 tells this container to take up available space
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