import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { GAME_CONFIG } from "../GameConfig";

export const useGameTimer = (
  isCompleted: boolean,
  appStateRef: React.MutableRefObject<AppStateStatus>
) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [appState, setAppState] = useState<AppStateStatus>("active");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    console.log("🔴 [TIMER] resetTimer called");
    setElapsedSeconds(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Listen to app state changes
  useEffect(() => {
    console.log("🟡 [TIMER] Setting up app state listener");
    const handleAppStateChange = (state: AppStateStatus) => {
      console.log("🔵 [TIMER] App state changed:", state);
      appStateRef.current = state;
      setAppState(state);
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [appStateRef]);

  // Manage timer based on app state and completion status
  useEffect(() => {
    console.log("🟢 [TIMER] Timer effect running: isCompleted=", isCompleted, "appState=", appState);
    
    if (isCompleted || appState !== "active") {
      console.log("🔴 [TIMER] Stopping timer: isCompleted=", isCompleted, "appState=", appState);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Game is active and not completed - start timer
    if (!timerRef.current) {
      console.log("🟢 [TIMER] Starting timer interval");
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next % 5 === 0) console.log("⏱️ [TIMER] Elapsed:", next, "seconds");
          return next;
        });
      }, GAME_CONFIG.TIMER_INTERVAL_MS);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isCompleted, appState]);

  return {
    elapsedSeconds,
    resetTimer,
    timerRef,
  };
};
