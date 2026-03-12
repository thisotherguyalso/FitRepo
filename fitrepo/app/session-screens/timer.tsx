import { Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';


export default function Timer() {
  return (
    <TouchableOpacity>
    <Text>Timer</Text>

      <Link href="/session-screens/breathe" asChild>
        <TouchableOpacity>
          <Text>Skip Timer</Text>
        </TouchableOpacity>
      </Link>
    </TouchableOpacity>
  );
}