import React from 'react'
import { View } from 'react-native'
import { COLORS, GRID_PADDING } from './ZipColors'

interface ZipCellProps {
  row: number
  col: number
  cellSize: number
  isOnPath: boolean
}

const ZipCellComponent = React.memo<ZipCellProps>(
  ({ row, col, cellSize, isOnPath }) => {
    return (
      <View
        pointerEvents="none"
        style={{
          width: cellSize,
          height: cellSize,
          backgroundColor: COLORS.CELL_DEFAULT_BG,
          borderWidth: 1,
          borderColor: COLORS.CELL_BORDER,
        }}
      />
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.row === nextProps.row &&
      prevProps.col === nextProps.col &&
      prevProps.cellSize === nextProps.cellSize &&
      prevProps.isOnPath === nextProps.isOnPath
    )
  }
)

ZipCellComponent.displayName = 'ZipCell'
export const ZipCell = ZipCellComponent
