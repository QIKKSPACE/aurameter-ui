import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import type { Point, ZipGameState } from "../ZipTypes";

export const useGameState = () => {
  const [gameState, setGameState] = useState<ZipGameState | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showLastNodeWarning, setShowLastNodeWarning] = useState(false);

  const gameStateRef = useRef<ZipGameState | null>(null);
  const levelSolutionRef = useRef<Point[] | null>(null);
  const hintProgressRef = useRef<number>(0);
  const lastNodeWarningShownRef = useRef<boolean>(false);
  const appStateRef = useRef<AppStateStatus>("active");
  const backgroundTimeRef = useRef<number>(0);
  const lastCellKeyRef = useRef<string | null>(null);

  useEffect(() => {
    gameStateRef.current = gameState;
    if (gameState) {
      
      // 🔴 CRITICAL: Always sync isCompleted directly from gameState
      // Use functional update to avoid dependency on isCompleted
      setIsCompleted((prev) => {
        if (gameState.completed && !prev) {
          return true;
        } else if (!gameState.completed && prev) {
          return false;
        }
        return prev;
      });
    }
  }, [gameState]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      appStateRef.current = state;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  return {
    gameState,
    setGameState,
    isCompleted,
    setIsCompleted,
    hintsUsed,
    setHintsUsed,
    showLastNodeWarning,
    setShowLastNodeWarning,
    gameStateRef,
    levelSolutionRef,
    hintProgressRef,
    lastNodeWarningShownRef,
    appStateRef,
    backgroundTimeRef,
    lastCellKeyRef,
  };
};
