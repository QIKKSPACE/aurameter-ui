import React, { memo, useMemo } from 'react'
import { Svg, Polyline } from 'react-native-svg'
import type { PathStep, PathStatus } from './MathMazeTypes'
import { MathMazeColors } from './MathMazeColors'

interface MathMazePathProps {
  currentPath: PathStep[]
  cellSize: number
  gap: number
  gridSize: number
  pathStatus: PathStatus
}

const MathMazePath = memo(
  ({ currentPath, cellSize, gap, gridSize, pathStatus }: MathMazePathProps) => {
    const points = useMemo(() => {
      return currentPath
        .map((step) => {
          const x = step.col * (cellSize + gap) + cellSize / 2
          const y = step.row * (cellSize + gap) + cellSize / 2
          return `${x},${y}`
        })
        .join(' ')
    }, [currentPath, cellSize, gap])

    const strokeColor = useMemo(() => {
      return pathStatus === 'wrong' ? MathMazeColors.PATH_LINE_WRONG : MathMazeColors.PATH_LINE_COLOR
    }, [pathStatus])

    if (currentPath.length < 2) {
      return null
    }

    const boardWidth = (cellSize + gap) * gridSize - gap
    const boardHeight = (cellSize + gap) * gridSize - gap

    return (
      <Svg
        width={boardWidth}
        height={boardHeight}
        style={{ position: 'absolute' }}
        pointerEvents="none"
      >
        <Polyline
          points={points}
          stroke={strokeColor}
          strokeWidth={cellSize * 0.55}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
      </Svg>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.currentPath.length === nextProps.currentPath.length &&
      prevProps.cellSize === nextProps.cellSize &&
      prevProps.gap === nextProps.gap &&
      prevProps.gridSize === nextProps.gridSize &&
      prevProps.pathStatus === nextProps.pathStatus &&
      prevProps.currentPath.every(
        (step, idx) =>
          nextProps.currentPath[idx] &&
          step.row === nextProps.currentPath[idx].row &&
          step.col === nextProps.currentPath[idx].col
      )
    )
  }
)

MathMazePath.displayName = 'MathMazePath'

export default MathMazePath
