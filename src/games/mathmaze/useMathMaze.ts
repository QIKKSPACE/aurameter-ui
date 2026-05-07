import { useCallback, useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { MathMazeGameState, PathStep, PathStatus, MazePuzzle } from './MathMazeTypes'
import {
  generatePuzzle,
  evaluateExpression,
  canExtendPath,
  isBacktrack,
} from './MathMazeEngine'

const INITIAL_TIME_REMAINING = 120
const HIGH_SCORE_KEY = '@aurameter/mathmaze-highscore'

function createInitialGameState(): MathMazeGameState {
  return {
    puzzle: null,
    currentPath: [{ row: 0, col: 0 }],
    pathStatus: 'idle',
    currentResult: null,
    playerScore: 0,
    timeRemaining: INITIAL_TIME_REMAINING,
    roundsCompleted: 0,
    isGameOver: false,
  }
}

export function useMathMaze(gridSize: number = 3) {
  // CRITICAL: Stable puzzle ref that NEVER changes during level play
  // This ref is checked with === so the same object reference is always returned
  const stablePuzzleRef = useRef<MazePuzzle | null>(null)

  // Initialize gameState with default values to prevent null crashes on first render
  const [gameState, setGameState] = useState<MathMazeGameState>(() => createInitialGameState())

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
      if (!gameState) return
      if (gameState.isGameOver) return
      if (gameState.pathStatus === 'wrong') return

      if (row === 0 && col === 0) {
        setIsDragging(true)
        setGameState((prev) => {
          return {
            ...prev,
            currentPath: [{ row: 0, col: 0 }],
            pathStatus: 'drawing',
            currentResult: null,
          }
        })
      }
    },
    [gameState?.isGameOver, gameState?.pathStatus]
  )

  const handleCellDragEnter = useCallback(
    (row: number, col: number) => {
      if (!isDragging) return
      if (!gameState) return
      if (gameState.pathStatus === 'wrong') return

      // CRITICAL: Always use stablePuzzleRef.current to ensure we're reading from
      // the SAME puzzle object that was set at the start of this level
      const puzzle = stablePuzzleRef.current
      if (!puzzle) return

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
            ? evaluateExpression(puzzle.grid, newPath, puzzle.gridSize)
            : null
          return {
            ...prev,
            currentPath: newPath,
            currentResult: newResult,
          }
        }

        if (canExtendPath(prev.currentPath, newCell, puzzle.gridSize)) {
          const newPath = [...prev.currentPath, newCell]
          const newResult = evaluateExpression(puzzle.grid, newPath, puzzle.gridSize)
          return {
            ...prev,
            currentPath: newPath,
            currentResult: isNaN(newResult) ? null : newResult,
          }
        }

        return prev
      })
    },
    [isDragging, gameState?.pathStatus]
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)

    const puzzle = stablePuzzleRef.current
    if (!puzzle) return

    setGameState((prev) => {
      if (prev.currentPath.length === 0) return prev

      // Guard: only evaluate when path ends at END cell
      const lastCell = prev.currentPath[prev.currentPath.length - 1]
      const endRow = puzzle.gridSize - 1
      const endCol = puzzle.gridSize - 1

      if (lastCell.row !== endRow || lastCell.col !== endCol) {
        return {
          ...prev,
          pathStatus: 'idle',
          currentPath: [{ row: 0, col: 0 }],
        }
      }

      const result = evaluateExpression(puzzle.grid, prev.currentPath, puzzle.gridSize)
      const target = puzzle.target

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

  const handleClear = useCallback(() => {
    setGameState((prev) => {
      return {
        ...prev,
        currentPath: [{ row: 0, col: 0 }],
        pathStatus: 'idle',
        currentResult: null,
      }
    })
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startCountdown = useCallback(() => {
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeRemaining <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
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
  }, [])

  useEffect(() => {
    return () => {
      stopTimer()
    }
  }, [stopTimer])

  const handleNextRound = useCallback(() => {
    if (!gameState || !stablePuzzleRef.current) return
    const newGridSize = stablePuzzleRef.current.gridSize
    
    // Generate new puzzle with seeded random for determinism
    const newSeed = Math.floor(Math.random() * 999999)
    const newPuzzle = generatePuzzle(newGridSize, newSeed)
    
    // CRITICAL: Update BOTH ref and state with new puzzle
    stablePuzzleRef.current = newPuzzle
    setGameState((prev) => {
      return {
        ...prev,
        puzzle: newPuzzle,
        currentPath: [{ row: 0, col: 0 }],
        pathStatus: 'idle',
        currentResult: null,
      }
    })
  }, [])

  const startNewGame = useCallback((newGridSize?: number) => {
    const size = newGridSize ?? gridSize
    // Generate puzzle with seeded random for determinism
    const newSeed = Math.floor(Math.random() * 999999)
    const puzzle = generatePuzzle(size, newSeed)
    
    // CRITICAL: Store in stable ref that won't change for this level
    stablePuzzleRef.current = puzzle

    stopTimer()
    startCountdown()
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
  }, [gridSize, stopTimer, startCountdown])

  const handleRestart = useCallback(async () => {
    // Generate new restart puzzle with seeded random
    const newSeed = Math.floor(Math.random() * 999999)
    const newPuzzle = generatePuzzle(3, newSeed)
    
    // CRITICAL: Store in stable ref for this new game session
    stablePuzzleRef.current = newPuzzle

    stopTimer()
    startCountdown()
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
  }, [stopTimer, startCountdown])

  // CRITICAL: Initialize game on mount only - with empty deps
  useEffect(() => {
    const initGame = async () => {
      const highScoreLoaded = await loadHighScore()
      setHighScore(highScoreLoaded)
      startNewGame()
    }
    initGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!gameState || gameState.pathStatus !== 'correct') return
    
    const timer = setTimeout(() => {
      handleNextRound()
    }, 800)
    return () => clearTimeout(timer)
  }, [gameState?.pathStatus])

  useEffect(() => {
    if (!gameState || gameState.pathStatus !== 'wrong') return
    
    const timer = setTimeout(() => {
      setGameState((prev) => {
        return {
          ...prev,
          currentPath: [{ row: 0, col: 0 }],
          pathStatus: 'idle',
          currentResult: null,
        }
      })
    }, 1200)
    return () => clearTimeout(timer)
  }, [gameState?.pathStatus])

  // Update high score when player score increases
  useEffect(() => {
    if (gameState.playerScore > 0 && gameState.playerScore > highScore) {
      setHighScore(gameState.playerScore)
      saveHighScore(gameState.playerScore)
    }
  }, [gameState?.playerScore, highScore, saveHighScore])

  // Check high score when game ends
  useEffect(() => {
    if (gameState.isGameOver && gameState.playerScore > highScore) {
      setHighScore(gameState.playerScore)
      saveHighScore(gameState.playerScore)
    }
  }, [gameState?.isGameOver, gameState?.playerScore, highScore, saveHighScore])

  return {
    gameState,
    isDragging,
    handleCellDragStart,
    handleCellDragEnter,
    handleDragEnd,
    handleClear,
    handleNextRound,
    startNewGame,
    handleRestart,
    highScore,
  }
}
