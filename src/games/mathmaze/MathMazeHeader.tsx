import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { MathMazeColors } from './MathMazeColors'

interface MathMazeHeaderProps {
  playerName: string
  playerScore: number
  timeRemaining: number
  onTimerPress?: () => void
}

export default function MathMazeHeader({
  playerName,
  playerScore,
  timeRemaining,
  onTimerPress,
}: MathMazeHeaderProps) {
  const timerDisplay = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [timeRemaining])

  const displayPlayerName = useMemo(() => {
    return playerName.slice(0, 8)
  }, [playerName])

  return (
    <View style={{ backgroundColor: MathMazeColors.HEADER_BG, paddingHorizontal: 24, paddingVertical: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center', flex: 0.3 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: MathMazeColors.PLAYER_AVATAR_BG,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: MathMazeColors.PLAYER_NAME_COLOR,
              }}
            >
              Y
            </Text>
          </View>
          <Text
            style={{
              color: MathMazeColors.PLAYER_NAME_COLOR,
              fontSize: 13,
              fontWeight: '600',
              marginBottom: 2,
            }}
          >
            {displayPlayerName}
          </Text>
          <Text
            style={{
              color: MathMazeColors.PLAYER_SCORE_COLOR,
              fontSize: 12,
              fontWeight: '500',
            }}
          >
            {playerScore}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onTimerPress}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: MathMazeColors.TIMER_BG,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            flex: 0.4,
            justifyContent: 'center',
          }}
        >
          <Icon name="clock-outline" size={16} color={MathMazeColors.TIMER_ICON} />
          <Text
            style={{
              color: MathMazeColors.TIMER_TEXT,
              fontSize: 14,
              fontWeight: '700',
              marginLeft: 6,
            }}
          >
            {timerDisplay}
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 0.3, alignItems: 'flex-end' }}>
          <View
            style={{
              backgroundColor: MathMazeColors.SCORE_BADGE_BG,
              borderRadius: 10,
              width: 52,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: MathMazeColors.SCORE_BADGE_TEXT,
                fontSize: 20,
                fontWeight: '700',
              }}
            >
              {playerScore}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
