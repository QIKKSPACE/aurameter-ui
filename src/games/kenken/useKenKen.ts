import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import triggerHapticFeedback from '../../utils/haptics';
import {
  findForcedCell,
  findHintCage,
  findWrongCells,
  getHintRevealCell,
  isGridComplete,
} from './KenKenEngine';
import {
  clearCurrentLevel,
  collectReward,
  deleteCell,
  incrementElapsedSeconds,
  inputDigit,
  markCompleted,
  nextLevel,
  redo,
  resetCurrentLevel,
  selectCell,
  selectKenKenCurrentGame,
  selectKenKenTotals,
  setCurrentLevelId,
  setHighlightedCells,
  setHintCellFlash,
  setHintMessage,
  setHintUsage,
  setLevelState,
  togglePencil,
  undo,
} from '../../store/kenkenSlice';

const MAX_HINTS_PER_GAME = 2;

export const useKenKen = (levelId?: number) => {
  const dispatch = useDispatch();
  const gameState = useSelector(selectKenKenCurrentGame);
  const totals = useSelector(selectKenKenTotals);
  const prevCompletionRef = useRef(false);

  useEffect(() => {
    if (typeof levelId === 'number') {
      dispatch(setCurrentLevelId(levelId));
    }
  }, [dispatch, levelId]);

  useEffect(() => {
    if (!gameState?.hasStarted || gameState.isCompleted) return undefined;

    const timer = setInterval(() => {
      dispatch(incrementElapsedSeconds());
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch, gameState?.hasStarted, gameState?.isCompleted]);

  useEffect(() => {
    if (!gameState) return;
    const completed = gameState.hasStarted && isGridComplete(gameState.grid, gameState.level);
    if (completed && !gameState.isCompleted && !prevCompletionRef.current) {
      dispatch(markCompleted());
      try {
        triggerHapticFeedback.success();
      } catch (_) {
        // ignore
      }
    }
    prevCompletionRef.current = completed;
  }, [dispatch, gameState]);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (!gameState || gameState.isCompleted) return;
      dispatch(selectCell({ row, col }));
    },
    [dispatch, gameState]
  );

  const handleNumberInput = useCallback(
    (digit: number) => {
      if (!gameState || gameState.isCompleted) return;
      dispatch(inputDigit(digit));
    },
    [dispatch, gameState]
  );

  const handleDelete = useCallback(() => {
    if (!gameState || gameState.isCompleted) return;
    dispatch(deleteCell());
  }, [dispatch, gameState]);

  const handleUndo = useCallback(() => {
    if (!gameState || gameState.isCompleted) return;
    dispatch(undo());
  }, [dispatch, gameState]);

  const handleRedo = useCallback(() => {
    if (!gameState || gameState.isCompleted) return;
    dispatch(redo());
  }, [dispatch, gameState]);

  const handleClear = useCallback(() => {
    if (!gameState || gameState.isCompleted) return;
    dispatch(clearCurrentLevel());
  }, [dispatch, gameState]);

  const handleTogglePencil = useCallback(() => {
    if (!gameState) return;
    dispatch(togglePencil());
  }, [dispatch, gameState]);

  const handleReset = useCallback(() => {
    dispatch(resetCurrentLevel());
    dispatch(setHintMessage(null));
    dispatch(setHighlightedCells([]));
    dispatch(setHintCellFlash(null));
  }, [dispatch]);

  const handleNextLevel = useCallback(() => {
    dispatch(nextLevel());
    dispatch(setHintMessage(null));
    dispatch(setHighlightedCells([]));
    dispatch(setHintCellFlash(null));
  }, [dispatch]);

  const handleCollectReward = useCallback(() => {
    dispatch(collectReward());
  }, [dispatch]);

  const handleHint = useCallback(() => {
    if (!gameState || gameState.isCompleted) return;
    const { grid, level, hintsUsed } = gameState;

    if (hintsUsed >= MAX_HINTS_PER_GAME) {
      dispatch(setHintMessage('Hint limit reached for this game.'));
      const timer = setTimeout(() => dispatch(setHintMessage(null)), 2000);
      return () => clearTimeout(timer);
    }

    dispatch(setHintUsage(hintsUsed + 1));

    const wrongCells = findWrongCells(grid, level.gridSize, level.solution);
    if (wrongCells.length > 0) {
      dispatch(setHighlightedCells(wrongCells));
      const firstWrong = wrongCells[0];
      const expectedValue = level.solution[firstWrong.row][firstWrong.col];
      dispatch(
        setHintMessage(
          wrongCells.length === 1
            ? `Cell ${firstWrong.row + 1},${firstWrong.col + 1} should be ${expectedValue}.`
            : `${wrongCells.length} cells need corrections. First one should be ${expectedValue}.`
        )
      );
      const timer = setTimeout(() => dispatch(setHighlightedCells([])), 3000);
      return () => clearTimeout(timer);
    }

    const forced = findForcedCell(grid, level.gridSize, level.cages, level.solution);
    if (forced) {
      const nextGrid = grid.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
          rowIndex === forced.cell.row && colIndex === forced.cell.col
            ? { ...cell, value: forced.value }
            : cell
        )
      );
      dispatch(
        setLevelState({
          levelId: level.id,
          levelState: {
            grid: nextGrid,
            hintCellFlash: forced.cell,
            hintMessage: `Place ${forced.value} in cell ${forced.cell.row + 1},${forced.cell.col + 1}.`,
          },
        })
      );
      const timer = setTimeout(() => dispatch(setHintCellFlash(null)), 1500);
      return () => clearTimeout(timer);
    }

    const hintCage = findHintCage(grid, level.gridSize, level.cages);
    if (hintCage) {
      const emptyCellsInCage = hintCage.cells.filter((cell) => grid[cell.row][cell.col].value === null);
      dispatch(setHighlightedCells(emptyCellsInCage));
      if (emptyCellsInCage.length > 0) {
        const targetCell = emptyCellsInCage[0];
        dispatch(
          setHintMessage(
            `Try ${level.solution[targetCell.row][targetCell.col]} in cell ${targetCell.row + 1},${targetCell.col + 1}.`
          )
        );
      } else {
        dispatch(setHintMessage('Focus on this cage next.'));
      }
      const timer = setTimeout(() => dispatch(setHighlightedCells([])), 3000);
      return () => clearTimeout(timer);
    }

    const reveal = getHintRevealCell(grid, level.gridSize, level.solution);
    if (reveal) {
      const nextGrid = grid.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
          rowIndex === reveal.cell.row && colIndex === reveal.cell.col
            ? { ...cell, value: reveal.value }
            : cell
        )
      );
      dispatch(
        setLevelState({
          levelId: level.id,
          levelState: {
            grid: nextGrid,
            hintCellFlash: reveal.cell,
            hintMessage: `Place ${reveal.value} in cell ${reveal.cell.row + 1},${reveal.cell.col + 1}.`,
          },
        })
      );
      const timer = setTimeout(() => dispatch(setHintCellFlash(null)), 1500);
      return () => clearTimeout(timer);
    }

    dispatch(setHintMessage('The puzzle looks complete - check for errors!'));
    const timer = setTimeout(() => dispatch(setHintMessage(null)), 2000);
    return () => clearTimeout(timer);
  }, [dispatch, gameState]);

  if (!gameState) {
    return {
      gameState: null,
      elapsedSeconds: 0,
      hintsUsed: 0,
      isCompleted: false,
      totalScore: 0,
      pendingReward: 0,
      hintMessage: null,
      highlightedCells: [],
      hintCellFlash: null,
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
      handleCollectReward,
    };
  }

  return {
    gameState,
    elapsedSeconds: gameState.elapsedSeconds,
    hintsUsed: gameState.hintsUsed,
    isCompleted: gameState.isCompleted,
    totalScore: totals.totalScore,
    pendingReward: totals.pendingReward,
    hintMessage: gameState.hintMessage,
    highlightedCells: gameState.highlightedCells,
    hintCellFlash: gameState.hintCellFlash,
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
    handleCollectReward,
  };
};
