import React, { memo, useMemo } from 'react'
import { View, Text } from 'react-native'
import type { GridCell } from './MathMazeTypes'
import { MathMazeColors } from './MathMazeColors'

interface MathMazeCellProps {
  cell: GridCell
  cellSize: number
  isOnCurrentPath: boolean
  isWrong: boolean
}

const MathMazeCell = memo(
  ({
    cell,
    cellSize,
    isOnCurrentPath,
    isWrong,
  }: MathMazeCellProps) => {
    const cellBackgroundColor = useMemo(() => {
      if (isWrong) return MathMazeColors.CELL_WRONG_BG
      if (isOnCurrentPath) return MathMazeColors.CELL_SELECTED_BG
      return MathMazeColors.CELL_DEFAULT_BG
    }, [isOnCurrentPath, isWrong])

    const textColor = useMemo(() => {
      if (isWrong) return MathMazeColors.CELL_WRONG_TEXT
      if (isOnCurrentPath) return MathMazeColors.CELL_SELECTED_TEXT
      return MathMazeColors.CELL_DEFAULT_TEXT
    }, [isOnCurrentPath, isWrong])

    const cellDisplay = useMemo(() => {
      if (cell.type === 'operator') {
        return cell.value as string
      }
      return String(cell.value)
    }, [cell])

    return (
      <View
        style={{
          width: cellSize,
          height: cellSize,
          borderRadius: cellSize * 0.25,
          backgroundColor: cellBackgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
        pointerEvents="none"
      >
        <Text
          style={{
            fontSize: cellSize * 0.4,
            fontWeight: '700',
            color: textColor,
          }}
        >
          {cellDisplay}
        </Text>
      </View>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.cell.row === nextProps.cell.row &&
      prevProps.cell.col === nextProps.cell.col &&
      prevProps.isOnCurrentPath === nextProps.isOnCurrentPath &&
      prevProps.isWrong === nextProps.isWrong &&
      prevProps.cellSize === nextProps.cellSize
    )
  }
)

MathMazeCell.displayName = 'MathMazeCell'

export default MathMazeCell
