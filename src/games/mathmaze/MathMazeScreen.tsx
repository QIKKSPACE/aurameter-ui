import React, { useState } from 'react'
import { View, useWindowDimensions, SafeAreaView, Modal, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ScreenBackground from '../../components/ScreenBackground'
import MathMazeHeader from './MathMazeHeader'
import MathMazeTarget from './MathMazeTarget'
import MathMazeBoard from './MathMazeBoard'
import MathMazeActionBar from './MathMazeActionBar'
import MathMazeOverlay from './MathMazeOverlay'
import { useMathMaze } from './useMathMaze'
import { MathMazeColors } from './MathMazeColors'

type Props = {
  navigation: {
    goBack: () => void
  }
}

const INITIAL_TIME_REMAINING = 120

export default function MathMazeGameScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const [showInfo, setShowInfo] = useState(false)

  const {
    gameState,
    isDragging,
    handleCellDragStart,
    handleCellDragEnter,
    handleDragEnd,
    handleClear,
    handleNextRound,
    highScore,
    handleRestart,
  } = useMathMaze(3)

  // Safe values with fallbacks
  const safeScore = gameState?.playerScore ?? 0
  const safeTime = gameState?.timeRemaining ?? INITIAL_TIME_REMAINING
  const safePuzzle = gameState?.puzzle ?? null
  const safeTarget = safePuzzle?.target ?? 0
  const safeCurrentPath = gameState?.currentPath ?? []
  const safePathStatus = gameState?.pathStatus ?? 'idle'
  const safeCurrentResult = gameState?.currentResult ?? null
  const safeIsGameOver = gameState?.isGameOver ?? false

  // Loading guard: show spinner until puzzle is generated
  if (!gameState || !gameState.puzzle) {
    return (
      <ScreenBackground>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color="#8B8FE8" size="large" />
        </View>
      </ScreenBackground>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MathMazeColors.SCREEN_BG }}>
      <View style={{ flex: 1, backgroundColor: MathMazeColors.SCREEN_BG }}>
        <MathMazeHeader
          playerName="You"
          playerScore={safeScore}
          timeRemaining={safeTime}
          onInfoPress={() => setShowInfo(true)}
          onTimerPress={() => {}}
          onGoBack={navigation.goBack}
        />

        <MathMazeTarget
          target={safeTarget}
          currentResult={safeCurrentResult}
          pathStatus={safePathStatus}
        />

        <View style={{ flex: 1 }}>
          <MathMazeBoard
            puzzle={safePuzzle}
            currentPath={safeCurrentPath}
            pathStatus={safePathStatus}
            screenWidth={width}
            screenHeight={height}
            onDragStart={handleCellDragStart}
            onDragEnter={handleCellDragEnter}
            onDragEnd={handleDragEnd}
          />
        </View>

        <MathMazeActionBar
          onClear={handleClear}
        />

        <MathMazeOverlay
          visible={safeIsGameOver}
          finalScore={safeScore}
          highScore={highScore}
          onRestart={handleRestart}
        />

        <Modal
          visible={showInfo}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowInfo(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.85)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                backgroundColor: '#1C1C1E',
                borderRadius: 20,
                width: width - 48,
                padding: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '800',
                  color: '#FFFFFF',
                  marginBottom: 20,
                }}
              >
                How to Play
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 400, marginBottom: 20 }}
              >
                {/* Rule 1 */}
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#8B8FE8',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: '#FFFFFF',
                      }}
                    >
                      1
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: '#FFFFFF',
                        marginBottom: 4,
                      }}
                    >
                      Find the Path
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#B0B0B0',
                        lineHeight: 18,
                      }}
                    >
                      Drag from the START cell to the END cell, connecting through other cells.
                    </Text>
                  </View>
                </View>

                {/* Rule 2 */}
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#8B8FE8',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: '#FFFFFF',
                      }}
                    >
                      2
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: '#FFFFFF',
                        marginBottom: 4,
                      }}
                    >
                      Match the Target
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#B0B0B0',
                        lineHeight: 18,
                      }}
                    >
                      The math expression formed by your path must equal the TARGET GOAL number shown above.
                    </Text>
                  </View>
                </View>

                {/* Rule 3 */}
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#8B8FE8',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: '#FFFFFF',
                      }}
                    >
                      3
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: '#FFFFFF',
                        marginBottom: 4,
                      }}
                    >
                      Left to Right Math
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#B0B0B0',
                        lineHeight: 18,
                      }}
                    >
                      Operations are applied left to right in the order you visit cells. No BODMAS — 5-3×2 = 4.
                    </Text>
                  </View>
                </View>

                {/* Rule 4 */}
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#8B8FE8',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: '#FFFFFF',
                      }}
                    >
                      4
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: '#FFFFFF',
                        marginBottom: 4,
                      }}
                    >
                      Alternating Cells
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#B0B0B0',
                        lineHeight: 18,
                      }}
                    >
                      Cells alternate between numbers and operators. A valid path is: number → op → number → op...
                    </Text>
                  </View>
                </View>

                {/* Rule 5 */}
                <View style={{ flexDirection: 'row' }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#8B8FE8',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: '#FFFFFF',
                      }}
                    >
                      5
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: '#FFFFFF',
                        marginBottom: 4,
                      }}
                    >
                      Score Points
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#B0B0B0',
                        lineHeight: 18,
                      }}
                    >
                      Each correct solution earns one point. Score as many as you can before time runs out!
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={() => setShowInfo(false)}
                style={{
                  backgroundColor: '#8B8FE8',
                  borderRadius: 12,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontSize: 16,
                  }}
                >
                  Got it!
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}
