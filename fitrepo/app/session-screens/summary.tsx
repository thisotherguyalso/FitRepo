import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';


export default function Summary() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
        
        {/* Summary Screen */}
        <TouchableOpacity style={styles.sessionCard}>
          <Text style={styles.sessionLabel}>Summary</Text>

        {/* Return To Menu Button */}
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => {
            router.push({
              pathname: '/(tabs)/session', // https://docs.expo.dev/router/basics/navigation/
            })
          }}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
        </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
  },
  buttonStyle: {
    backgroundColor: 'rgb(30,133,247)',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  }
});

