import { LayoutChangeEvent, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { CalendarList } from 'react-native-calendars';
import { useWorkouts } from '@/hooks/use-workouts';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors, AppColors, AppRadius, AppSpacing, sharedStyles } from '@/constants/styles';
import { ButtonComponent } from '@/components/button-component';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function WorkoutsTab() {
  const { workouts, workoutSummaries, markedDates, loadWorkouts } = useWorkouts();
  const [calendarWidth, setCalendarWidth] = useState(0);

  const colors = useAppColors();

  useFocusEffect(
    useCallback(() => {
      void loadWorkouts();
    }, [loadWorkouts])
  );

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
  const monthLabel = new Date(selected as string).toLocaleDateString(
    undefined,
    { month: 'long', year: 'numeric' }
  );

  const hasWorkouts = selectedDateWorkouts.length > 0;

  function formatVolume(volume: number) {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(volume >= 10000 ? 0 : 1)}k kg`
    }

    return `${volume} kg`
  }

  function handleCalendarLayout(event: LayoutChangeEvent) {
    const nextWidth = Math.round(event.nativeEvent.layout.width)

    // calendar paging gets weird fast if this width is even a little off, so always use the real measured width
    if (nextWidth > 0 && nextWidth !== calendarWidth) {
      setCalendarWidth(nextWidth)
    }
  }

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
        <View
          style={[
            sharedStyles.card,
            styles.calendarShell,
            { backgroundColor: colors.tabBar, borderColor: colors.borderStrong },
          ]}
        >
          <View style={styles.calendarTopRow}>
            <View>
              <Text style={[styles.calendarEyebrow, { color: colors.textAccent }]}>TRAINING CALENDAR</Text>
              <Text style={[styles.calendarMonth, { color: colors.text }]}>{monthLabel}</Text>
            </View>
            <View style={[styles.calendarPill, { backgroundColor: colors.panelStrong }]}>
              <Ionicons name="swap-horizontal" size={14} color={colors.textAccent} />
              <Text style={[styles.calendarPillText, { color: colors.text }]}>Swipe months</Text>
            </View>
          </View>

          <View style={styles.calendarContainer} onLayout={handleCalendarLayout}>
            {calendarWidth > 0 ? (
              <CalendarList
                horizontal={true}
                pagingEnabled={true}
                calendarWidth={calendarWidth}
                current={formatted}
                key={`${colors.mode}-${calendarWidth}`}
                pastScrollRange={12}
                futureScrollRange={12}
                hideExtraDays={false}
                firstDay={1}
                theme={{
                  calendarBackground: 'transparent',
                  dayTextColor: colors.text,
                  monthTextColor: colors.text,
                  textDisabledColor: colors.textMuted,
                  textMonthFontSize: 20,
                  textMonthFontWeight: '800',
                  textDayFontWeight: '700',
                  textDayHeaderFontWeight: '700',
                  todayBackgroundColor: colors.panelAlt,
                  todayTextColor: colors.text,
                  textSectionTitleColor: colors.textMuted,
                  arrowColor: colors.textAccent,
                }}
                style={styles.calendar}
                onDayPress={(day) => {
                  setSelected(day.dateString);
                }}
                markedDates={{
                  ...markedDates,
                  [selected]: {
                    ...(markedDates[selected] ?? {}),
                    selected: true,
                    disableTouchEvent: true,
                    selectedColor: colors.primary,
                    selectedTextColor: '#fff',
                  },
                }}
              />
            ) : null}
          </View>
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
            <Animated.View
              key={workout.id}
              entering={FadeInDown.duration(240).springify().damping(18)}
            >
              <TouchableOpacity
                style={[
                  styles.workoutCard,
                  { borderColor: workout.is_finished ? colors.accent1Border : colors.accent2Border },
                ]}
                onPress={() => {
                  router.push({
                    pathname: '/view_workout',
                    params: { workout_id: workout.id },
                  });
                }}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={[
                    workout.is_finished ? colors.accent1Alt : colors.accent2Alt,
                    workout.is_finished ? colors.accent1 : colors.accent2,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.workoutCardContent}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutStatus}>
                    {workout.is_finished ? 'Completed' : 'Planned'}
                  </Text>
                  <View style={styles.metricsRow}>
                    <View style={[styles.metricChip, { backgroundColor: colors.overlay }]}>
                      <Ionicons name="layers-outline" size={13} color={colors.text} />
                      <Text style={styles.metricText}>
                        {workoutSummaries[workout.id]?.totalSets ?? 0} sets
                      </Text>
                    </View>
                    <View style={[styles.metricChip, { backgroundColor: colors.overlay }]}>
                      <Ionicons name="barbell-outline" size={13} color={colors.text} />
                      <Text style={styles.metricText}>
                        {formatVolume(workoutSummaries[workout.id]?.totalVolume ?? 0)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.statusBadge, {backgroundColor: workout.is_finished ? colors.accent1Border : colors.accent2Border}]}>
                  <Text style={styles.statusBadgeText}>
                    {workout.is_finished ? '✓' : '➤'}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
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
  calendarShell: {
    padding: AppSpacing.lg,
    marginBottom: 24,
    gap: 14,
  },
  calendarTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  calendarEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.1,
    marginBottom: 6,
  },
  calendarMonth: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  calendarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: AppRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  calendarPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  calendarContainer: {
    alignSelf: 'center',
    width: '100%',
  },
  calendar: {
    alignSelf: 'center',
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
    overflow: 'hidden',
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
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: AppRadius.pill,
  },
  metricText: {
    color: AppColors.text,
    fontSize: 12,
    fontWeight: '700',
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
