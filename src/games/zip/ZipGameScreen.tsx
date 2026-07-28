import React, { useMemo, useState } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { useZipGame } from './useZipGame'
import { ZipHeader } from './ZipHeader'
import { ZipBoard } from './ZipBoard'
import { ZipControls } from './ZipControls'
import { ZipHintMessage } from './ZipHintMessage'
import { ZipHowToPlay } from './ZipHowToPlay'
import { getPathSegments } from './ZipEngine'
import { COLORS } from './ZipColors'
import { totalLevels } from './ZipLevelConfig'
import api from '../../services/api'
import { updateUserData } from '../../store/userSlice'
import { useToast } from '../../constants/context/ErrorContext'

type ZipGameScreenProps = {
  navigation?: { goBack: () => void }
}

export const ZipGameScreen = React.memo(({ navigation }: ZipGameScreenProps) => {
  const insets = useSafeAreaInsets()
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const user = useSelector(state => state.user)
  const [boardAreaWidth, setBoardAreaWidth] = useState(0)
  const [collectingReward, setCollectingReward] = useState(false)
  const {
    gameState,
    rewardScore,
    totalScore,
    canAdvanceLevel,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleUndo,
    handleHint,
    handleReset,
    handleCollectReward,
    handleNextLevel,
  } = useZipGame()

  const handleCollectZipReward = async () => {
    if (collectingReward || rewardScore <= 0) return
    setCollectingReward(true)

    try {
      const response = await api.post('/game/zip-game', {
        aura: rewardScore,
        level: gameState.level.id,
      })

      if (response?.data?.success) {
        handleCollectReward()
        dispatch(
          updateUserData({
            aura: (user?.userData?.aura || 0) + rewardScore,
          })
        )
        showToast(`You claimed ${rewardScore} points.`, 'success')
      }
    } catch (err) {
      console.log('Claim reward error:', err?.response?.data || err.message)
      showToast('Failed to Claim Aura, Try again', 'error')
    } finally {
      setCollectingReward(false)
    }
  }

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
              {gameState.level.id < totalLevels() && canAdvanceLevel ? (
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
              ) : gameState.level.id < totalLevels() ? (
                <Text style={{
                  fontSize: 15,
                  color: '#F5F5DC',
                  fontWeight: '600',
                }}>
                  {rewardScore > 0
                    ? 'Collect your reward in the game UI to unlock the next level.'
                    : 'Come back tomorrow to unlock the next level.'}
                </Text>
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
      {rewardScore > 0 && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 12,
            padding: 14,
            borderRadius: 16,
            backgroundColor: COLORS.MESSAGE_BG,
            borderWidth: 1,
            borderColor: 'rgba(245,245,220,0.18)',
          }}
        >
          <Text style={{
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '700',
            marginBottom: 6,
          }}>
            Total Score: {totalScore}
          </Text>
          <Text style={{
            color: '#F5F5DC',
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 10,
          }}>
            Reward Ready: +{rewardScore}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={collectingReward}
            onPress={handleCollectZipReward}
            style={{
              backgroundColor: collectingReward ? '#94A3B8' : '#22C55E',
              paddingHorizontal: 22,
              paddingVertical: 12,
              borderRadius: 24,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ fontWeight: '700', color: '#000' }}>
              {collectingReward ? 'COLLECTING...' : 'COLLECT REWARD'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ZipControls
        onUndo={handleUndo}
        onHint={handleHint}
        canUndo={gameState.currentPath.length > 1}
      />

      <ZipHintMessage message={gameState.hintMessage} />

      <ZipHowToPlay />
    </View>
  )
})
ZipGameScreen.displayName = 'ZipGameScreen'




