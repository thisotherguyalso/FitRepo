import { TouchableOpacity, Text } from 'react-native';
import { Link } from 'expo-router';


export default function Summary() {
  return (
    <TouchableOpacity>
      <Text>Summary</Text>

        <Link href="/(tabs)/session" asChild>
          <TouchableOpacity>
            <Text>Skip Timer</Text>
          </TouchableOpacity>
        </Link>
    </TouchableOpacity>
  );
}
