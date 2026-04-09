import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import triggerHapticFeedback from '../../utils/haptics';
import { getLevelById } from './LevelConfig';
import {
  initializeGrid,
  setCellValue,
  setCellNotes,
  isGridComplete,
  getHint,
} from './KenKenEngine';
import type { KenKenGameState, GridCoord, CellState, KenKenLevel } from './KenKenTypes';

export const useKenKen = (levelId: number = 1) => {
  const [currentLevelId, setCurrentLevelId] = useState(levelId);
  const [gameState, setGameState] = useState<KenKenGameState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStartedRef = useRef(false);
  const undoStackRef = useRef<CellState[][][]>([]);
  const redoStackRef = useRef<CellState[][][]>([]);
  const gameStateRef = useRef<KenKenGameState | null>(null);

  useEffect(() => {
    const loadLevel = async () => {
      const level = getLevelById(currentLevelId);
      if (!level) return;

      const savedProgress = await AsyncStorage.getItem(`@aurameter/kenken-progress-${currentLevelId}`);
      let state: KenKenGameState;

      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          if (parsed.isCompleted) {
            state = {
              level,
              grid: initializeGrid(level),
              selectedCell: null,
              isCompleted: false,
              mistakesCount: 0,
              isPencilMode: false,
            };
          } else {
            state = parsed;
          }
        } catch {
          state = {
            level,
            grid: initializeGrid(level),
            selectedCell: null,
            isCompleted: false,
            mistakesCount: 0,
            isPencilMode: false,
          };
        }
      } else {
        state = {
          level,
          grid: initializeGrid(level),
          selectedCell: null,
          isCompleted: false,
          mistakesCount: 0,
          isPencilMode: false,
        };
      }

      setGameState(state);
      gameStateRef.current = state;
      undoStackRef.current = [];
      redoStackRef.current = [];
      hasStartedRef.current = false;
      setIsTimerRunning(false);
      setElapsedSeconds(0);
      setHintsUsed(0);
      setIsCompleted(false);
    };

    loadLevel();
  }, [currentLevelId]);

  useEffect(() => {
    setCurrentLevelId(levelId);
  }, [levelId]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (!gameState) return;

    if (isGridComplete(gameState.grid, gameState.level)) {
      setIsCompleted(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      try {
        triggerHapticFeedback.success();
      } catch (_) {
        // ignore
      }

      const clearProgress = async () => {
        try {
          await AsyncStorage.removeItem(`@aurameter/kenken-progress-${gameState.level.id}`);
        } catch (_) {
          // ignore
        }
      };
      clearProgress();
    } else {
      const saveProgress = async () => {
        try {
          await AsyncStorage.setItem(
            `@aurameter/kenken-progress-${gameState.level.id}`,
            JSON.stringify(gameState)
          );
        } catch (_) {
          // ignore
        }
      };
      saveProgress();
    }
  }, [gameState]);

  useEffect(() => {
    if (!isTimerRunning || isCompleted) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning, isCompleted]);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (!gameState || gameState.isCompleted) return;

      if (!hasStartedRef.current && !gameState.grid[row][col].isGiven) {
        hasStartedRef.current = true;
        setIsTimerRunning(true);
      }

      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          selectedCell: { row, col },
        };
      });
    },
    [gameState]
  );

  const handleNumberInput = useCallback(
    (digit: number) => {
      if (!gameState || !gameState.selectedCell || gameState.isCompleted) return;

      const { row, col } = gameState.selectedCell;
      if (gameState.grid[row][col].isGiven) return;

      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        setIsTimerRunning(true);
      }

      setGameState((prev) => {
        if (!prev || !prev.selectedCell) return prev;

        const { row: r, col: c } = prev.selectedCell;
        let newGrid = [...prev.grid];

        if (prev.isPencilMode) {
          newGrid = setCellNotes(newGrid, r, c, digit);
        } else {
          const currentValue = prev.grid[r][c].value;
          if (currentValue === digit) {
            newGrid = setCellValue(newGrid, r, c, null, prev.level);
          } else {
            newGrid = setCellValue(newGrid, r, c, digit, prev.level);
          }
        }

        undoStackRef.current.push(prev.grid);
        if (undoStackRef.current.length > 20) {
          undoStackRef.current.shift();
        }
        redoStackRef.current = [];

        return {
          ...prev,
          grid: newGrid,
        };
      });
    },
    [gameState]
  );

  const handleDelete = useCallback(() => {
    if (!gameState || !gameState.selectedCell || gameState.isCompleted) return;

    const { row, col } = gameState.selectedCell;
    if (gameState.grid[row][col].isGiven) return;

    setGameState((prev) => {
      if (!prev || !prev.selectedCell) return prev;

      const { row: r, col: c } = prev.selectedCell;
      const newGrid = setCellValue([...prev.grid], r, c, null, prev.level);

      undoStackRef.current.push(prev.grid);
      if (undoStackRef.current.length > 20) {
        undoStackRef.current.shift();
      }
      redoStackRef.current = [];

      return {
        ...prev,
        grid: newGrid,
      };
    });
  }, [gameState]);

  const handleHint = useCallback(() => {
    if (!gameState || gameState.isCompleted) return;

    const hintCell = getHint(gameState.grid, gameState.level);
    if (!hintCell) return;

    setGameState((prev) => {
      if (!prev) return prev;

      const { row, col } = hintCell;
      const correctValue = prev.level.solution[row][col];
      const newGrid = setCellValue([...prev.grid], row, col, correctValue, prev.level);

      undoStackRef.current.push(prev.grid);
      if (undoStackRef.current.length > 20) {
        undoStackRef.current.shift();
      }
      redoStackRef.current = [];

      return {
        ...prev,
        grid: newGrid,
        selectedCell: hintCell,
      };
    });

    setHintsUsed((prev) => prev + 1);
  }, [gameState]);

  const handleUndo = useCallback(() => {
    if (!gameState || undoStackRef.current.length === 0) return;

    setGameState((prev) => {
      if (!prev) return prev;

      const previousGrid = undoStackRef.current.pop();
      if (!previousGrid) return prev;

      redoStackRef.current.push(prev.grid);
      if (redoStackRef.current.length > 20) {
        redoStackRef.current.shift();
      }

      return {
        ...prev,
        grid: previousGrid,
      };
    });
  }, [gameState]);

  const handleRedo = useCallback(() => {
    if (!gameState || redoStackRef.current.length === 0) return;

    setGameState((prev) => {
      if (!prev) return prev;

      const nextGrid = redoStackRef.current.pop();
      if (!nextGrid) return prev;

      undoStackRef.current.push(prev.grid);
      if (undoStackRef.current.length > 20) {
        undoStackRef.current.shift();
      }

      return {
        ...prev,
        grid: nextGrid,
      };
    });
  }, [gameState]);

  const handleClear = useCallback(() => {
    if (!gameState || gameState.isCompleted) return;

    setGameState((prev) => {
      if (!prev) return prev;

      const newGrid = prev.grid.map((row) =>
        row.map((cell) =>
          cell.isGiven
            ? cell
            : {
                ...cell,
                value: null,
                notes: [],
                isError: false,
                isHinted: false,
              }
        )
      );

      undoStackRef.current.push(prev.grid);
      if (undoStackRef.current.length > 20) {
        undoStackRef.current.shift();
      }
      redoStackRef.current = [];

      return {
        ...prev,
        grid: newGrid,
        selectedCell: null,
      };
    });
  }, [gameState]);

  const handleTogglePencil = useCallback(() => {
    if (!gameState) return;

    setGameState((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        isPencilMode: !prev.isPencilMode,
      };
    });
  }, [gameState]);

  const handleReset = useCallback(() => {
    const level = getLevelById(currentLevelId);
    if (!level) return;

    const newState: KenKenGameState = {
      level,
      grid: initializeGrid(level),
      selectedCell: null,
      isCompleted: false,
      mistakesCount: 0,
      isPencilMode: false,
    };

    setGameState(newState);
    gameStateRef.current = newState;
    undoStackRef.current = [];
    redoStackRef.current = [];
    hasStartedRef.current = false;
    setIsTimerRunning(false);
    setElapsedSeconds(0);
    setHintsUsed(0);
    setIsCompleted(false);
  }, [currentLevelId]);

  const handleNextLevel = useCallback(() => {
    const nextId = currentLevelId + 1;
    const nextLevel = getLevelById(nextId);
    if (!nextLevel) return;
    setCurrentLevelId(nextId);
  }, [currentLevelId]);

  return {
    gameState,
    elapsedSeconds,
    hintsUsed,
    isCompleted,
    handleCellPress,
    handleNumberInput,
    handleDelete,
    handleHint,
    handleUndo,
    handleRedo,
    handleClear,
    handleTogglePencil,
    handleReset,
    handleNextLevel,
  };
};
