import React, { useEffect, useRef, useMemo } from 'react'
import { View, PanResponder, Text } from 'react-native'
import { ZipLevel, CellCoord, Direction } from './ZipTypes'
import { getPathSegments } from './ZipEngine'
import { ZipCell } from './ZipCell'
import { ZipNode } from './ZipNode'
import { ZipPathLayer } from './ZipPathLayer'
import { COLORS, GRID_PADDING } from './ZipColors'

interface ZipBoardProps {
  level: ZipLevel
  currentPath: CellCoord[]
  hintArrow: { cell: CellCoord; direction: Direction } | null
  onDragStart: (row: number, col: number) => void
  onDragMove: (row: number, col: number) => void
  onDragEnd: () => void
  hintedCells: Set<string>
  availableWidth: number
}

export const ZipBoard = React.memo<ZipBoardProps>(
  ({ level, currentPath, hintArrow, onDragStart, onDragMove, onDragEnd, hintedCells, availableWidth }) => {
    // FIX 2: Initialize all refs at component scope
    const cellSizeRef = useRef<number>(1)
    const gridSizeRef = useRef<number>(level.gridSize)
    const onDragStartRef = useRef<(row: number, col: number) => void>(() => {})
    const onDragMoveRef = useRef<(row: number, col: number) => void>(() => {})
    const onDragEndRef = useRef<() => void>(() => {})

    const CELL_SIZE = useMemo(() => {
      const padding = GRID_PADDING * 2
      return Math.max(
        Math.floor((availableWidth - padding) / level.gridSize),
        1
      )
    }, [availableWidth, level.gridSize])

    // FIX 2: Update ALL refs on EVERY render (outside useEffect) to ensure PanResponder always reads current values
    cellSizeRef.current = CELL_SIZE
    gridSizeRef.current = level.gridSize
    onDragStartRef.current = onDragStart
    onDragMoveRef.current = onDragMove
    onDragEndRef.current = onDragEnd

    // FIX 2: Define getCell helper outside PanResponder.create so it reads from always-current refs
    const getCell = (localX: number, localY: number): CellCoord | null => {
      const cs = cellSizeRef.current
      const gs = gridSizeRef.current
      if (cs <= 0 || gs <= 0) return null
      
      const adjustedX = Math.max(localX - 1, 0)
      const adjustedY = Math.max(localY - 1, 0)

      const col = Math.min(Math.max(Math.floor(adjustedX / cs), 0), gs - 1)
      const row = Math.min(Math.max(Math.floor(adjustedY / cs), 0), gs - 1)
      
      return { row, col }
    }

    // DEPRECATED: getCellFromPosition - use getCell instead
    const getCellFromPosition = (localX: number, localY: number): CellCoord | null => {
      return getCell(localX, localY)
    }

    // FIX 2: Create PanResponder once with ref-based handlers
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onShouldBlockNativeResponder: () => true,
        onPanResponderTerminationRequest: () => false,  // FIX 2: Don't give up responder lock

        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent
          const cell = getCell(locationX, locationY)
          if (cell) {
            onDragStartRef.current(cell.row, cell.col)
          }
        },

        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent
          const cell = getCell(locationX, locationY)
          if (cell) {
            onDragMoveRef.current(cell.row, cell.col)
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

    const segments = useMemo(() => getPathSegments(currentPath, level.nodes), [currentPath, level.nodes])

    const pathOnTouch = (isOn: boolean) => (cell: CellCoord) =>
      currentPath.some((c) => c.row === cell.row && c.col === cell.col) === isOn

    const arrowCharacter = hintArrow
      ? hintArrow.direction === 'up'
        ? '↑'
        : hintArrow.direction === 'down'
          ? '↓'
          : hintArrow.direction === 'left'
            ? '←'
            : '→'
      : ''

    return (
      <View
        collapsable={false}
        pointerEvents="box-only"
        style={{
          width: CELL_SIZE * level.gridSize + 2,
          height: CELL_SIZE * level.gridSize + 2,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
          backgroundColor: COLORS.GRID_BG,
          alignSelf: 'center',
          overflow: 'hidden',
        }}
        {...panResponder.panHandlers}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: '100%',
            height: '100%',
          }}
        >
          {Array.from({ length: level.gridSize * level.gridSize }).map((_, index) => {
            const row = Math.floor(index / level.gridSize)
            const col = index % level.gridSize
            const isOnCurrentPath = currentPath.some((c) => c.row === row && c.col === col)

            return (
              <View key={`cell-${row}-${col}`} pointerEvents="none">
                <ZipCell
                  row={row}
                  col={col}
                  cellSize={CELL_SIZE}
                  isOnPath={isOnCurrentPath}
                />
              </View>
            )
          })}
        </View>

        <ZipPathLayer
          cellSize={CELL_SIZE}
          gridSize={level.gridSize}
          segments={segments}
          hintedCells={hintedCells}
        />

        {/* Barrier overlay — rendered ABOVE path to always be visible */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: CELL_SIZE * level.gridSize,
            height: CELL_SIZE * level.gridSize,
            zIndex: 10,
          }}
          pointerEvents="none"
        >
          {level.barriers.map((barrier, index) => {
            const { row, col, edge } = barrier
            const x = col * CELL_SIZE
            const y = row * CELL_SIZE
            const BARRIER_THICKNESS = COLORS.BARRIER_WIDTH || 4

            let style: any = {
              position: 'absolute',
              backgroundColor: COLORS.BARRIER_COLOR || '#FFFFFF',
            }

            switch (edge) {
              case 'top':
                style = {
                  ...style,
                  left: x,
                  top: y,
                  width: CELL_SIZE,
                  height: BARRIER_THICKNESS,
                }
                break
              case 'bottom':
                style = {
                  ...style,
                  left: x,
                  top: y + CELL_SIZE - BARRIER_THICKNESS,
                  width: CELL_SIZE,
                  height: BARRIER_THICKNESS,
                }
                break
              case 'left':
                style = {
                  ...style,
                  left: x,
                  top: y,
                  width: BARRIER_THICKNESS,
                  height: CELL_SIZE,
                }
                break
              case 'right':
                style = {
                  ...style,
                  left: x + CELL_SIZE - BARRIER_THICKNESS,
                  top: y,
                  width: BARRIER_THICKNESS,
                  height: CELL_SIZE,
                }
                break
            }

            return <View key={`barrier-${index}`} style={style} />
          })}
        </View>

        {level.nodes.map((nodePos, nodeIndex) => {
          const isActive = nodeIndex === level.nodes.length - 1
            ? currentPath.some((c) => c.row === nodePos.row && c.col === nodePos.col)
            : currentPath.some((c) => c.row === nodePos.row && c.col === nodePos.col) &&
              !currentPath.slice(nodeIndex + 1).some((c) => c.row === nodePos.row && c.col === nodePos.col)

          return (
            <View
              key={`node-${nodeIndex}`}
              style={{
                position: 'absolute',
                left: nodePos.col * CELL_SIZE + CELL_SIZE / 2 - (CELL_SIZE * 0.7) / 2,
                top: nodePos.row * CELL_SIZE + CELL_SIZE / 2 - (CELL_SIZE * 0.7) / 2,
                zIndex: 30,
              }}
            >
              <ZipNode number={nodeIndex + 1} cellSize={CELL_SIZE} isActive={isActive} />
            </View>
          )
        })}

        {hintArrow && (
          <View
            style={{
              position: 'absolute',
              left: hintArrow.cell.col * CELL_SIZE,
              top: hintArrow.cell.row * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 20,
            }}
            pointerEvents="none"
          >
            <Text
              style={{
                fontSize: CELL_SIZE * 0.5,
                color: '#FFFFFF',
                fontWeight: '700',
                opacity: 0.9,
              }}
            >
              {arrowCharacter}
            </Text>
          </View>
        )}
      </View>
    )
  }
)

ZipBoard.displayName = 'ZipBoard'
