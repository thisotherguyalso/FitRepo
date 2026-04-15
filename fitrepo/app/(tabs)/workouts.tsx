import { StyleSheet, TouchableOpacity, Text, View, Dimensions } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { CalendarList } from 'react-native-calendars';
import { useWorkouts } from '@/hooks/use-workouts';
import BottomSheet from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, AppRadius, AppSpacing, sharedStyles } from '@/constants/styles';
import { ButtonComponent } from '@/components/button-component';

export default function WorkoutsTab() {
  const { workouts, markedDates, loadWorkouts } = useWorkouts();
  const screenWidth = Dimensions.get('window').width;
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      void loadWorkouts();
    }, 1000);

    return () => clearInterval(interval);
  }, [loadWorkouts]);

  const today = new Date();
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

  const hasWorkouts = selectedDateWorkouts.length > 0;

  return (
    <View style={styles.container}>
      <ParallaxScrollView>
        <LinearGradient
          colors={['#020975', '#0d0d12']}
          style={sharedStyles.background}
        />

        {/* Header */}
        <Text style={styles.header}>My Workouts</Text>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <CalendarList
            horizontal={true}
            pagingEnabled={true}
            calendarWidth={screenWidth}
            current={formatted}
            theme={{
              calendarBackground: 'transparent',
              dayTextColor: '#FFFFFF',
              monthTextColor: '#FFFFFF',
              textDisabledColor: '#444',
              textMonthFontSize: 20,
              todayBackgroundColor: '#202025',
              todayTextColor: '#fff',
            }}
            onDayPress={(day) => {
              setSelected(day.dateString);
              bottomSheetRef.current?.expand();
            }}
            markedDates={{
              [selected]: { selected: true, disableTouchEvent: true, selectedColor: '#3b82f6' },
              ...markedDates,
            }}
          />
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>{readableDate}</Text>

        {/* Show button OR workouts based on whether workouts exist */}
        {!hasWorkouts ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No workouts planned</Text>
            <ButtonComponent
              onPress={() => {
                router.push({
                  pathname: '/create_workout',
                  params: { date: selected },
                });
              }}
              text="Plan a Workout"
            />
          </View>
        ) : (
          selectedDateWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={[styles.workoutCard, workout.is_finished && styles.finishedCard]}
              onPress={() => {
                router.push({
                  pathname: '/view_workout',
                  params: { workout_id: workout.id },
                });
              }}
            >
              <View style={styles.workoutCardContent}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutStatus}>
                  {workout.is_finished ? 'Completed' : 'Planned'}
                </Text>
              </View>
              <View style={[styles.statusBadge, workout.is_finished && styles.statusBadgeFinished]}>
                <Text style={styles.statusBadgeText}>
                  {workout.is_finished ? '✓' : '→'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ParallaxScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d12',
  },
  header: {
    color: AppColors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  calendarContainer: {
    marginHorizontal: -32,
    marginBottom: 24,
  },
  sectionTitle: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#202025',
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    color: AppColors.text,
    fontSize: 15,
    opacity: 0.5,
  },
  workoutCard: {
    backgroundColor: '#202025',
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  finishedCard: {
    backgroundColor: '#1a2e1a',
    borderWidth: 1,
    borderColor: '#2d4a2d',
  },
  workoutCardContent: {
    flex: 1,
  },
  workoutName: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutStatus: {
    color: AppColors.text,
    fontSize: 14,
    opacity: 0.5,
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeFinished: {
    backgroundColor: '#2d4a2d',
  },
  statusBadgeText: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});