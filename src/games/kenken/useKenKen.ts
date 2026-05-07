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
  findWrongCells,
  findForcedCell,
  findHintCage,
  getHintRevealCell,
} from './KenKenEngine';
import type { KenKenGameState, GridCoord, CellState, KenKenLevel } from './KenKenTypes';

export const useKenKen = (levelId: number = 1) => {
  const [currentLevelId, setCurrentLevelId] = useState(levelId);
  const [gameState, setGameState] = useState<KenKenGameState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<GridCoord[]>([]);
  const [hintCellFlash, setHintCellFlash] = useState<GridCoord | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStartedRef = useRef(false);
  const undoStackRef = useRef<CellState[][][]>([]);
  const redoStackRef = useRef<CellState[][][]>([]);
  const gameStateRef = useRef<KenKenGameState | null>(null);

  useEffect(() => {
    const loadLevel = async () => {
      const level = getLevelById(currentLevelId);
      if (!level) return;

      // Reset state synchronously BEFORE any async operations
      // This prevents the completion effect from firing on initial load
      setIsCompleted(false);
      hasStartedRef.current = false;
      setElapsedSeconds(0);
      setHintsUsed(0);

      const savedProgress = await AsyncStorage.getItem(`@aurameter/kenken-progress-${currentLevelId}`);
      let state: KenKenGameState;

      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          // If marked as completed, start fresh
          if (parsed.isCompleted) {
            state = {
              level,
              grid: initializeGrid(level),
              selectedCell: null,
              isCompleted: false,
              mistakesCount: 0,
              isPencilMode: false,
            };
          } else if (isGridComplete(parsed.grid, level)) {
            // Grid is complete but not marked as completed
            // This is an inconsistent state - start fresh
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
    // Only trigger completion if the user has actually interacted with this level
    if (!hasStartedRef.current) return;

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
  }, [gameState, stopTimer]);

  const startTimer = useCallback(() => {
    if (timerRef.current) return; // already running
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setElapsedSeconds(0);
  }, [stopTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (!gameState || gameState.isCompleted) return;

      if (!hasStartedRef.current && !gameState.grid[row][col].isGiven) {
        hasStartedRef.current = true;
        startTimer();
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
        startTimer();
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
    const state = gameStateRef.current;
    if (!state || state.isCompleted) return;

    const { grid, level } = state;
    const { gridSize, cages, solution } = level;

    setHintsUsed((prev) => prev + 1);

    // PRIORITY 1: Find wrong cells
    const wrongCells = findWrongCells(grid, gridSize, solution);
    if (wrongCells.length > 0) {
      setHighlightedCells(wrongCells);
      setHintMessage(
        wrongCells.length === 1
          ? 'This cell has an incorrect value.'
          : `${wrongCells.length} cells have incorrect values.`
      );
      // Auto-clear highlight after 3 seconds
      const timer = setTimeout(() => setHighlightedCells([]), 3000);
      return () => clearTimeout(timer);
    }

    // PRIORITY 2: Find forced cell
    const forced = findForcedCell(grid, gridSize, cages, solution);
    if (forced) {
      // Fill the forced cell with correct value
      setGameState((prev) => {
        if (!prev) return prev;
        const newGrid = prev.grid.map((row, r) =>
          row.map((cell, c) => {
            if (r === forced.cell.row && c === forced.cell.col) {
              return { ...cell, value: forced.value };
            }
            return cell;
          })
        );
        gameStateRef.current = { ...prev, grid: newGrid };
        return { ...prev, grid: newGrid };
      });
      setHintCellFlash(forced.cell);
      setHintMessage('We filled in a cell for you!');
      const timer = setTimeout(() => setHintCellFlash(null), 1500);
      return () => clearTimeout(timer);
    }

    // PRIORITY 3: Highlight a cage
    const hintCage = findHintCage(grid, gridSize, cages);
    if (hintCage) {
      const emptyCellsInCage = hintCage.cells.filter((c) => grid[c.row][c.col].value === null);
      setHighlightedCells(emptyCellsInCage);
      setHintMessage('Focus on this cage next.');
      const timer = setTimeout(() => setHighlightedCells([]), 3000);
      return () => clearTimeout(timer);
    }

    // PRIORITY 4: Reveal a cell by elimination
    const reveal = getHintRevealCell(grid, gridSize, solution);
    if (reveal) {
      setGameState((prev) => {
        if (!prev) return prev;
        const newGrid = prev.grid.map((row, r) =>
          row.map((cell, c) => {
            if (r === reveal.cell.row && c === reveal.cell.col) {
              return { ...cell, value: reveal.value };
            }
            return cell;
          })
        );
        gameStateRef.current = { ...prev, grid: newGrid };
        return { ...prev, grid: newGrid };
      });
      setHintCellFlash(reveal.cell);
      setHintMessage('We gave you a starting point!');
      const timer = setTimeout(() => setHintCellFlash(null), 1500);
      return () => clearTimeout(timer);
    }

    // No hint available
    setHintMessage('The puzzle looks complete — check for errors!');
    const timer = setTimeout(() => setHintMessage(null), 2000);
    return () => clearTimeout(timer);
  }, []);

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
  }, []);

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
    resetTimer();
    setHintsUsed(0);
    setIsCompleted(false);
  }, [currentLevelId, resetTimer]);

  const handleNextLevel = useCallback(() => {
    const nextId = currentLevelId + 1;
    const nextLevel = getLevelById(nextId);
    if (!nextLevel) return;
    resetTimer();
    setCurrentLevelId(nextId);
  }, [currentLevelId, resetTimer]);

  return {
    gameState,
    elapsedSeconds,
    hintsUsed,
    isCompleted,
    hintMessage,
    highlightedCells,
    hintCellFlash,
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
