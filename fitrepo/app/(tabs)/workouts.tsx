import { StyleSheet, TouchableOpacity, Text, View, Dimensions } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { CalendarList } from 'react-native-calendars';
import { useWorkouts } from '@/hooks/use-workouts';
import { useThemeColor } from '@/hooks/use-theme-color';
import BottomSheet from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { sharedStyles } from '@/constants/styles';
import { ButtonComponent } from '@/components/button-component';

export default function WorkoutsTab() {
  const { workouts, markedDates, loadWorkouts  } = useWorkouts();
  const screenWidth = Dimensions.get('window').width;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const calendarBG = useThemeColor({}, 'background');

  useEffect(() => {
    const interval = setInterval(() => {
      void loadWorkouts();
    }, 1000); // refresh every second

    return () => clearInterval(interval);
  }, [loadWorkouts]);

  const today = new Date(); // get local time
  // format it to react format e.g. 1999-01-25
  const formatted =
    today.getFullYear() +
    '-' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(today.getDate()).padStart(2, '0');
  const [selected, setSelected] = useState(formatted);
  const selectedDateWorkouts = workouts.filter(
    (workout) => workout.performed_at === selected
  );
  const readableDate = new Date(selected as string).toLocaleDateString(
    undefined,
    { month: 'long', day: 'numeric', year: 'numeric' }
  );

  return (
    <View style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#00adccfa', dark: 'rgba(2, 9, 117, 0.98)' }}>
        <LinearGradient
          colors={['#020975fb', '#151718']}
          style={sharedStyles.background}/>

        {/* Workouts Displayed Through Calendar */}
        <Text style={styles.headerText}>My Workouts</Text>
 
        <View style={styles.divider} />
 
        <View style={{ marginHorizontal: -32 }}>
          <CalendarList
            horizontal={true}
            pagingEnabled={true}
            calendarWidth={screenWidth}
            current={formatted}
            theme={{
              calendarBackground: calendarBG,
              dayTextColor: '#FFFFFF',
              monthTextColor: '#FFFFFF',
              textDisabledColor: '#504b4b',
              textMonthFontSize: 20,
              todayBackgroundColor: '#242431',
            }}
            onDayPress={(day) => {
              setSelected(day.dateString);
              bottomSheetRef.current?.expand();
            }}
            markedDates={{
              [selected]: { selected: true, disableTouchEvent: true, selectedColor: 'rgb(30,133,247)' },
              ...markedDates,
            }}/>
        </View>
 
        {/* Create Workout Button */}
        <ButtonComponent onPress = {() => {
            router.push({
              pathname: '/create_workout',
              params: {date: selected}, // https://docs.expo.dev/router/basics/navigation/
            })
          }}
          text="Plan a Workout!"/>

        {/* Listed Workouts For A Date */}
        <Text style={styles.sectionTitle}>Workouts for {readableDate}</Text>

        {selectedDateWorkouts.length === 0 ? (
          <Text style={styles.emptyText}>No workouts planned for this date.</Text>
        ) : (
          selectedDateWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={[styles.workoutCard, workout.is_finished && styles.finishedWorkoutCard]}
              onPress={() => {
                router.push({
                  pathname: '/view_workout',
                  params: { workout_id: workout.id },
                });
              }}>
              <Text style={styles.workoutCardTitle}>{workout.name}</Text>
              <Text style={styles.workoutCardSubtitle}>
                {workout.is_finished ? 'Finished' : 'Planned'}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ParallaxScrollView>
    </View>
  );
}
 
const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: '#6e6e6e',
    marginVertical: 8,
  },
  createButton: {
    backgroundColor: 'rgb(30,133,247)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  headerText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
    alignSelf: 'center',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  workoutCard: {
    backgroundColor: 'rgb(0,65,90)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  finishedWorkoutCard: {
    borderColor: 'rgb(85,161,148)',
    backgroundColor: 'rgb(59,112,103)',
    borderWidth: 2,
  },
  workoutCardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  workoutCardSubtitle: {
    color: '#93c5fd',
    fontSize: 14,
  },
});