import { TouchableOpacity, Text, StyleSheet, Button } from 'react-native';
import { router } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { sharedStyles } from '@/constants/styles';


export default function Summary() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
        
        <Text style={styles.sessionLabel}>Summary</Text>
        {/* Go Back Button */}
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => {
          router.push({
            pathname: '/(tabs)/session',
          })
          }}
          >
          <Text style={styles.buttonText}>Go Back</Text>
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
    marginBottom: 30,
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
    fontWeight: '600',
  },
  sessionLabel: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
  },
});

