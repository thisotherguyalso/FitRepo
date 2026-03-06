import { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, Text } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function App() {
  const [instruments, setInstruments] = useState([])

  useEffect(() => {
    getInstruments()
  }, [])

  async function getInstruments() {
    const { data } = await supabase.from('workouts').select()
    setInstruments(data)
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={instruments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.item}>{item.name}</Text>
        )}
      />
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