import { useEffect } from "react";
import { useSelector } from "react-redux";
import { hasPollableStories } from "./storyPollingRules";
import {
  startStoryPolling,
  stopStoryPolling,
} from "./storyPollingService";
 
export function useStoryPolling() {
  const { selfStories, rehydrated } = useSelector(state => ({
    selfStories: state.story?.stories?.[0]?.stories || [],
    rehydrated: state._persist?.rehydrated, // 🔑 redux-persist flag
  }));

  useEffect(() => {
    if (!rehydrated) return; // ⛔ wait

    console.log(
      "🟡 selfStories length:",
      selfStories.length,
      selfStories.map(s => s.status)
    );

    if (hasPollableStories(selfStories)) {
      console.log("🟢 Hook says: START polling");
      startStoryPolling();
    } else {
      console.log("🔴 Hook says: STOP polling");
      stopStoryPolling();
    }
  }, [selfStories, rehydrated]);
}