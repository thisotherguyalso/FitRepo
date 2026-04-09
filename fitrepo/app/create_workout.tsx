import { TouchableOpacity, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ButtonComponent } from '@/components/button-component'
import { useLocalSearchParams, router } from 'expo-router';
import { AppColors, sharedStyles } from '@/constants/styles';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@react-navigation/elements';

export default function ChoiceButtons() {
  // https://docs.expo.dev/router/reference/url-parameters/
  const { date } = useLocalSearchParams(); // get date passed through the router (read router docs for more info)
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

  // opens the global preset list and passes the chosen date
  function handleLoadPreset() {
    try {
      if (!date) throw new Error('No workout date was provided.');

      router.push({
        pathname: '/preset_list',
        params: {
          date: date as string,
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
      <LinearGradient
        colors={['#020975fb', '#151718']}
        style={sharedStyles.background}/>
      <ThemedView style={styles.container}>

      {/* Screen title */}
      <ThemedText style={styles.headerText}>
        Create Workout for {'\n'}{readableDate}
      </ThemedText>

      {/* Workout name input */}
      <TextInput
        style={[sharedStyles.input, styles.input]}
        placeholder="Enter workout name"
        placeholderTextColor="#888"
        value={workoutName}

        // Updates workoutName state whenever the user types
        onChangeText={setWorkoutName}/>

      {/* Rep-based selection button */}
      <ButtonComponent
        text="Rep based"
        selected={selected === 'Rep based'}
        onPress={() => setSelected('Rep based')}
      />

      {/* Time-based selection button */}
      <ButtonComponent
        text="Time based"
        selected={selected === 'Time based'}
        onPress={() => setSelected('Time based')
        }
      />

      {/* Continue button */}
      <ButtonComponent
        text = "Choose Exercises"
        onPress = {handleContinue}
      />

      {/* Load Preset button */}
      <ButtonComponent
        text = "Load from Preset"
        onPress = {handleLoadPreset}
      />

      {/* Back button */}
      <ButtonComponent
        text = "Back to Workouts"
        onPress = {() => {router.push('/(tabs)/workouts');}}
      />

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
    marginBottom: 24,
  },
  button: {
    marginBottom: 20,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: AppColors.primaryDark,
    marginBottom: 20,
  },
  presetButton: {
    backgroundColor: AppColors.secondary,
    marginBottom: 20,
  },
  selectedButton: {
    backgroundColor: 'rgb(0,184,255)',
  },
  selectedButtonText: {
    color: 'rgb(0,31,43)',
  },
  buttonText: {
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
    backgroundColor: AppColors.danger,
    marginBottom: 24,
  },
});
