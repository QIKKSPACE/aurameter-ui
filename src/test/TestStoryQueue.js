import { useStoryQueue } from "../storyviewer/useStoryQueue";

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

export default function TestStoryQueue() {
  const stories = useMemo(
    () => [
      { id: "A" },
      { id: "B" },
      { id: "C" },
    ],
    []
  );

  const { activeStory, next, prev } = useStoryQueue({
    stories,
    onComplete: () => console.log("DONE STORIES"),
  });

  return (
    <View>
      <Text>Active story: {activeStory?.id}</Text>

      <Button title="Next Story" onPress={next} />
      <Button title="Prev Story" onPress={prev} />
    </View>
  );
}
