import { StyleSheet, TouchableOpacity, Text, Button, View } from 'react-native';
import { Link } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';


export default function SessionTab() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
      <View style={styles.sessionCard}>
        <Text style={styles.sessionLabel}>Exercise Plan</Text>
      
        <Link href="/session-screens/timer" asChild>
          <Button title="Start Timer"/>
        </Link> 
        <Link href="/session-screens/reps" asChild>
          <Button title="Start Reps"/>
        </Link>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  sessionCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  button: {
    backgroundColor: 'blue',
    alignItems: 'center',
  },
  sessionLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
});
