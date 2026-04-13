import { useCallback, useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { MathMazeGameState, PathStep, PathStatus } from './MathMazeTypes'
import {
  generatePuzzle,
  evaluateExpression,
  canExtendPath,
  isBacktrack,
} from './MathMazeEngine'

const INITIAL_TIME_REMAINING = 120
const HIGH_SCORE_KEY = '@aurameter/mathmaze-highscore'

export function useMathMaze(gridSize: number = 3) {
  const [gameState, setGameState] = useState<MathMazeGameState>(() => {
    const puzzle = generatePuzzle(gridSize)
    return {
      puzzle,
      currentPath: [{ row: 0, col: 0 }],
      pathStatus: 'idle',
      currentResult: null,
      playerScore: 0,
      timeRemaining: INITIAL_TIME_REMAINING,
      roundsCompleted: 0,
      isGameOver: false,
    }
  })

  const [isDragging, setIsDragging] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wrongPathTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadHighScore = useCallback(async (): Promise<number> => {
    try {
      const saved = await AsyncStorage.getItem(HIGH_SCORE_KEY)
      return saved ? parseInt(saved, 10) : 0
    } catch {
      return 0
    }
  }, [])

  const saveHighScore = useCallback(async (score: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(HIGH_SCORE_KEY, String(score))
    } catch {}
  }, [])

  const handleCellDragStart = useCallback(
    (row: number, col: number) => {
      if (gameState.isGameOver) return
      if (gameState.pathStatus === 'wrong') return

      if (row === 0 && col === 0) {
        setIsDragging(true)
        setGameState((prev) => ({
          ...prev,
          currentPath: [{ row: 0, col: 0 }],
          pathStatus: 'drawing',
          currentResult: null,
        }))
      }
    },
    [gameState.isGameOver, gameState.pathStatus]
  )

  const handleCellDragEnter = useCallback(
    (row: number, col: number) => {
      if (!isDragging) return
      if (gameState.pathStatus === 'wrong') return

      setGameState((prev) => {
        if (prev.currentPath.length === 0) return prev

        const newCell = { row, col }
        const lastCell = prev.currentPath[prev.currentPath.length - 1]

        if (lastCell.row === newCell.row && lastCell.col === newCell.col) {
          return prev
        }

        if (isBacktrack(prev.currentPath, newCell)) {
          const newPath = prev.currentPath.slice(0, -1)
          const newResult = newPath.length > 1
            ? evaluateExpression(prev.puzzle.grid, newPath)
            : null
          return {
            ...prev,
            currentPath: newPath,
            currentResult: newResult,
          }
        }

        if (canExtendPath(prev.currentPath, newCell, prev.puzzle.gridSize)) {
          const newPath = [...prev.currentPath, newCell]
          const newResult = evaluateExpression(prev.puzzle.grid, newPath)
          return {
            ...prev,
            currentPath: newPath,
            currentResult: isNaN(newResult) ? null : newResult,
          }
        }

        return prev
      })
    },
    [isDragging, gameState.pathStatus]
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)

    setGameState((prev) => {
      if (prev.currentPath.length === 0) return prev

      // Guard: only evaluate when path ends at END cell
      const lastCell = prev.currentPath[prev.currentPath.length - 1]
      const endRow = prev.puzzle.gridSize - 1
      const endCol = prev.puzzle.gridSize - 1

      if (lastCell.row !== endRow || lastCell.col !== endCol) {
        return {
          ...prev,
          pathStatus: 'idle',
          currentPath: [{ row: 0, col: 0 }],
        }
      }

      const result = evaluateExpression(prev.puzzle.grid, prev.currentPath)
      const target = prev.puzzle.target

      // Tolerance-based comparison for floating point accuracy
      const isCorrect =
        Number.isFinite(result) &&
        Math.abs(result - target) < 0.001

      if (isCorrect) {
        return {
          ...prev,
          pathStatus: 'correct',
          playerScore: prev.playerScore + 1,
          roundsCompleted: prev.roundsCompleted + 1,
        }
      } else {
        return {
          ...prev,
          pathStatus: 'wrong',
          currentResult: result,
        }
      }
    })
  }, [])

  const handleUndo = useCallback(() => {
    setGameState((prev) => {
      if (prev.currentPath.length <= 1) return prev

      const newPath = prev.currentPath.slice(0, -1)
      const newResult = newPath.length > 1
        ? evaluateExpression(prev.puzzle.grid, newPath)
        : null

      return {
        ...prev,
        currentPath: newPath,
        currentResult: newResult,
        pathStatus: 'drawing',
      }
    })
  }, [])

  const handleClear = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      currentPath: [{ row: 0, col: 0 }],
      pathStatus: 'idle',
      currentResult: null,
    }))
  }, [])

  const handleRedo = useCallback(() => {
  }, [])

  const handleNextRound = useCallback(() => {
    const newGridSize = gameState.puzzle.gridSize
    const newPuzzle = generatePuzzle(newGridSize)

    setGameState((prev) => ({
      ...prev,
      puzzle: newPuzzle,
      currentPath: [{ row: 0, col: 0 }],
      pathStatus: 'idle',
      currentResult: null,
    }))
  }, [gameState.puzzle.gridSize])

  const startNewGame = useCallback((newGridSize?: number) => {
    const size = newGridSize ?? gridSize
    const puzzle = generatePuzzle(size)

    setGameState({
      puzzle,
      currentPath: [{ row: 0, col: 0 }],
      pathStatus: 'idle',
      currentResult: null,
      playerScore: 0,
      timeRemaining: INITIAL_TIME_REMAINING,
      roundsCompleted: 0,
      isGameOver: false,
    })

    setIsDragging(false)
  }, [gridSize])

  const handleRestart = useCallback(async () => {
    const newPuzzle = generatePuzzle(3)

    setGameState({
      puzzle: newPuzzle,
      currentPath: [{ row: 0, col: 0 }],
      pathStatus: 'idle',
      currentResult: null,
      playerScore: 0,
      timeRemaining: INITIAL_TIME_REMAINING,
      roundsCompleted: 0,
      isGameOver: false,
    })

    setIsDragging(false)
  }, [])

  useEffect(() => {
    loadHighScore().then(setHighScore)
    startNewGame()
  }, [loadHighScore, startNewGame])

  useEffect(() => {
    if (gameState.pathStatus === 'correct') {
      const timer = setTimeout(() => {
        handleNextRound()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [gameState.pathStatus, handleNextRound])

  useEffect(() => {
    if (gameState.pathStatus === 'wrong') {
      const timer = setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          currentPath: [{ row: 0, col: 0 }],
          pathStatus: 'idle',
          currentResult: null,
        }))
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [gameState.pathStatus])

  useEffect(() => {
    if (gameState.isGameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeRemaining <= 1) {
          return {
            ...prev,
            timeRemaining: 0,
            isGameOver: true,
          }
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameState.isGameOver])

  // Update high score when player score increases
  useEffect(() => {
    if (gameState.playerScore > 0 && gameState.playerScore > highScore) {
      setHighScore(gameState.playerScore)
      saveHighScore(gameState.playerScore)
    }
  }, [gameState.playerScore, highScore, saveHighScore])

  // Check high score when game ends
  useEffect(() => {
    if (gameState.isGameOver && gameState.playerScore > highScore) {
      setHighScore(gameState.playerScore)
      saveHighScore(gameState.playerScore)
    }
  }, [gameState.isGameOver, gameState.playerScore, highScore, saveHighScore])

  return {
    gameState,
    isDragging,
    handleCellDragStart,
    handleCellDragEnter,
    handleDragEnd,
    handleUndo,
    handleClear,
    handleRedo,
    handleNextRound,
    startNewGame,
    handleRestart,
    highScore,
  }
}
