import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Difficulty, MinesweeperGameState, DIFFICULTY_CONFIGS, Cell } from './MinesweeperTypes';
import {
  createEmptyBoard,
  placeMines,
  revealCell,
  toggleFlag,
  checkWin,
  revealAllMines,
} from './MinesweeperEngine';

type TimerRef = ReturnType<typeof setInterval> | null;

export function useMinesweeper(initialDifficulty: Difficulty) {
  const initialConfig = DIFFICULTY_CONFIGS[initialDifficulty];

  const [gameState, setGameState] = useState<MinesweeperGameState>({
    board: createEmptyBoard(initialConfig.rows, initialConfig.cols),
    status: 'idle',
    difficulty: initialDifficulty,
    minesRemaining: initialConfig.mines,
    elapsedSeconds: 0,
    firstTapDone: false,
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<TimerRef>(null);
  const hasStartedRef = useRef(false);
  const savedBoardRef = useRef<Cell[][] | null>(null);
  const lastDifficultyRef = useRef<Difficulty>(initialDifficulty);

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

  const handleCellTap = useCallback(
    (row: number, col: number) => {
      setGameState(prev => {
        if (prev.status === 'won' || prev.status === 'lost') {
          return prev
        }

        const cell = prev.board[row][col]
        if (cell.state === 'flagged' || cell.state === 'revealed') {
          return prev
        }

        const config = DIFFICULTY_CONFIGS[prev.difficulty]

        if (!prev.firstTapDone) {
          const boardWithMines = placeMines(
            prev.board,
            config.rows,
            config.cols,
            config.mines,
            row,
            col
          )
          const revealedBoard = revealCell(
            boardWithMines,
            row,
            col,
            config.rows,
            config.cols
          )
          const won = checkWin(revealedBoard, config.rows, config.cols, config.mines)

          if (!hasStartedRef.current) {
            hasStartedRef.current = true
            startTimer();
          }

          // Save board state after mines placed but before any reveals
          savedBoardRef.current = boardWithMines.map(row =>
            row.map(cell => ({
              ...cell,
              state: 'unrevealed' as const,
              isHitMine: false,
            }))
          )

          return {
            ...prev,
            board: revealedBoard,
            status: won ? 'won' : 'playing',
            firstTapDone: true,
          }
        }

        const cellData = prev.board[row][col]

        if (cellData.isMine) {
          const revealedAll = revealAllMines(
            prev.board, config.rows, config.cols
          )
          // Stop timer immediately when player hits mine
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return {
            ...prev,
            board: revealedAll,
            status: 'lost',
          }
        }

        const revealedBoard = revealCell(
          prev.board, row, col, config.rows, config.cols
        )
        const won = checkWin(revealedBoard, config.rows, config.cols, config.mines)

        if (won) {
          // Stop timer immediately when player wins
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }

        return {
          ...prev,
          board: revealedBoard,
          status: won ? 'won' : 'playing',
        }
      })
    },
    []
  );

  const handleCellLongPress = useCallback(
    (row: number, col: number) => {
      setGameState(prev => {
        if (prev.status !== 'playing') return prev;
        const cell = prev.board[row][col];
        if (cell.state === 'revealed') return prev;

        const newBoard = toggleFlag(prev.board, row, col);
        const wasFlag = cell.state === 'flagged';
        const minesDelta = wasFlag ? 1 : -1;

        return {
          ...prev,
          board: newBoard,
          minesRemaining: prev.minesRemaining + minesDelta,
        };
      });
    },
    []
  );

  const handleRestart = useCallback(() => {
    setGameState(prev => {
      const config = DIFFICULTY_CONFIGS[prev.difficulty]
      const emptyBoard = createEmptyBoard(config.rows, config.cols)
      return {
        board: emptyBoard,
        status: 'idle',
        difficulty: prev.difficulty,
        minesRemaining: config.mines,
        elapsedSeconds: 0,
        firstTapDone: false,
      }
    })
    resetTimer()
    hasStartedRef.current = false
  }, [resetTimer]);

  const handleTryAgain = useCallback(() => {
    if (!savedBoardRef.current) {
      handleRestart()
      return
    }

    const config = DIFFICULTY_CONFIGS[lastDifficultyRef.current]

    // Reset all cells to unrevealed, keep mine positions
    const resetBoard = savedBoardRef.current.map(row =>
      row.map(cell => ({
        ...cell,
        state: 'unrevealed' as const,
        isHitMine: false,
      }))
    )

    setGameState({
      board: resetBoard,
      status: 'idle',
      difficulty: lastDifficultyRef.current,
      minesRemaining: config.mines,
      elapsedSeconds: 0,
      firstTapDone: true, // mines already placed
    })

    resetTimer()
    hasStartedRef.current = false
  }, [handleRestart, resetTimer])

  const handleChangeDifficulty = useCallback(
    (difficulty: Difficulty) => {
      const config = DIFFICULTY_CONFIGS[difficulty]
      const emptyBoard = createEmptyBoard(config.rows, config.cols)
      setGameState({
        board: emptyBoard,
        status: 'idle',
        difficulty: difficulty,
        minesRemaining: config.mines,
        elapsedSeconds: 0,
        firstTapDone: false,
      })

      resetTimer()
      hasStartedRef.current = false
      lastDifficultyRef.current = difficulty
      savedBoardRef.current = null
    },
    [resetTimer]
  );

  return {
    gameState,
    elapsedSeconds,
    handleCellTap,
    handleCellLongPress,
    handleRestart,
    handleChangeDifficulty,
    handleTryAgain,
  };
}
