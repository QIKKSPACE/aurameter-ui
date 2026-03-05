import { useUserQueue } from "../storyviewer/useUserQueue";
import {
View,
Text,
FlatList,
StyleSheet,
Image,
TextInput,
TouchableOpacity,
ActivityIndicator,
Button,
} from "react-native";
export default function TestUserQueue() {
  const users = [
    { user_id: 1, stories: [{ id: 1 }] },
    { user_id: 2, stories: [] }, // should be skipped
    { user_id: 3, stories: [{ id: 2 }, { id: 3 }] },
  ];

  const { activeUser, next, prev } = useUserQueue({
    users,
    startIndex: 0,
    onComplete: () => console.log("DONE USERS"),
  });

  return (
    <View>
      <Text>Active user: {activeUser?.user_id}</Text>

      <Button title="Next User" onPress={next} />
      <Button title="Prev User" onPress={prev} />
    </View>
  );
}
