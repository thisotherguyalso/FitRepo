import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { sharedStyles } from '@/constants/styles';
import { useWorkouts } from '@/hooks/use-workouts';


export default function SessionTab() {
  const { workouts } = useWorkouts();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
      <LinearGradient
        colors={['#020975fb', '#151718']}
        style={sharedStyles.background}/>

      {/* Exercise Session */}
      <View style={styles.sessionCard}>
        <Text style={styles.sessionLabel}>Session for Today</Text>
        
      
        {/* Start Reps Button */}
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => {
            router.push({
              pathname: '/session-screens/reps', // https://docs.expo.dev/router/basics/navigation/
            })
          }}>
          <Text style={styles.buttonText}>Start Reps</Text>
        </TouchableOpacity>
        
        {/* Start Timer Button */}
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => {
            router.push({
              pathname: '/session-screens/timer',
            })
          }}>
          <Text style={styles.buttonText}>Start Timer</Text>
        </TouchableOpacity>
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
  sessionLabel: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
  },
  buttonStyle: {
    backgroundColor: 'rgb(30,133,247)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  }
});
