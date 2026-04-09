/**
 * Zip Challenge Game Screen
 * Main game screen component
 */

import React, { useMemo, useState, useCallback } from "react";
import { Modal, ScrollView, TouchableOpacity, View, useWindowDimensions, AppState } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ScreenBackground from "../../components/ScreenBackground";
import AppText from "../../components/AppText";
import { useTheme } from "../../constants/context/ThemeContext";
import { createZipStyles } from "./ZipStyles";
import { zipChallenge, ZIP_STORAGE_KEY } from "./ZipTypes";
import { useZipGame } from "./useZipGame";
import { ZipBoard } from "./ZipBoard";
import { getThemeForLevel } from "./ThemeConfig";
import { getDifficultyForLevel } from "./DifficultyConfig";
import { getTotalLevels } from "./LevelConfig";
import { DIFFICULTY_COLORS } from "./GameConfig";
import LinearGradient from "react-native-linear-gradient";

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export { zipChallenge } from "./ZipTypes";

export default function ZipGameScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const [showCompletion, setShowCompletion] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false); // ✅ Prevent double-tap back

  const boardSize = useMemo(() => {
    const HEADER_HEIGHT = 100; // header + stats
    const CONTROLS_HEIGHT = 120; // controls + how-to-play
    const availableHeight = height - HEADER_HEIGHT - CONTROLS_HEIGHT - insets.top - insets.bottom - 32;
    return Math.min(width - 32, availableHeight, 360);
  }, [width, height, insets.top, insets.bottom]);
  const styles = useMemo(() => createZipStyles(theme, boardSize), [boardSize, theme]);

  const {
    gameState,
    elapsedSeconds,
    isCompleted,
    hintsUsed,
    nextHint,
    hintPath, // 💡 Multi-step hint path
    showLastNodeWarning, // ⚠️ Warning when last node reached without full grid
    initializeGame,
    handleTapCell,
    handleDragStart,
    handleDragCell,
    handleUndo,
    handleHint,
    handleReset,
    handleNextLevel,
    getFilledCells,
  } = useZipGame();

  // Debug: Log gameState changes
  // Debug effect removed for production performance

  const filledCells = useMemo(() => getFilledCells(), [gameState?.path]);
  const levelTheme = useMemo(
    () => (gameState ? getThemeForLevel(gameState.currentLevel) : null),
    [gameState?.currentLevel]
  );
  const difficulty = useMemo(
    () => (gameState ? getDifficultyForLevel(gameState.currentLevel) : "EASY"),
    [gameState?.currentLevel]
  );
  
  // ✅ CRITICAL FIX: Memoize board theme object to prevent React Fabric "static flag" error
  const boardTheme = useMemo(
    () => ({
      ...theme,
      primary: levelTheme?.primary || theme.primary,
      secondary: levelTheme?.secondary || theme.secondary,
    }),
    [theme, levelTheme]
  );

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGoBack = useCallback(() => {
    if (isNavigating) return; // ✅ CRITICAL: Prevent rapid back-button taps
    setIsNavigating(true);
    navigation.goBack();
  }, [isNavigating, navigation]);

  // Handle completion modal
  React.useEffect(() => {
    if (isCompleted && gameState && !showCompletion) {
      setShowCompletion(true);
    }
  }, [isCompleted, gameState, showCompletion]);

  return (
    <ScreenBackground>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background.color }]}>
        <ScrollView
          style={[styles.container, { backgroundColor: theme.background.color }]}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          decelerationRate={0.9}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleGoBack}
            >
              <Icon name="arrow-left" size={24} color={theme.text.primary} />
            </TouchableOpacity>

            <AppText variant="h4" style={styles.headerTitle}>
              {zipChallenge.title}
            </AppText>

            <View style={styles.headerButton} />
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <AppText style={styles.statLabel}>Level</AppText>
              <AppText style={styles.statValue}>
                {gameState?.currentLevel || 0} / {getTotalLevels()}
              </AppText>
            </View>

            <View style={styles.statItem}>
              <AppText style={styles.statLabel}>Time</AppText>
              <AppText style={styles.statValue}>{formatTime(elapsedSeconds)}</AppText>
            </View>

            <View style={styles.statItem}>
              <AppText style={styles.statLabel}>Difficulty</AppText>
              <AppText
                style={[
                  styles.statValue,
                  {
                    color: DIFFICULTY_COLORS[difficulty],
                  },
                ]}
              >
                {difficulty}
              </AppText>
            </View>

            <View style={styles.statItem}>
              <AppText style={styles.statLabel}>Hints</AppText>
              <AppText style={styles.statValue}>
                {gameState ? gameState.hintsRemaining : 0}
              </AppText>
            </View>
          </View>

          {/* Board */}
          <View 
            style={styles.boardContainer}
            pointerEvents="box-only"
          >
            {levelTheme && (
              <LinearGradient
                colors={[levelTheme.primary, levelTheme.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.board,
                  {
                    width: boardSize,
                    height: boardSize,
                    opacity: 0.1,
                    position: "absolute",
                  },
                ]}
              />
            )}

            <ZipBoard
              gameState={gameState}
              boardSize={boardSize}
              onCellTap={handleTapCell}
              onDragStart={handleDragStart}
              onDragCell={handleDragCell}
              nextHint={nextHint}
              hintPath={hintPath} // 💡 Pass multi-step hint path
              filledCells={filledCells}
              theme={boardTheme}
              showLastNodeWarning={showLastNodeWarning} // ⚠️ Pass warning flag
            />
          </View>

          {/* Controls */}
          <View style={[styles.controlsRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                gameState?.path.length === 0 && styles.controlButtonDisabled,
              ]}
              onPress={handleUndo}
              disabled={gameState?.path.length === 0}
            >
              <Icon name="undo" size={16} color={theme.text.primary} />
              <AppText style={styles.controlButtonText}>Undo</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                gameState?.hintsRemaining === 0 && styles.controlButtonDisabled,
              ]}
              onPress={handleHint}
              disabled={gameState?.hintsRemaining === 0}
            >
              <Icon name="lightbulb" size={16} color={theme.text.primary} />
              <AppText style={styles.controlButtonText}>Hint</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
              <Icon name="restart" size={16} color={theme.text.primary} />
              <AppText style={styles.controlButtonText}>Reset</AppText>
            </TouchableOpacity>
          </View>

          {/* How to Play */}
          <TouchableOpacity
            style={styles.hintSection}
            onPress={() => setShowHowToPlay(!showHowToPlay)}
          >
            <View style={styles.howToPlayHeader}>
              <AppText style={styles.howToPlayTitle}>How to Play</AppText>
              <Icon
                name={showHowToPlay ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.text.primary}
              />
            </View>

            {showHowToPlay && (
              <View style={styles.howToPlayContent}>
                <View style={styles.howToPlayStep}>
                  <View style={styles.stepNumber}>
                    <AppText style={styles.stepNumberText}>1</AppText>
                  </View>
                  <AppText style={styles.stepText}>
                    Connect the numbered dots in sequence (1 → 2 → 3 → ...)
                  </AppText>
                </View>

                <View style={styles.howToPlayStep}>
                  <View style={styles.stepNumber}>
                    <AppText style={styles.stepNumberText}>2</AppText>
                  </View>
                  <AppText style={styles.stepText}>
                    Your path must fill every cell in the grid
                  </AppText>
                </View>

                <View style={styles.howToPlayStep}>
                  <View style={styles.stepNumber}>
                    <AppText style={styles.stepNumberText}>3</AppText>
                  </View>
                  <AppText style={styles.stepText}>
                    You can only move to adjacent cells (up, down, left, right)
                  </AppText>
                </View>

                <View style={styles.howToPlayStep}>
                  <View style={styles.stepNumber}>
                    <AppText style={styles.stepNumberText}>4</AppText>
                  </View>
                  <AppText style={styles.stepText}>
                    Your path cannot overlap itself
                  </AppText>
                </View>

                <View style={styles.howToPlayStep}>
                  <View style={styles.stepNumber}>
                    <AppText style={styles.stepNumberText}>5</AppText>
                  </View>
                  <AppText style={styles.stepText}>
                    Use hints when stuck, and undo moves to try a new strategy
                  </AppText>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Completion Modal */}
        <Modal
          visible={showCompletion}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowCompletion(false);
          }}
        >
          <View style={styles.completionModal}>
            <View style={styles.completionContent}>
              <LinearGradient
                colors={[levelTheme?.primary || theme.primary, levelTheme?.secondary || theme.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.dummyBox,
                  {
                    borderRadius: 8,
                  },
                ]}
              />

              <AppText style={styles.completionTitle}>Level Complete! 🎉</AppText>

              <AppText style={styles.completionText}>
                Time: {formatTime(elapsedSeconds)} • Hints: {hintsUsed}
              </AppText>

              <View style={styles.completionButtons}>
                <TouchableOpacity
                  style={[
                    styles.completionButton,
                    {
                      backgroundColor: theme.text.secondary + "20",
                      borderWidth: 1.5,
                      borderColor: theme.text.secondary,
                    },
                  ]}
                  onPress={() => {
                    setShowCompletion(false);
                    handleReset();
                  }}
                >
                  <AppText style={{ color: theme.text.primary, fontWeight: "600" }}>
                    Retry
                  </AppText>
                </TouchableOpacity>

                {gameState && gameState.currentLevel < getTotalLevels() && (
                  <TouchableOpacity
                    style={[
                      styles.completionButton,
                      {
                        backgroundColor: levelTheme?.primary || theme.primary,
                      },
                    ]}
                    onPress={() => {
                      setShowCompletion(false);
                      handleNextLevel();
                    }}
                  >
                    <AppText
                      style={{
                        color: "#fff",
                        fontWeight: "600",
                      }}
                    >
                      Next →
                    </AppText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ScreenBackground>
  );
}
