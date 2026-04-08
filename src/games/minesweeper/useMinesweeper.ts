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
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<TimerRef>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (isTimerRunning && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isTimerRunning && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning]);

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
            setIsTimerRunning(true)
          }

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
    setElapsedSeconds(0)
    setIsTimerRunning(false)

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    hasStartedRef.current = false
  }, []);

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

      setElapsedSeconds(0)
      setIsTimerRunning(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      hasStartedRef.current = false
    },
    []
  );

  return {
    gameState,
    elapsedSeconds,
    handleCellTap,
    handleCellLongPress,
    handleRestart,
    handleChangeDifficulty,
  };
}
