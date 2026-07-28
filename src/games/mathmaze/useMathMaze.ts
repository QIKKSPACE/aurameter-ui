import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { MathMazeGameState, PathStep, MazePuzzle } from './MathMazeTypes'
import {
  generatePuzzle,
  evaluateExpression,
  canExtendPath,
  isBacktrack,
} from './MathMazeEngine'
import {
  setPuzzle,
  setCurrentPath,
  setPathStatus,
  setCurrentResult,
  completeRound,
  resetPath,
  tickTime,
  collectReward,
  restartGame,
} from '../../store/mathMazeSlice'

type RootState = {
  mathMaze: MathMazeGameState
}

function createPuzzle(gridSize: number): MazePuzzle {
  const seed = Math.floor(Math.random() * 999999)
  return generatePuzzle(gridSize, seed)
}

export function useMathMaze(gridSize: number = 3) {
  const dispatch = useDispatch()
  const gameState = useSelector((state: RootState) => state.mathMaze)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wrongPathTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nextRoundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const puzzleRef = useRef<MazePuzzle | null>(gameState.puzzle)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    puzzleRef.current = gameState.puzzle
  }, [gameState.puzzle])

  useEffect(() => {
    if (!gameState.puzzle) {
      dispatch(setPuzzle(createPuzzle(gridSize)))
    }
  }, [dispatch, gameState.puzzle, gridSize])

  useEffect(() => {
    if (!gameState.puzzle || gameState.isGameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return undefined
    }

    if (timerRef.current) return undefined

    timerRef.current = setInterval(() => {
      dispatch(tickTime())
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [dispatch, gameState.isGameOver, gameState.puzzle])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (wrongPathTimeoutRef.current) {
        clearTimeout(wrongPathTimeoutRef.current)
      }
      if (nextRoundTimeoutRef.current) {
        clearTimeout(nextRoundTimeoutRef.current)
      }
    }
  }, [])

  const handleCellDragStart = useCallback(
    (row: number, col: number) => {
      if (!gameState.puzzle) return
      if (gameState.isGameOver) return
      if (gameState.pathStatus === 'wrong') return

      if (row === 0 && col === 0) {
        isDraggingRef.current = true
        dispatch(setCurrentPath([{ row: 0, col: 0 }]))
        dispatch(setPathStatus('drawing'))
        dispatch(setCurrentResult(null))
      }
    },
    [dispatch, gameState.isGameOver, gameState.pathStatus, gameState.puzzle]
  )

  const handleCellDragEnter = useCallback(
    (row: number, col: number) => {
      if (!isDraggingRef.current) return
      if (!gameState.puzzle) return
      if (gameState.pathStatus === 'wrong' || gameState.isGameOver) return

      const puzzle = puzzleRef.current
      if (!puzzle) return

      const currentPath = gameState.currentPath
      if (currentPath.length === 0) return

      const newCell = { row, col }
      const lastCell = currentPath[currentPath.length - 1]

      if (lastCell.row === newCell.row && lastCell.col === newCell.col) {
        return
      }

      if (isBacktrack(currentPath, newCell)) {
        const newPath = currentPath.slice(0, -1)
        const newResult =
          newPath.length > 1 ? evaluateExpression(puzzle.grid, newPath, puzzle.gridSize) : null
        dispatch(setCurrentPath(newPath))
        dispatch(setCurrentResult(newResult))
        return
      }

      if (canExtendPath(currentPath, newCell, puzzle.gridSize)) {
        const newPath = [...currentPath, newCell]
        const newResult = evaluateExpression(puzzle.grid, newPath, puzzle.gridSize)
        dispatch(setCurrentPath(newPath))
        dispatch(setCurrentResult(Number.isNaN(newResult) ? null : newResult))
      }
    },
    [dispatch, gameState.currentPath, gameState.isGameOver, gameState.pathStatus, gameState.puzzle]
  )

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false

    const puzzle = puzzleRef.current
    if (!puzzle) return

    const currentPath = gameState.currentPath
    if (currentPath.length === 0) return

    const lastCell = currentPath[currentPath.length - 1]
    const endRow = puzzle.gridSize - 1
    const endCol = puzzle.gridSize - 1

    if (lastCell.row !== endRow || lastCell.col !== endCol) {
      dispatch(resetPath())
      return
    }

    const result = evaluateExpression(puzzle.grid, currentPath, puzzle.gridSize)
    const target = puzzle.target
    const isCorrect = Number.isFinite(result) && Math.abs(result - target) < 0.001

    if (isCorrect) {
      dispatch(setCurrentResult(result))
      dispatch(completeRound())

      if (nextRoundTimeoutRef.current) {
        clearTimeout(nextRoundTimeoutRef.current)
      }

      nextRoundTimeoutRef.current = setTimeout(() => {
        const nextPuzzle = createPuzzle(puzzle.gridSize)
        dispatch(setPuzzle(nextPuzzle))
      }, 800)
    } else {
      dispatch(setCurrentResult(result))
      dispatch(setPathStatus('wrong'))

      if (wrongPathTimeoutRef.current) {
        clearTimeout(wrongPathTimeoutRef.current)
      }

      wrongPathTimeoutRef.current = setTimeout(() => {
        dispatch(resetPath())
      }, 1200)
    }
  }, [dispatch, gameState.currentPath])

  const handleClear = useCallback(() => {
    dispatch(resetPath())
  }, [dispatch])

  const handleNextRound = useCallback(() => {
    const puzzle = puzzleRef.current
    if (!puzzle) return
    dispatch(setPuzzle(createPuzzle(puzzle.gridSize)))
  }, [dispatch])

  const startNewGame = useCallback((newGridSize?: number) => {
    const size = newGridSize ?? gridSize
    const puzzle = createPuzzle(size)
    dispatch(setPuzzle(puzzle))
  }, [dispatch, gridSize])

  const handleRestart = useCallback(() => {
    const puzzle = createPuzzle(gridSize)
    dispatch(restartGame(puzzle))
  }, [dispatch, gridSize])



  return {
    gameState,
    handleCellDragStart,
    handleCellDragEnter,
    handleDragEnd,
    handleClear,
    handleNextRound,
    startNewGame,
    handleRestart,
  
    highScore: gameState.highScore,
  }
}
