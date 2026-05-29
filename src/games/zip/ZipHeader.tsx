import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { COLORS } from './ZipColors'

interface ZipHeaderProps {
  elapsedSeconds: number
  onReset: () => void
  onGoBack?: () => void
}

export const ZipHeader = React.memo<ZipHeaderProps>(
  ({ elapsedSeconds, onReset, onGoBack }) => {
    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        {/* LEFT — back button, fixed width matching KenKen */}
        {onGoBack ? (
          <TouchableOpacity
            onPress={onGoBack}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}

        {/* CENTER — timer, flex:1, centered */}
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 18, color: COLORS.TIMER_COLOR, fontFamily: 'monospace' }}>
            🕐
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: COLORS.TIMER_COLOR,
              fontFamily: 'monospace',
              fontWeight: '500',
              minWidth: 50,
            }}
          >
            {formatTime(elapsedSeconds)}
          </Text>
        </View>

        {/* RIGHT — Reset button, fixed width */}
        <TouchableOpacity
          onPress={onReset}
          activeOpacity={0.7}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: COLORS.RESET_BTN_BG,
            borderWidth: 1,
            borderColor: COLORS.RESET_BTN_BORDER,
          }}
        >
          <Text style={{ fontSize: 15, color: COLORS.RESET_BTN_TEXT, fontWeight: '500' }}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
)

ZipHeader.displayName = 'ZipHeader'
