import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { Calendar, Agenda } from 'react-native-calendars';

export default function TabTwoScreen() {
  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
        <Calendar
          theme={{
            backgroundColor: '#01252cfa',
            calendarBackground: '#01252cfa',
          }}
        />
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 5,
  },
});
