import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { View, PanResponder, useWindowDimensions, Text } from 'react-native'
import type { MazePuzzle, PathStep, PathStatus } from './MathMazeTypes'
import MathMazeCell from './MathMazeCell'
import MathMazePath from './MathMazePath'
import { createMathMazeStyles } from './MathMazeStyles'

const GAP = 8
const BOARD_PADDING = 24

interface MathMazeBoardProps {
  puzzle: MazePuzzle
  currentPath: PathStep[]
  pathStatus: PathStatus
  screenWidth: number
  screenHeight: number
  onDragStart: (row: number, col: number) => void
  onDragEnter: (row: number, col: number) => void
  onDragEnd: () => void
}

function MathMazeBoard({
  puzzle,
  currentPath,
  pathStatus,
  screenWidth,
  screenHeight,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: MathMazeBoardProps) {
  const BOARD_WIDTH = screenWidth - BOARD_PADDING * 2
  const CELL_SIZE = Math.floor(
    (BOARD_WIDTH - GAP * (puzzle.gridSize - 1)) / puzzle.gridSize
  )

  const cellSizeRef = useRef(CELL_SIZE)
  const gapRef = useRef(GAP)

  useEffect(() => {
    cellSizeRef.current = CELL_SIZE
    gapRef.current = GAP
  }, [CELL_SIZE])

  const onDragStartRef = useRef(onDragStart)
  const onDragEnterRef = useRef(onDragEnter)
  const onDragEndRef = useRef(onDragEnd)

  useEffect(() => {
    onDragStartRef.current = onDragStart
    onDragEnterRef.current = onDragEnter
    onDragEndRef.current = onDragEnd
  }, [onDragStart, onDragEnter, onDragEnd])

  const getCellFromPosition = useCallback(
    (localX: number, localY: number): PathStep | null => {
      const cs = cellSizeRef.current
      const gap = gapRef.current
      if (cs === 0) return null

      const col = Math.floor(localX / (cs + gap))
      const row = Math.floor(localY / (cs + gap))

      const gridSize = puzzle.gridSize
      if (row < 0 || row >= gridSize) return null
      if (col < 0 || col >= gridSize) return null

      return { row, col }
    },
    [puzzle.gridSize]
  )

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onShouldBlockNativeResponder: () => true,

      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent
        const cell = getCellFromPosition(locationX, locationY)
        if (cell) {
          onDragStartRef.current(cell.row, cell.col)
        }
      },

      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent
        const cell = getCellFromPosition(locationX, locationY)
        if (cell) {
          onDragEnterRef.current(cell.row, cell.col)
        }
      },

      onPanResponderRelease: () => {
        onDragEndRef.current()
      },

      onPanResponderTerminate: () => {
        onDragEndRef.current()
      },
    })
  ).current

  const styles = useMemo(
    () => createMathMazeStyles(screenWidth, screenHeight, puzzle.gridSize),
    [screenWidth, screenHeight, puzzle.gridSize]
  )

  const currentPathSet = useMemo(() => {
    return new Set(currentPath.map((p) => `${p.row},${p.col}`))
  }, [currentPath])

  const boardWidth = (CELL_SIZE + GAP) * puzzle.gridSize - GAP
  const boardHeight = (CELL_SIZE + GAP) * puzzle.gridSize - GAP

  return (
    <View style={styles.boardContainer}>
      <View
        style={{
          width: boardWidth,
          height: boardHeight,
          position: 'relative',
        }}
        {...panResponder.panHandlers}
      >
        <MathMazePath
          currentPath={currentPath}
          cellSize={CELL_SIZE}
          gap={GAP}
          gridSize={puzzle.gridSize}
          pathStatus={pathStatus}
        />

        <View style={styles.cellGrid}>
          {puzzle.grid.map((row, rowIdx) => (
            <View key={`row-${rowIdx}`} style={styles.cellRow}>
              {row.map((cell) => {
                const isOnPath = currentPathSet.has(`${cell.row},${cell.col}`)
                const isWrong = pathStatus === 'wrong' && isOnPath

                return (
                  <MathMazeCell
                    key={`cell-${cell.row}-${cell.col}`}
                    cell={cell}
                    cellSize={CELL_SIZE}
                    isOnCurrentPath={isOnPath}
                    isWrong={isWrong}
                  />
                )
              })}
            </View>
          ))}
        </View>

        <View
          style={{
            position: 'absolute',
            top: -45,
            left: CELL_SIZE / 2 - 25,
            backgroundColor: '#1A1A1A',
            borderWidth: 1.5,
            borderColor: '#EDE89A',
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
            START
          </Text>
        </View>

        <View
          style={{
            position: 'absolute',
            bottom: -45,
            right: CELL_SIZE / 2 - 25,
            backgroundColor: '#1A1A1A',
            borderWidth: 1.5,
            borderColor: '#EDE89A',
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
            END
          </Text>
        </View>
      </View>
    </View>
  )
}

export default MathMazeBoard
