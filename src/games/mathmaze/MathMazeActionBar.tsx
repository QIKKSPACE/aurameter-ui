import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MathMazeColors } from './MathMazeColors'

interface MathMazeActionBarProps {
  onClear: () => void
}

export default function MathMazeActionBar({
  onClear,
}: MathMazeActionBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 12,
        paddingBottom: Math.max(insets.bottom, 20),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: MathMazeColors.SCREEN_BG,
      }}
    >
      <TouchableOpacity
        onPress={onClear}
        style={{
          width: '60%',
          height: 52,
          borderRadius: 14,
          backgroundColor: MathMazeColors.ACTION_BUTTON_BG,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Icon name="close" size={18} color={MathMazeColors.ACTION_BUTTON_TEXT} />
        <Text
          style={{
            color: MathMazeColors.ACTION_BUTTON_TEXT,
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          CLEAR
        </Text>
      </TouchableOpacity>
    </View>
  )
}
