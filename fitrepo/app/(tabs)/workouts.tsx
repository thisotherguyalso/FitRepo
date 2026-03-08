import { StyleSheet } from 'react-native';
import { useEffect, useState} from 'react';
import { Workout } from '@/types/database';
import { getWorkouts } from '@/lib/api/workouts';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Calendar } from 'react-native-calendars';

export default function TabTwoScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([])

  useEffect(() => {
    loadWorkouts()
  }, [])

  async function loadWorkouts() {
    const data = await getWorkouts()
    setWorkouts(data ?? [])
  }

  const markedDates = workouts.reduce((acc, workout) => {
    acc[workout.performed_at] = {
      marked: true,
      dotColor: workout.is_finished ? '#f5c842' : '#3b82f6'
    }
    return acc
  }, {} as Record<string, any>)

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
        <Calendar
          markedDates={markedDates}
          hideExtraDays={false}
          showSixWeeks={true}
          current={new Date().toISOString().split('T')[0]}
          theme={{
            backgroundColor: '#01252cfa',
            calendarBackground: '#01252cfa',
          }}
          onDayPress={(day) => {
            console.log('pressed:', day.dateString)
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
