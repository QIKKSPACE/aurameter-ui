import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { ZIP_STORAGE_KEY } from "../ZipTypes";
import type { ZipGameState } from "../ZipTypes";

export const useGameStorage = (levelId: number) => {
  const loadProgress = useCallback(async (): Promise<ZipGameState | null> => {
    try {
      const savedProgress = await AsyncStorage.getItem(ZIP_STORAGE_KEY);
      if (savedProgress) {
        return JSON.parse(savedProgress) as ZipGameState;
      }
      return null;
    } catch (error) {
      console.error("Error loading progress:", error);
      return null;
    }
  }, []);

  const saveProgress = useCallback(async (state: ZipGameState): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        ZIP_STORAGE_KEY,
        JSON.stringify({
          currentLevel: state.currentLevel,
          completed: state.completed,
          elapsedTime: state.elapsedTime,
        })
      );
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }, []);

  const clearProgress = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(ZIP_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing progress:", error);
    }
  }, []);

  return {
    loadProgress,
    saveProgress,
    clearProgress,
  };
};
