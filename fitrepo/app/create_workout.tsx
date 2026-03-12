import { TouchableOpacity, Text, StyleSheet, TextInput} from 'react-native';
import { useState } from 'react';
import { Collapsible } from '@/components/ui/collapsible';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function ChoiceButtons() {
  const [selected, setSelected] = useState(null); // track which button is selected

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Create Workout</ThemedText>
        <TouchableOpacity
          style={[styles.button, selected === 'Rep based' && styles.selectedButton]}
          onPress={() => setSelected('Rep based')}
        >
          <Text style={styles.buttonText}>Rep based</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, selected === 'Time based' && styles.selectedButton]}
          onPress={() => setSelected('Time based')}
        >
          <Text style={styles.buttonText}>Time based</Text>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );

}

const styles = StyleSheet.create({
    container: { },
    title: {
      fontSize: 24,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#1a1a1a',
        padding: 20,
        borderRadius: 16,
        marginBottom: 30,
        alignItems: 'center',
    },
    selectedButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});
