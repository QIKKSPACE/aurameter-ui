import React, { useMemo } from 'react'
import { View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { MathMazeColors } from './MathMazeColors'
import type { PathStatus } from './MathMazeTypes'

interface MathMazeTargetProps {
  target: number
  currentResult: number | null
  pathStatus: PathStatus
}

export default function MathMazeTarget({
  target,
  currentResult,
  pathStatus,
}: MathMazeTargetProps) {
  const isWrong = pathStatus === 'wrong'

  const displayValue = useMemo(() => {
    if (isWrong && currentResult !== null) {
      return `${currentResult}/${target}`
    }
    return String(target)
  }, [isWrong, currentResult, target])

  const valueColor = useMemo(() => {
    return isWrong ? MathMazeColors.TARGET_WRONG_COLOR : MathMazeColors.TARGET_VALUE
  }, [isWrong])

  return (
    <View style={{ alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Icon name="close-circle" size={14} color={MathMazeColors.TARGET_ICON} />
        <Text
          style={{
            color: MathMazeColors.TARGET_LABEL,
            fontSize: 13,
            fontWeight: '600',
            letterSpacing: 1,
            marginLeft: 6,
          }}
        >
          TARGET GOAL
        </Text>
      </View>
      <Text
        style={{
          fontSize: 72,
          fontWeight: '700',
          color: valueColor,
        }}
      >
        {displayValue}
      </Text>
    </View>
  )
}
