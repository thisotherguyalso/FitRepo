import { StyleSheet, TouchableOpacity, Text, View, Dimensions, Button} from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { CalendarList } from 'react-native-calendars';
import { useWorkouts } from '@/hooks/use-workouts';
import { useThemeColor } from '@/hooks/use-theme-color';
import BottomSheet from '@gorhom/bottom-sheet'
import { Link } from 'expo-router';
import BottomSheetView from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react'

export default function TabTwoScreen() {
  const {workouts, markedDates} = useWorkouts()
  const screenWidth = Dimensions.get('window').width
  const bottomSheetRef = useRef<BottomSheet>(null)
  const calendarBG = useThemeColor({}, 'background')
  const [selected, setSelected] = useState('');
  
  return (
    <>
    <View style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#00adccfa', dark: '#020975fb' }}>
        
        {/*Header text*/}
        <Text style={styles.headerText}>
          My Workouts
        </Text>

        <View style={{
          height: 1,
          backgroundColor: '#6e6e6e',
          marginVertical: 8,
        }} />
        
        {/*Calendar object*/}

        <View style={{ marginHorizontal: -32 }}>
          <CalendarList
            horizontal={true}
            pagingEnabled={true}
            calendarWidth={screenWidth}
            current={new Date().toISOString().split('T')[0]}
            theme={{
              calendarBackground: calendarBG,
              dayTextColor: '#FFFFFF',
              monthTextColor: '#FFFFFF',
              textDisabledColor: '#504b4b',
              textMonthFontSize: 20,
              todayBackgroundColor: '#242431',
            }}
            onDayPress={(day) => {
              console.log('selected day:', day.dateString)
              setSelected(day.dateString);
              bottomSheetRef.current?.expand()
              console.log('bottomSheetRef:', bottomSheetRef.current)
            }}
            markedDates={{
              [selected]: {selected: true, disableTouchEvent: true, selectedColor: 'blue'}, workouts: markedDates
            }}
          />
        </View>

        {/*Button for creating workouts*/}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => console.log('pressed!')
        }>
          <Text style={styles.createButtonText}>Plan a Workout!</Text>
        </TouchableOpacity>
      </ParallaxScrollView>

      <TouchableOpacity style={styles}>
              <Link href="create_workout" asChild>
                <Button title="Plan a Workout"/>
              </Link>
            </TouchableOpacity>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  createButton: {
    backgroundColor: '#020975',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 100,       // fully rounded
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
    alignSelf: 'center'
  }
});
