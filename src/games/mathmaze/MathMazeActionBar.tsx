import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MathMazeColors } from './MathMazeColors'

interface MathMazeActionBarProps {
  onUndo: () => void
  onClear: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

export default function MathMazeActionBar({
  onUndo,
  onClear,
  onRedo,
  canUndo,
  canRedo,
}: MathMazeActionBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 12,
        paddingBottom: Math.max(insets.bottom, 20),
        gap: 8,
        alignItems: 'center',
        backgroundColor: MathMazeColors.SCREEN_BG,
      }}
    >
      <TouchableOpacity
        onPress={onUndo}
        disabled={!canUndo}
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: MathMazeColors.ACTION_BUTTON_BG,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: canUndo ? 1 : 0.5,
        }}
      >
        <Icon name="undo" size={20} color={MathMazeColors.ACTION_BUTTON_TEXT} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onClear}
        style={{
          flex: 1,
          height: 48,
          borderRadius: 12,
          backgroundColor: MathMazeColors.ACTION_BUTTON_BG,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Icon name="close" size={20} color={MathMazeColors.ACTION_BUTTON_TEXT} />
        <Text
          style={{
            color: MathMazeColors.ACTION_BUTTON_TEXT,
            fontSize: 14,
            fontWeight: '700',
          }}
        >
          CLEAR
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onRedo}
        disabled={!canRedo}
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: MathMazeColors.ACTION_BUTTON_BG,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: canRedo ? 1 : 0.5,
        }}
      >
        <Icon name="redo" size={20} color={MathMazeColors.ACTION_BUTTON_TEXT} />
      </TouchableOpacity>
    </View>
  )
}
