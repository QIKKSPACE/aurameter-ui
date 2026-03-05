

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
import { useMemo } from "react";
import { useStorySession } from "../storyviewer/useStorySession";

export default function TestStorySession() {
  const users = [
    { user_id: 1, stories: [{ id: "A" }, { id: "B" }] },
    { user_id: 2, stories: [] },
    { user_id: 3, stories: [{ id: "C" }] },
  ];

  const {
    activeUser,
    activeStory,
    nextStory,
  } = useStorySession({
    users,
    onComplete: () => console.log("SESSION DONE"),
  });

  return (
    <>
      <Text>User: {activeUser?.user_id}</Text>
      <Text>Story: {activeStory?.id}</Text>
      <Button title="Next" onPress={nextStory} />
    </>
  );
}
