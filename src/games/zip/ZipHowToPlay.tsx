import React, { useState } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { COLORS } from './ZipColors'

export const ZipHowToPlay = React.memo(() => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginVertical: 12,
        backgroundColor: COLORS.HOWTOPLAY_BG,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        activeOpacity={0.6}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.HOWTOPLAY_HEADER }}>
          How to play
        </Text>
        <Text style={{ fontSize: 14, color: COLORS.HOWTOPLAY_HEADER }}>
          {isExpanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View
          style={{
            marginTop: 12,
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
        >
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: COLORS.PATH_COLORS[0],
                  borderWidth: 1,
                  borderColor: COLORS.NODE_BORDER,
                }}
              />
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: COLORS.PATH_COLORS[1],
                  borderWidth: 1,
                  borderColor: COLORS.NODE_BORDER,
                }}
              />
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: COLORS.PATH_COLORS[2],
                  borderWidth: 1,
                  borderColor: COLORS.NODE_BORDER,
                }}
              />
            </View>
            <Text style={{ fontSize: 12, color: COLORS.MESSAGE_TEXT }}>
              Connect the dots in order
            </Text>
          </View>

          <View style={{ alignItems: 'center', flex: 1 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderWidth: 1,
                borderColor: COLORS.CELL_BORDER,
                marginBottom: 8,
                borderRadius: 4,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 10, color: COLORS.MESSAGE_TEXT }}>█</Text>
            </View>
            <Text style={{ fontSize: 12, color: COLORS.MESSAGE_TEXT }}>
              Fill every cell
            </Text>
          </View>
        </View>
      )}
    </View>
  )
})

ZipHowToPlay.displayName = 'ZipHowToPlay'
