import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { MathMazeColors } from './MathMazeColors'

interface MathMazeHeaderProps {
  playerScore: number
  bestScore: number
  timeRemaining: number
  onInfoPress?: () => void
  onGoBack?: () => void
}

export default function MathMazeHeader({
  playerScore,
  bestScore,
  timeRemaining,
  onInfoPress,
  onGoBack,
}: MathMazeHeaderProps) {
  const timerDisplay = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [timeRemaining])

  return (
    <View style={{ backgroundColor: MathMazeColors.HEADER_BG, paddingHorizontal: 24, paddingVertical: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
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

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: MathMazeColors.PLAYER_NAME_COLOR,
                fontSize: 28,
                fontWeight: '800',
              }}
            >
              Math Maze
            </Text>
            <Text
              style={{
                color: '#9C9C9C',
                fontSize: 12,
                fontWeight: '600',
                marginTop: 2,
              }}
            >
              Solve the path
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View
              style={{
                backgroundColor: '#1E1E1E',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                minWidth: 78,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <Text style={{ color: '#9C9C9C', fontSize: 10, fontWeight: '700' }}>SCORE</Text>
              <Text style={{ color: MathMazeColors.PLAYER_SCORE_COLOR, fontSize: 18, fontWeight: '800', marginTop: 2 }}>
                {playerScore}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: '#1E1E1E',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                minWidth: 78,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <Text style={{ color: '#9C9C9C', fontSize: 10, fontWeight: '700' }}>BEST</Text>
              <Text style={{ color: '#EDE89A', fontSize: 18, fontWeight: '800', marginTop: 2 }}>
                {bestScore}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: MathMazeColors.TIMER_BG,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 18,
              gap: 6,
            }}
          >
            <Icon name="clock-outline" size={16} color={MathMazeColors.TIMER_ICON} />
            <Text
              style={{
                color: MathMazeColors.TIMER_TEXT,
                fontSize: 13,
                fontWeight: '700',
              }}
            >
              {timerDisplay}
            </Text>
          </View>

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
