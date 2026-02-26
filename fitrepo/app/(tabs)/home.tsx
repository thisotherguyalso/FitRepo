import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00adccfa', dark: '#000875' }}
      headerImage={<></>}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{fontFamily: Fonts.rounded,}}>
          Workouts For Today
        </ThemedText>
      </ThemedView>
      <ThemedText>Workouts.</ThemedText>
      <Collapsible title="Exercise 1">
        <ThemedText>
          Jump
        </ThemedText>
      </Collapsible>
      <Collapsible title="Exercise 2">
        <ThemedText>
          Push ups
        </ThemedText>
      </Collapsible>
      <Collapsible title="Exercise 3">
        <ThemedText>
          Curling
        </ThemedText>
      </Collapsible>
      <Collapsible title="Exercise 4">
        <ThemedText>
          Squats
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
