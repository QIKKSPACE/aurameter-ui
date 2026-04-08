import { useCallback, useEffect, useRef, useState } from "react";
import { getDifficultyForLevel } from "../DifficultyConfig";
import { getLevelById } from "../LevelConfig";
import { getLevelSolution } from "../ZipEngine";
import type { Point, ZipGameState } from "../ZipTypes";

const createInitialGameState = (level: any): ZipGameState => {
  return {
    currentLevel: level.id,
    gridSize: level.gridSize,
    nodes: level.nodes,
    obstacles: level.obstacles,
    path: [],
    currentNodeIndex: 0,
    selectedStartNode: null,
    gameOver: false,
    completed: false,
    timerStartTime: Date.now(),
    elapsedTime: 0,
    hintsRemaining:
      getDifficultyForLevel(level.id) === "EASY"
        ? 3
        : getDifficultyForLevel(level.id) === "MEDIUM"
          ? 2
          : 1,
    undoStack: [],
  };
};

export const useGameLevel = (
  levelId: number,
  setGameState: (updater: (prev: ZipGameState | null) => ZipGameState | null) => void,
  levelSolutionRef: React.MutableRefObject<Point[] | null>,
  hintProgressRef: React.MutableRefObject<number>,
  resetTimer: () => void,
  clearProgress: () => Promise<void>,
  loadProgress: () => Promise<ZipGameState | null>,
  saveProgress: (state: ZipGameState) => Promise<void>,
  setShowLastNodeWarning: (show: boolean) => void,
  setHintPath: (path: any[]) => void
) => {
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  const [currentLevelId, setCurrentLevelId] = useState(levelId);
  const hasInitializedRef = useRef(false);

  const initializeLevel = useCallback(
    (id: number) => {
      const level = getLevelById(id);
      if (!level) {
        return;
      }

      const newState = createInitialGameState(level);
      setGameState(() => {
        return newState;
      });
      resetTimer();
      hintProgressRef.current = 0;
      setHintPath([]);
      setShowLastNodeWarning(false);

      if (level.solution && level.solution.length > 0) {
        levelSolutionRef.current = level.solution;
        setIsGeneratingSolution(false);
      } else {
        setIsGeneratingSolution(true);
        Promise.resolve().then(() => {
          try {
            const solution = getLevelSolution(
              id,
              level.gridSize,
              level.nodes,
              level.obstacles
            );
            levelSolutionRef.current = solution;
            setIsGeneratingSolution(false);
          } catch (error) {
            levelSolutionRef.current = null;
            setIsGeneratingSolution(false);
          }
        });
      }
    },
    [setGameState, resetTimer, setShowLastNodeWarning, setHintPath, hintProgressRef, levelSolutionRef]
  );

  const handleNextLevel = useCallback(() => {
    const nextLevelId = currentLevelId + 1;
    setCurrentLevelId(nextLevelId);
    setIsGeneratingSolution(true);
    initializeLevel(nextLevelId);
  }, [currentLevelId, initializeLevel]);

  useEffect(() => {
    if (!isGeneratingSolution) return;

    const checkInterval = setInterval(() => {
      if (levelSolutionRef.current && levelSolutionRef.current.length > 0) {
        setIsGeneratingSolution(false);
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [isGeneratingSolution]);

  useEffect(() => {
    if (hasInitializedRef.current) {
      console.log("🎮 [LEVEL] Already initialized, skipping");
      return;
    }
    
    hasInitializedRef.current = true;
    console.log("🎮 [LEVEL] Initializing game on mount");
    
    // Start game immediately with level 1, then check for saved progress
    initializeLevel(1);
    resetTimer();
    
    // Try to load saved progress in background (don't block initial render)
    loadProgress().then((saved) => {
      if (saved && saved.currentLevel > 1) {
        console.log("🎮 [LEVEL] Loaded saved progress, jumping to level", saved.currentLevel);
        // Use a small delay to ensure gameState is set first
        setTimeout(() => {
          initializeLevel(saved.currentLevel);
          resetTimer();
        }, 100);
      } else {
        console.log("🎮 [LEVEL] No saved progress for higher levels, staying on level 1");
        resetTimer();
      }
    }).catch((err) => {
      console.log("🎮 [LEVEL] No saved progress found, staying on level 1", err);
      resetTimer();
    });
  }, [initializeLevel, loadProgress, resetTimer]);

  return {
    isGeneratingSolution,
    handleNextLevel,
    currentLevelId,
    initializeLevel,
  };
};
