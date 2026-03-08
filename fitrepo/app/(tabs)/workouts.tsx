import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Calendar } from 'react-native-calendars';
import { useWorkouts } from '@/hooks/use-workouts';

export default function TabTwoScreen() {
  const {workouts, markedDates} = useWorkouts()
  
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
