import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { MathMazeColors } from './MathMazeColors'

interface MathMazeHeaderProps {
  playerName: string
  playerScore: number
  timeRemaining: number
  onTimerPress?: () => void
  onInfoPress?: () => void
  onGoBack?: () => void
}

export default function MathMazeHeader({
  playerName,
  playerScore,
  timeRemaining,
  onTimerPress,
  onInfoPress,
  onGoBack,
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {onGoBack && (
              <TouchableOpacity
                onPress={onGoBack}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: '#1E1E1E',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.15)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon name="arrow-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: MathMazeColors.PLAYER_AVATAR_BG,
                alignItems: 'center',
                justifyContent: 'center',
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
          </View>
          <Text
            style={{
              color: MathMazeColors.PLAYER_NAME_COLOR,
              fontSize: 13,
              fontWeight: '600',
              marginBottom: 2,
              marginTop: 4,
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
          <TouchableOpacity
            onPress={onInfoPress}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#1E1E1E',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.25)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#8B8FE8',
                fontStyle: 'italic',
              }}
            >
              i
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
