import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { COLORS } from './ZipColors'

interface ZipControlsProps {
  onUndo: () => void
  onHint: () => void
  canUndo: boolean
}

export const ZipControls = React.memo<ZipControlsProps>(({ onUndo, onHint, canUndo }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
      }}
    >
      <TouchableOpacity
        onPress={onUndo}
        activeOpacity={0.7}
        style={{
          flex: 1,
          backgroundColor: COLORS.UNDO_BTN_BG,
          borderRadius: 24,
          height: 48,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 6,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: canUndo ? '#FFFFFF' : COLORS.UNDO_BTN_TEXT,
            fontWeight: '500',
          }}
        >
          Undo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onHint}
        activeOpacity={0.7}
        style={{
          flex: 1,
          backgroundColor: COLORS.HINT_BTN_BG,
          borderRadius: 24,
          height: 48,
          borderWidth: 1,
          borderColor: COLORS.HINT_BTN_BORDER,
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 6,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: COLORS.HINT_BTN_TEXT,
            fontWeight: '500',
          }}
        >
          Hint
        </Text>
      </TouchableOpacity>
    </View>
  )
})

ZipControls.displayName = 'ZipControls'
