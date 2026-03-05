import React, { useEffect } from "react";
import { View, Button } from "react-native";
import { useDerivedValue } from "react-native-reanimated";
import { useStoryPlayer } from "../storyviewer/useStoryPlayer";

export default function StoryClockTest() {
  const { progress, pause, resume, reset } = useStoryPlayer({
    durationMs: 5000,
    canPlay: true,
    onEnd: () => console.log("🟢 STORY ENDED"),
  });

  // 🔍 log progress
  useDerivedValue(() => {
    console.log("progress:", progress.value.toFixed(3));
  });

  return (
    <View style={{ padding: 40 }}>
      <Button title="Pause" onPress={pause} />
      <Button title="Resume" onPress={resume} />
      <Button title="Reset" onPress={reset} />
    </View>
  );
}
