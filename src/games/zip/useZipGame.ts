/**
 * Zip Challenge Game Hook - Thin Composer
 */

import { useCallback, useState } from "react";
import { getPathCells } from "./ZipEngine";
import type { Point, ZipGameState } from "./ZipTypes";
import { useGameState } from "./hooks/useGameState";
import { useGameTimer } from "./hooks/useGameTimer";
import { useGameStorage } from "./hooks/useGameStorage";
import { useGameHints } from "./hooks/useGameHints";
import { useGameControls } from "./hooks/useGameControls";
import { useGameLevel } from "./hooks/useGameLevel";

export const useZipGame = (levelId: number = 1) => {
  const state = useGameState();
  const storage = useGameStorage(state.gameState?.currentLevel ?? levelId);
  const timer = useGameTimer(state.isCompleted, state.appStateRef);
  const [, setShowToast] = useState(false);
  const showToastFn = useCallback((msg: string) => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, []);

  const hints = useGameHints(state.gameState, state.setGameState, state.levelSolutionRef, state.hintProgressRef, state.hintsUsed, state.setHintsUsed, showToastFn);
  const controls = useGameControls(state.gameState, state.setGameState, state.gameStateRef, state.hintProgressRef, hints.setHintPath, showToastFn, state.lastCellKeyRef, state.lastNodeWarningShownRef, state.setShowLastNodeWarning, hints.syncHintProgress);
  const level = useGameLevel(levelId, state.setGameState, state.levelSolutionRef, state.hintProgressRef, timer.resetTimer, storage.clearProgress, storage.loadProgress, storage.saveProgress, state.setShowLastNodeWarning, hints.setHintPath);

  return {
    gameState: state.gameState,
    elapsedSeconds: timer.elapsedSeconds,
    hintPath: hints.hintPath,
    isCompleted: state.isCompleted,
    hintsUsed: state.hintsUsed,
    isGeneratingSolution: level.isGeneratingSolution,
    showLastNodeWarning: state.showLastNodeWarning,
    nextHint: null,
    handleTapCell: controls.handleTapCell,
    handleDragCell: controls.handleDragCell,
    handleDragStart: controls.handleDragCell,
    handleUndo: controls.handleUndo,
    handleReset: () => level.initializeLevel(level.currentLevelId),
    handleHint: hints.handleHint,
    handleNextLevel: level.handleNextLevel,
    initializeGame: level.initializeLevel,
    getCurrentPosition: useCallback((): Point | null => {
      if (!state.gameState || state.gameState.path.length === 0) {
        return state.gameState?.nodes[0]?.position || null;
      }
      return state.gameState.path[state.gameState.path.length - 1].to;
    }, [state.gameState]),
    getFilledCells: useCallback((): Set<string> => {
      if (!state.gameState) return new Set();
      return getPathCells(state.gameState.path, state.gameState.gridSize);
    }, [state.gameState]),
  };
};



