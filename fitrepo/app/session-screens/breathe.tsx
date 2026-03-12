import { TouchableOpacity, Text } from 'react-native';
import { Link } from 'expo-router';


export default function Break() {
  return (
    <TouchableOpacity>
      <Text>Break</Text>

        <Link href="/session-screens/summary" asChild>
          <TouchableOpacity>
            <Text>Skip Timer</Text>
          </TouchableOpacity>
        </Link>
    </TouchableOpacity>
  );
}
