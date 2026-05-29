import React from 'react'
import { View, Text } from 'react-native'
import { COLORS } from './ZipColors'

interface ZipHintMessageProps {
  message: string | null
}

export const ZipHintMessage = React.memo<ZipHintMessageProps>(({ message }) => {
  if (!message) {
    return (
      <View
        style={{
          backgroundColor: COLORS.MESSAGE_BG,
          borderRadius: 12,
          padding: 14,
          marginHorizontal: 16,
          marginTop: 8,
          borderWidth: 1,
          borderColor: COLORS.MESSAGE_BORDER,
        }}
      >
        <Text style={{ fontSize: 14, color: COLORS.MESSAGE_TEXT, lineHeight: 20 }}>
          Feeling stuck? Tap 'Hint' to get a nudge in the right direction.
        </Text>
      </View>
    )
  }

  return (
    <View
      style={{
        backgroundColor: COLORS.MESSAGE_BG,
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: COLORS.MESSAGE_BORDER,
      }}
    >
      <Text style={{ fontSize: 14, color: COLORS.MESSAGE_TEXT, lineHeight: 20 }}>
        {message}
      </Text>
    </View>
  )
})

ZipHintMessage.displayName = 'ZipHintMessage'
