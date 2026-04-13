import React, { useCallback, useMemo } from 'react'
import { View, useWindowDimensions, SafeAreaView } from 'react-native'
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

export default function MathMazeGameScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()

  const {
    gameState,
    isDragging,
    handleCellDragStart,
    handleCellDragEnter,
    handleDragEnd,
    handleUndo,
    handleClear,
    handleRedo,
    handleNextRound,
    highScore,
    handleRestart,
  } = useMathMaze(3)

  const canUndo = useMemo(
    () => gameState.currentPath.length > 1,
    [gameState.currentPath.length]
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MathMazeColors.SCREEN_BG }}>
      <View style={{ flex: 1, backgroundColor: MathMazeColors.SCREEN_BG }}>
        <MathMazeHeader
          playerName="You"
          playerScore={gameState.playerScore}
          timeRemaining={gameState.timeRemaining}
          onTimerPress={() => {}}
        />

        <MathMazeTarget
          target={gameState.puzzle.target}
          currentResult={gameState.currentResult}
          pathStatus={gameState.pathStatus}
        />

        <View style={{ flex: 1 }}>
          <MathMazeBoard
            puzzle={gameState.puzzle}
            currentPath={gameState.currentPath}
            pathStatus={gameState.pathStatus}
            screenWidth={width}
            screenHeight={height}
            onDragStart={handleCellDragStart}
            onDragEnter={handleCellDragEnter}
            onDragEnd={handleDragEnd}
          />
        </View>

        <MathMazeActionBar
          onUndo={handleUndo}
          onClear={handleClear}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={false}
        />

        <MathMazeOverlay
          visible={gameState.isGameOver}
          finalScore={gameState.playerScore}
          highScore={highScore}
          onRestart={handleRestart}
        />
      </View>
    </SafeAreaView>
  )
}
