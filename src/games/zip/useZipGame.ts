import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  canMoveTo,
  findFirstMistake,
  getHintArrowDirection,
  getHintExtension,
  getNextExpectedNodeIndex,
  isComplete,
} from './ZipEngine'
import { getLevel, totalLevels } from './ZipLevelConfig'
import { CellCoord, Direction, ZipGameState } from './ZipTypes'
import { HINT_EXTENSION_STEPS } from './ZipColors'
import {
  collectReward as collectZipReward,
  completeLevel as completeZipLevel,
  getZipTodayKey,
  setCurrentLevel as setZipCurrentLevel,
  useHint as incrementZipHint,
  ZIP_MAX_HINTS_PER_LEVEL,
} from '../../store/zipSlice'

const createGameStateForLevel = (
  levelId: number,
  hintsUsed: number,
  completed: boolean,
): ZipGameState => {
  const level = getLevel(levelId)

  return {
    level,
    currentPath: completed ? [...level.solution] : [level.nodes[0]],
    currentNodeIndex: completed ? level.nodes.length - 1 : 0,
    isComplete: completed,
    hintsUsed,
    hintMessage: null,
    hintArrow: null,
    elapsedSeconds: 0,
  }
}

interface UseZipGameReturn {
  gameState: ZipGameState
  isDragging: boolean
  rewardScore: number
  totalScore: number
  canAdvanceLevel: boolean
  handleDragStart: (row: number, col: number) => void
  handleDragMove: (row: number, col: number) => void
  handleDragEnd: () => void
  handleUndo: () => void
  handleHint: () => void
  handleReset: () => void
  handleCollectReward: () => void
  initLevel: (levelId: number) => void
  handleNextLevel: () => void
}

export function useZipGame(): UseZipGameReturn {
  const dispatch = useDispatch()
  const zipProgress = useSelector((state: any) => state.zip)
  const zipProgressRef = useRef(zipProgress)
  zipProgressRef.current = zipProgress

  const [gameState, setGameState] = useState<ZipGameState>(() => {
    const currentLevelId = zipProgress?.currentLevelId ?? 1
    const completed = zipProgress?.completedLevelId === currentLevelId
    return createGameStateForLevel(
      currentLevelId,
      zipProgress?.hintsUsed ?? 0,
      completed,
    )
  })

  const [isDragging, setIsDragging] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hintArrowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hintedCellsRef = useRef<Set<string>>(new Set())
  
  // FIX 1: Track current level ID with ref to prevent stale closures in handleNextLevel
  const currentLevelIdRef = useRef(zipProgress?.currentLevelId ?? 1)
  
  // FIX 2: gameStateRef to prevent stale closures in PanResponder
  const gameStateRef = useRef(gameState)
  const isDraggingRef = useRef(isDragging)
  const stateRef = useRef({ gameState, isDragging })
  
  // Update all refs on every render to ensure handlers always have current state
  currentLevelIdRef.current = gameState.level.id
  gameStateRef.current = gameState
  isDraggingRef.current = isDragging
  stateRef.current = { gameState, isDragging }

  const startTimer = useCallback(() => {
    if (timerRef.current !== null) return

    timerRef.current = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }))
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const clearHintArrow = useCallback(() => {
    if (hintArrowTimeoutRef.current !== null) {
      clearTimeout(hintArrowTimeoutRef.current)
    }
    hintedCellsRef.current.clear()
    setGameState((prev) => ({
      ...prev,
      hintArrow: null,
    }))
  }, [])

  const handleDragStart = useCallback(
    (row: number, col: number) => {
      if (gameStateRef.current.isComplete) return

      const firstNode = gameStateRef.current.level.nodes[0]
      const currentPath = gameStateRef.current.currentPath
      const currentLast = currentPath[currentPath.length - 1]

      // Check if starting from node 1
      const isNode1 = row === firstNode.row && col === firstNode.col

      // Check if starting from current path endpoint (for resuming after hint)
      const isCurrentEnd = currentLast && row === currentLast.row && col === currentLast.col

      if (!isNode1 && !isCurrentEnd) return

      // If restarting from node 1 with an existing path
      if (isNode1 && currentPath.length > 1) {
        setGameState((prev) => ({
          ...prev,
          currentPath: [prev.level.nodes[0]],
          currentNodeIndex: 0,
        }))
      }

      setIsDragging(true)
      hintedCellsRef.current.clear()
      clearHintArrow()
      if (gameStateRef.current.elapsedSeconds === 0) {
        startTimer()
      }
    },
    [clearHintArrow, startTimer]
  )

  const handleDragMove = useCallback(
    (row: number, col: number) => {
      // FIX BUG 3: Check isComplete state before allowing moves
      if (!isDraggingRef.current || stateRef.current.gameState.isComplete) return

      const target: CellCoord = { row, col }
      // FIX BUG 1: Use refs to read current state instead of stale closure
      const currentGameState = gameStateRef.current
      const currentPath = currentGameState.currentPath
      const last = currentPath[currentPath.length - 1]

      if (last.row === target.row && last.col === target.col) return

      const secondLast = currentPath.length >= 2 ? currentPath[currentPath.length - 2] : null
      if (secondLast && secondLast.row === target.row && secondLast.col === target.col) {
        const newPath = currentPath.slice(0, -1)
        const nextNodeIndex = getNextExpectedNodeIndex(newPath, currentGameState.level.nodes)

        setGameState((prev) => ({
          ...prev,
          currentPath: newPath,
          currentNodeIndex: nextNodeIndex,
        }))
        return
      }

      // FIX BUG 1: Use refs to pass state to canMoveTo
      if (canMoveTo(last, target, currentPath, currentGameState.level)) {
        const newPath = [...currentPath, target]
        let nextNodeIndex = getNextExpectedNodeIndex(newPath, currentGameState.level.nodes)

        for (let i = 0; i < currentGameState.level.nodes.length; i++) {
          if (
            currentGameState.level.nodes[i].row === target.row &&
            currentGameState.level.nodes[i].col === target.col
          ) {
            nextNodeIndex = i
            break
          }
        }

        const complete = isComplete(newPath, currentGameState.level)

        // FIX BUG 3: Check if path reached last node
        const lastNode = currentGameState.level.nodes[currentGameState.level.nodes.length - 1]
        const justReachedLastNode =
          target.row === lastNode.row && target.col === lastNode.col

        if (justReachedLastNode) {
          // Stop dragging when last node is reached
          setIsDragging(false)
          
          if (!complete) {
            // Not all cells covered - show message and reset
            setGameState((prev) => ({
              ...prev,
              currentPath: newPath,
              currentNodeIndex: nextNodeIndex,
              hintMessage: 'Fill all cells before reaching the last node!',
            }))
            // Reset after 1500ms
            setTimeout(() => {
              setGameState((prev) => ({
                ...prev,
                currentPath: [prev.level.nodes[0]],
                currentNodeIndex: 0,
                hintMessage: null,
              }))
            }, 1500)
          } else {
            // All cells covered - complete!
            const completedLevelId = currentGameState.level.id
            dispatch(
              completeZipLevel({
                levelId: completedLevelId,
                reward: completedLevelId,
              })
            )
            setGameState((prev) => ({
              ...prev,
              currentPath: newPath,
              currentNodeIndex: nextNodeIndex,
              isComplete: true,
            }))
          }
        } else {
          // Normal move
          setGameState((prev) => ({
            ...prev,
            currentPath: newPath,
            currentNodeIndex: nextNodeIndex,
            isComplete: complete,
          }))
        }
      }
    },
    [dispatch]  // Empty dependency array - use refs for all state
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleUndo = useCallback(() => {
    if (gameStateRef.current.isComplete) return
    if (gameState.currentPath.length <= 1) return

    const newPath = gameState.currentPath.slice(0, -1)
    const nextNodeIndex = getNextExpectedNodeIndex(newPath, gameState.level.nodes)

    setGameState((prev) => ({
      ...prev,
      currentPath: newPath,
      currentNodeIndex: nextNodeIndex,
      isComplete: false,
    }))
  }, [gameState.currentPath, gameState.level.nodes])

  const handleHint = useCallback(() => {
    if (gameStateRef.current.isComplete) return

    if ((zipProgressRef.current?.hintsUsed ?? 0) >= ZIP_MAX_HINTS_PER_LEVEL) {
      setGameState((prev) => ({
        ...prev,
        hintMessage: 'You can use at most 2 hints per level.',
      }))
      return
    }

    const mistakeIndex = findFirstMistake(gameState.currentPath, gameState.level.solution)
    let newPath: CellCoord[]
    let message: string

    hintedCellsRef.current.clear()

    if (mistakeIndex < gameState.currentPath.length) {
      newPath = gameState.currentPath.slice(0, mistakeIndex)
      const extension = getHintExtension(mistakeIndex, gameState.level.solution, HINT_EXTENSION_STEPS)
      newPath = [...newPath, ...extension]
      message = "We've erased your path up to your first mistake! We've also extended your path."

      for (let i = mistakeIndex; i < newPath.length; i++) {
        const cell = newPath[i]
        hintedCellsRef.current.add(`${cell.row},${cell.col}`)
      }
    } else {
      const extension = getHintExtension(gameState.currentPath.length, gameState.level.solution, HINT_EXTENSION_STEPS)
      newPath = [...gameState.currentPath, ...extension]
      message = "We've extended your path!"

      for (let i = gameState.currentPath.length; i < newPath.length; i++) {
        const cell = newPath[i]
        hintedCellsRef.current.add(`${cell.row},${cell.col}`)
      }
    }

    let hintArrow: { cell: CellCoord; direction: Direction } | null = null
    if (newPath.length < gameState.level.solution.length) {
      const lastHintedCell = newPath[newPath.length - 1]
      const nextCell = gameState.level.solution[newPath.length]
      const direction = getHintArrowDirection(lastHintedCell, nextCell)
      hintArrow = { cell: lastHintedCell, direction }
    }

    const nextNodeIndex = getNextExpectedNodeIndex(newPath, gameState.level.nodes)
    const complete = isComplete(newPath, gameState.level)

    dispatch(incrementZipHint())

    setGameState((prev) => ({
      ...prev,
      currentPath: newPath,
      currentNodeIndex: nextNodeIndex,
      isComplete: complete,
      hintsUsed: prev.hintsUsed + 1,
      hintMessage: message,
      hintArrow,
    }))

    if (hintArrowTimeoutRef.current !== null) {
      clearTimeout(hintArrowTimeoutRef.current)
    }

    hintArrowTimeoutRef.current = setTimeout(() => {
      clearHintArrow()
    }, 3000)
  }, [dispatch, gameState.currentPath, gameState.level, clearHintArrow])

  const handleReset = useCallback(() => {
    if (gameStateRef.current.isComplete) return

    setGameState((prev) => ({
      ...prev,
      currentPath: [prev.level.nodes[0]],
      currentNodeIndex: 0,
      isComplete: false,
      hintMessage: null,
      hintArrow: null,
    }))
    hintedCellsRef.current.clear()
  }, [])

  const initLevel = useCallback((levelId: number) => {
    // FIX 1: Validate levelId is in range
    if (levelId < 1 || levelId > totalLevels()) return
    
    stopTimer()

    const todayKey = getZipTodayKey()
    const isAdvancingToNewLevel = levelId > (zipProgressRef.current?.currentLevelId ?? 1)
    const isLockedToday =
      zipProgressRef.current?.completedOn === todayKey && isAdvancingToNewLevel
    if (isLockedToday) {
      setGameState((prev) => ({
        ...prev,
        hintMessage: 'Only one Zip level per day. Come back tomorrow for the next level.',
      }))
      return
    }

    // FIX 1: Update currentLevelIdRef so handleNextLevel always reads current level
    currentLevelIdRef.current = levelId

    const levelIsComplete = zipProgressRef.current?.completedLevelId === levelId
    const hintsUsed = levelIsComplete ? zipProgressRef.current?.hintsUsed ?? 0 : 0
    setGameState(createGameStateForLevel(levelId, hintsUsed, levelIsComplete))
    dispatch(setZipCurrentLevel({ levelId, hintsUsed, isComplete: levelIsComplete }))
    hintedCellsRef.current.clear()
    setIsDragging(false)
  }, [dispatch, stopTimer])

  // FIX 1: Add handleNextLevel to hook for use by ZipGameScreen
  // Moved after initLevel to fix TS2448 hoisting error
  const handleNextLevel = useCallback(() => {
    const nextId = currentLevelIdRef.current + 1
    const todayKey = getZipTodayKey()
    if ((zipProgressRef.current?.score ?? 0) > 0) return
    if (zipProgressRef.current?.completedOn === todayKey) return
    if (nextId > totalLevels()) return
    initLevel(nextId)
  }, [initLevel])

  const handleCollectReward = useCallback(() => {
    if ((zipProgressRef.current?.score ?? 0) <= 0) return
    dispatch(collectZipReward())
  }, [dispatch])

  useEffect(() => {
    if (gameState.isComplete) {
      stopTimer()
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameState.isComplete, stopTimer])

  return {
    gameState,
    isDragging,
    rewardScore: zipProgress?.score ?? 0,
    totalScore: zipProgress?.totalScore ?? 0,
    canAdvanceLevel:
      gameState.isComplete &&
      zipProgress?.completedOn !== getZipTodayKey() &&
      (zipProgress?.score ?? 0) <= 0,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleUndo,
    handleHint,
    handleReset,
    handleCollectReward,
    initLevel,
    handleNextLevel,
  }
}
