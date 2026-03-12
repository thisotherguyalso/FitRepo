import { TouchableOpacity, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, router } from 'expo-router';
import { useWorkouts } from '@/hooks/use-workouts';

export default function ChoiceButtons() {
  // https://docs.expo.dev/router/reference/url-parameters/
  const { date } = useLocalSearchParams(); // get date passed through the router (read router docs for more info)
  const { planWorkout, loading } = useWorkouts();
  const [selected, setSelected] = useState<'Rep based' | 'Time based' | null>(null); // track which button is selected
  const [workoutName, setWorkoutName] = useState(''); // track workout name input
  // turn date into readable date e.g. March 13
  const readableDate = new Date(date as string).toLocaleDateString(
    undefined,
    { month: 'long', day: 'numeric', year: 'numeric' }
  );

  // goes to the exercise selection screen with the workout details
  function handleContinue() {
    try {
      if (!date) throw new Error('No workout date was provided.');
      if (!workoutName.trim()) throw new Error('Please enter a workout name.');
      if (!selected) throw new Error('Please choose Rep based or Time based.');

      router.push({
        pathname: '/exercise_selection',
        params: {
          date: date as string,
          name: workoutName.trim(),
          mode: selected,
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>

      <ThemedView style={styles.container}>

        {/* Screen title */}
        <ThemedText style={styles.headerText}>
          Create Workout for {'\n'}{readableDate}
        </ThemedText>

        {/* Workout name input */}
        <TextInput
          style={styles.input}
          placeholder="Enter workout name"
          placeholderTextColor="#888"
          value={workoutName}

          // Updates workoutName state whenever the user types
          onChangeText={setWorkoutName}
        />

        {/* Rep-based selection button */}
        <TouchableOpacity
          style={[styles.button, selected === 'Rep based' && styles.selectedButton]}
          onPress={() => setSelected('Rep based')}
        >
          <Text style={styles.buttonText}>Rep based</Text>
        </TouchableOpacity>

        {/* Time-based selection button */}
        <TouchableOpacity
          style={[styles.button, selected === 'Time based' && styles.selectedButton]}
          onPress={() => setSelected('Time based')}
        >
          <Text style={styles.buttonText}>Time based</Text>
        </TouchableOpacity>

        {/* Continue button */}
        <TouchableOpacity
          style={styles.createButton}

          // moves the user to the exercise selection screen
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Choose Exercises</Text>
        </TouchableOpacity>

        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            router.push('/(tabs)/workouts');
          }}
        >
          <Text style={styles.buttonText}>Back to Workouts</Text>
        </TouchableOpacity>

      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 4,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#020975',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
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
  backButton: {
    backgroundColor: '#c62b2b',
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
});