import React, { useMemo, useState } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useZipGame } from './useZipGame'
import { ZipHeader } from './ZipHeader'
import { ZipBoard } from './ZipBoard'
import { ZipControls } from './ZipControls'
import { ZipHintMessage } from './ZipHintMessage'
import { ZipHowToPlay } from './ZipHowToPlay'
import { getPathSegments } from './ZipEngine'
import { COLORS } from './ZipColors'
import { totalLevels } from './ZipLevelConfig'

type ZipGameScreenProps = {
  navigation?: { goBack: () => void }
}

export const ZipGameScreen = React.memo(({ navigation }: ZipGameScreenProps) => {
  const insets = useSafeAreaInsets()
  const [boardAreaWidth, setBoardAreaWidth] = useState(0)
  const {
    gameState,
    isDragging,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleUndo,
    handleHint,
    handleReset,
    initLevel,
    handleNextLevel,
  } = useZipGame()

  const hintedCells = useMemo(() => {
    const set = new Set<string>()
    if (gameState.hintsUsed > 0) {
      const segments = getPathSegments(
        gameState.currentPath, gameState.level.nodes
      )
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1]
        for (const cell of lastSegment.cells) {
          const index = gameState.currentPath.findIndex(
            c => c.row === cell.row && c.col === cell.col
          )
          if (index >= gameState.currentPath.length - 4) {
            set.add(`${cell.row},${cell.col}`)
          }
        }
      }
    }
    return set
  }, [gameState.currentPath, gameState.level.nodes, gameState.hintsUsed])

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.SCREEN_BG,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* HEADER — fixed height */}
      <ZipHeader
        elapsedSeconds={gameState.elapsedSeconds}
        onReset={handleReset}
        onGoBack={navigation?.goBack}
      />

      {/* BOARD AREA — flex:1, takes remaining space */}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onLayout={(e) => {
          const w = Math.floor(e.nativeEvent.layout.width)
          if (w > 0 && w !== boardAreaWidth) {
            setBoardAreaWidth(w)
          }
        }}
      >
        {boardAreaWidth > 0 && (
          <ZipBoard
            level={gameState.level}
            currentPath={gameState.currentPath}
            hintArrow={gameState.hintArrow}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            hintedCells={hintedCells}
            availableWidth={boardAreaWidth}
          />
        )}

        {gameState.isComplete && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          >
            <View
              style={{
                backgroundColor: COLORS.MESSAGE_BG,
                borderRadius: 16,
                padding: 24,
                alignItems: 'center',
                marginHorizontal: 32,
              }}
            >
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#22C55E',
                marginBottom: 12,
              }}>
                ✓ Level Complete!
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#FFFFFF',
                marginBottom: 16,
              }}>
                {`Time: ${Math.floor(gameState.elapsedSeconds / 60)}:${String(gameState.elapsedSeconds % 60).padStart(2, '0')}`}
              </Text>
              {gameState.level.id < totalLevels() ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleNextLevel}
                  style={{
                    backgroundColor: COLORS.PATH_COLORS[0],
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 24,
                  }}
                >
                  <Text style={{ fontWeight: '600', color: '#000' }}>
                    Next Level ({gameState.level.id} / {totalLevels()})
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={{
                  fontSize: 16,
                  color: COLORS.PATH_COLORS[0],
                  fontWeight: '600',
                }}>
                  🎉 All {totalLevels()} levels complete!
                </Text>
              )}
            </View>
          </View>
        )}
      </View>

      {/* CONTROLS — fixed height */}
      <ZipControls
        onUndo={handleUndo}
        onHint={handleHint}
        canUndo={gameState.currentPath.length > 1}
      />

      {/* HINT MESSAGE — fixed height */}
      <ZipHintMessage message={gameState.hintMessage} />

      {/* HOW TO PLAY — collapsed by default to save space */}
      <ZipHowToPlay />

    </View>
  )
})

ZipGameScreen.displayName = 'ZipGameScreen'
