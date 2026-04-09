import { TouchableOpacity, Text, StyleSheet, Button } from 'react-native';
import { Link } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { sharedStyles } from '@/constants/styles';


export default function Summary() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
        <TouchableOpacity style={[sharedStyles.card, styles.sessionCard]}>
          <Text style={[sharedStyles.mutedText, styles.sessionLabel]}>Summary</Text>
          <Link href="/(tabs)/session" asChild>
          <Button title="Go Back"/>
          </Link>
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
  button: {
    backgroundColor: 'blue',
    alignItems: 'center',
  },
  sessionLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
});

