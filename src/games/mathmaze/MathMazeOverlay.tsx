import React from 'react'
import { View, Text, TouchableOpacity, Modal, useWindowDimensions } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { MathMazeColors } from './MathMazeColors'

interface MathMazeOverlayProps {
  visible: boolean
  finalScore: number
  highScore: number
  onRestart: () => void
}

export default function MathMazeOverlay({
  visible,
  finalScore,
  highScore,
  onRestart,
}: MathMazeOverlayProps) {
  const { width } = useWindowDimensions()
  const isNewRecord = finalScore > highScore

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRestart}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.88)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            backgroundColor: '#1C1C1E',
            borderRadius: 24,
            padding: 32,
            alignItems: 'center',
            width: width - 48,
          }}
        >
          {/* TIME'S UP Header */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: '#FFFFFF',
              marginBottom: 24,
            }}
          >
            TIME'S UP
          </Text>

          {/* NEW RECORD Badge */}
          {isNewRecord && (
            <View
              style={{
                backgroundColor: '#00E5CC',
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 12,
                marginBottom: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name="star" size={16} color="#0D0D0D" />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: '#0D0D0D',
                }}
              >
                NEW RECORD
              </Text>
            </View>
          )}

          {/* Score and Best Cards */}
          <View
            style={{
              flexDirection: 'row',
              gap: 16,
              marginBottom: 32,
            }}
          >
            {/* Score Card */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#2A2A3D',
                borderRadius: 16,
                padding: 20,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: '#999999',
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                SCORE
              </Text>
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: '800',
                  color: '#00BCD4',
                }}
              >
                {finalScore}
              </Text>
            </View>

            {/* Best Card */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#2A2A3D',
                borderRadius: 16,
                padding: 20,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: '#999999',
                  fontWeight: '600',
                  marginBottom: 8,
                }}
              >
                BEST
              </Text>
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: '800',
                  color: '#EDE89A',
                }}
              >
                {Math.max(finalScore, highScore)}
              </Text>
            </View>
          </View>

          {/* PLAY AGAIN Button */}
          <TouchableOpacity
            onPress={onRestart}
            style={{
              backgroundColor: '#00BCD4',
              paddingHorizontal: 48,
              paddingVertical: 16,
              borderRadius: 12,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#0D0D0D',
                fontSize: 17,
                fontWeight: '700',
              }}
            >
              PLAY AGAIN
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
