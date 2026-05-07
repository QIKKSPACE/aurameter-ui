import React from 'react'
import { View, Text } from 'react-native'
import { COLORS } from './ZipColors'

interface ZipNodeProps {
  number: number
  cellSize: number
  isActive: boolean
}

const ZipNodeComponent = React.memo<ZipNodeProps>(
  ({ number, cellSize, isActive }) => {
    const nodeRadius = cellSize * 0.35
    const fontSize = cellSize * 0.35

    return (
      <View
        style={{
          width: cellSize * 0.7,
          height: cellSize * 0.7,
          borderRadius: nodeRadius,
          backgroundColor: isActive ? COLORS.NODE_ACTIVE_BG : COLORS.NODE_BG,
          borderWidth: 2,
          borderColor: COLORS.NODE_BORDER,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize,
            fontWeight: '700',
            color: COLORS.NODE_TEXT,
          }}
        >
          {number}
        </Text>
      </View>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.number === nextProps.number &&
      prevProps.cellSize === nextProps.cellSize &&
      prevProps.isActive === nextProps.isActive
    )
  }
)

ZipNodeComponent.displayName = 'ZipNode'
export const ZipNode = ZipNodeComponent
