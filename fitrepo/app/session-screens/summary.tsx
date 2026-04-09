import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { sharedStyles } from '@/constants/styles';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Summary() {
  const { workout_id, total } = useLocalSearchParams<{ workout_id: string; total: string }>();

  useEffect(() => {
    if (workout_id) {
      void supabase
        .from('workouts')
        .update({ is_finished: true })
        .eq('id', workout_id);
    }
  }, [workout_id]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
      <LinearGradient colors={['#020975fb', '#151718']} style={sharedStyles.background} />

      <Text style={styles.sessionLabel}>🎉 Workout Complete!</Text>
      {total ? (
        <Text style={styles.subLabel}>{total} exercise{Number(total) !== 1 ? 's' : ''} done</Text>
      ) : null}

      <TouchableOpacity
        style={styles.buttonStyle}
        onPress={() => router.replace('/(tabs)/session')}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  sessionLabel: { fontSize: 32, fontWeight: '700', color: '#ffffff', marginBottom: 8, textAlign: 'center', marginTop: 40 },
  subLabel: { fontSize: 18, color: '#9ca3af', textAlign: 'center', marginBottom: 40 },
  buttonStyle: {
    backgroundColor: 'rgb(30,133,247)',
    paddingVertical: 24,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#ffffff', fontSize: 24, fontWeight: '600' },
});