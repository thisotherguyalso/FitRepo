import { TouchableOpacity, Text } from 'react-native';
import { Link } from 'expo-router';


export default function Reps() {
  return (
    <TouchableOpacity>
      <Text>Reps</Text>

        <Link href="/session-screens/breathe" asChild>
          <TouchableOpacity>
            <Text>Skip Reps</Text>
          </TouchableOpacity>
        </Link>
    </TouchableOpacity>
  );
}
