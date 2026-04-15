import { StyleSheet, TouchableOpacity, Text, View, Dimensions } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { CalendarList } from 'react-native-calendars';
import { useWorkouts } from '@/hooks/use-workouts';
import BottomSheet from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppColors, AppColors, AppRadius, AppSpacing, sharedStyles } from '@/constants/styles';
import { ButtonComponent } from '@/components/button-component';

export default function WorkoutsTab() {
  const { workouts, markedDates, loadWorkouts } = useWorkouts();
  const screenWidth = Dimensions.get('window').width;
  const bottomSheetRef = useRef<BottomSheet>(null);

  const colors = useAppColors();

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
          colors={[colors.primary, colors.background]}
          style={sharedStyles.background}
        />

        {/* Header */}
        <Text style={[styles.header, {color: '#fff'}]}>My Workouts</Text>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <CalendarList
            horizontal={true}
            pagingEnabled={true}
            calendarWidth={screenWidth}
            current={formatted}
            key={colors.mode}
            theme={{
              calendarBackground: 'transparent',
              dayTextColor: colors.text,
              monthTextColor: colors.text,
              textDisabledColor: colors.textMuted,
              textMonthFontSize: 20,
              todayBackgroundColor: colors.panelAlt,
              todayTextColor: colors.text,
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
        <Text style={[{color: colors.text}, styles.sectionTitle]}>{readableDate}</Text>

        {/* Show button OR workouts based on whether workouts exist */}
        {!hasWorkouts ? (
          <View style={[{backgroundColor: colors.surface}, styles.emptyState]}>
            <Text style={[{color: colors.text}, styles.emptyText]}>No workouts planned</Text>
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
              style={[{overflow: 'hidden', borderColor: workout.is_finished ? colors.accent1Border : colors.accent2Border}, styles.workoutCard]}
              onPress={() => {
                router.push({
                  pathname: '/view_workout',
                  params: { workout_id: workout.id },
                });
              }}
            >
              <LinearGradient
                colors={[workout.is_finished ? colors.accent1Alt : colors.accent2Alt, workout.is_finished ? colors.accent1 : colors.accent2]}
                style={[sharedStyles.background, {height: 85}]}
              />
              <View style={[styles.workoutCardContent]}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutStatus}>
                  {workout.is_finished ? 'Completed' : 'Planned'}
                </Text>
              </View>
              <View style={[styles.statusBadge, {backgroundColor: workout.is_finished ? colors.accent1Border : colors.accent2Border}]}>
                <Text style={styles.statusBadgeText}>
                  {workout.is_finished ? '✓' : '➤'}
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
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  calendarContainer: {
    marginHorizontal: -32,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    opacity: 0.5,
  },
  workoutCard: {
    padding: AppSpacing.lg,
    borderRadius: AppRadius.lg,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeText: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});