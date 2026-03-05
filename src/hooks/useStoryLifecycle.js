import { useEffect } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export default function useStoryLifecycle({ setIsPlaying }) {
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") setIsPlaying(false);
    });
    return () => sub.remove();
  }, []);

  useFocusEffect(() => {
    return () => setIsPlaying(false);
  });
}
