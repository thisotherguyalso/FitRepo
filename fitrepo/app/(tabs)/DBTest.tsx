import { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, Text } from 'react-native'
import { supabase } from '../../lib/supabase'

console.log('supabase_client:', supabase)

export default function App() {
  type Workout = {
    id: number
    name: string
    created_at: string
    performed_at: string
    is_finished: boolean
    user_id: string
  }

  const [workouts, setWorkouts] = useState<Workout[]>([])

  useEffect(() => {
    getWorkouts()
  }, [])

  async function getWorkouts() {
    try {
      const response = await supabase.from('workouts').select('*')
      if (response.data) setWorkouts(response.data)
    } catch(e) {
      console.log('error:', e)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={{ color: 'black', fontSize: 18, marginBottom: 10 }}>
        Workouts count: {workouts.length}
      </Text>
      
      {workouts.length === 0 ? (
        <Text style={{ color: 'red' }}>No workouts found</Text>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Text style={styles.item}>{item.name}</Text>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
})