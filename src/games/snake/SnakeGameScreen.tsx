import React, { useMemo } from "react";
import { TouchableOpacity, View, useWindowDimensions, Modal } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ScreenBackground from "../../components/ScreenBackground";
import AppText from "../../components/AppText";
import { useTheme } from "../../constants/context/ThemeContext";
import SnakeBoard from "./SnakeBoard";
import SnakeControls from "./SnakeControls";
import { createSnakeStyles } from "./SnakeStyles";
import { snakeChallenge } from "./SnakeTypes";
import { useSnakeGame } from "./useSnakeGame";
import { GAME_CONFIG } from "./GameConfig";
import { DIFFICULTY_TIERS } from "./DifficultyConfig";

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export { snakeChallenge } from "./SnakeTypes";
export { submitSnakeScore } from "./useSnakeGame";

export default function SnakeGameScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const [isNavigating, setIsNavigating] = React.useState(false); // ✅ Prevent double-tap back
  
  const boardSize = useMemo(() => {
    const HEADER_HEIGHT = 160; // header + score display + tier
    const CONTROLS_HEIGHT = 280; // d-pad + margins
    const SAFE_BOTTOM = insets.bottom;
    const availableHeight = height - HEADER_HEIGHT - CONTROLS_HEIGHT - SAFE_BOTTOM - 32;
    const maxByWidth = width - GAME_CONFIG.CONTAINER_PADDING_HORIZONTAL * 2;
    const maxByHeight = availableHeight;
    return Math.min(maxByWidth, maxByHeight, 360);
  }, [width, height, insets.bottom]);
  const styles = useMemo(() => createSnakeStyles(theme, boardSize), [boardSize, theme]);
  const {
    collisionToken,
    countdownText,
    currentTier,
    food,
    foodPulseToken,
    gameOver,
    gridSize,
    handleMultipleTaps,
    highScore,
    isPaused,
    lastEatenPosition,
    multiplier,
    obstacles,
    progressToNextSpeed,
    restartGame,
    resumeGame,
    score,
    setDirection,
    shieldCharges,
    snake,
    speedMultiplier,
    streak,
    togglePause,
  } = useSnakeGame();

  const handleGoBack = () => {
    if (isNavigating) return; // ✅ CRITICAL: Prevent rapid back-button taps
    setIsNavigating(true);
    navigation.goBack();
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background.color }]}>
        <View style={[styles.container, { paddingVertical: 6 }]}>
          {/* Minimal Header */}
          <View style={[styles.headerRow, { marginBottom: 8 }]}>
            <TouchableOpacity style={[styles.closeButton, { width: 32, height: 32 }]} onPress={handleGoBack}>
              <Icon name="arrow-left" size={20} color={theme.text.primary} />
            </TouchableOpacity>

            <View style={{ alignItems: "center", flex: 1 }}>
              <AppText variant="h4" style={{ fontSize: 18 }}>{snakeChallenge.title}</AppText>
            </View>

            <TouchableOpacity style={[styles.closeButton, { width: 32, height: 32 }]} onPress={isPaused ? resumeGame : togglePause}>
              <Icon
                name={isPaused ? "play" : "pause"}
                size={18}
                color={theme.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Compact Score Display */}
          <View style={{ marginBottom: 10, paddingHorizontal: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <AppText variant="caption" style={{ color: theme.text.secondary, fontSize: 12 }}>Score</AppText>
                <AppText variant="h4" style={{ fontSize: 20, color: "#F5F5DC" }}>{score}</AppText>
              </View>
              <View style={{ alignItems: "center" }}>
                <AppText variant="caption" style={{ color: theme.text.secondary, fontSize: 12 }}>High</AppText>
                <AppText variant="h4" style={{ fontSize: 18, color: theme.text.secondary }}>{highScore}</AppText>
              </View>
              <View style={{ alignItems: "center" }}>
                <AppText variant="caption" style={{ color: theme.text.secondary, fontSize: 12 }}>x{multiplier}</AppText>
              </View>
              <View style={{ alignItems: "center" }}>
                <AppText variant="caption" style={{ color: theme.text.secondary, fontSize: 12 }}>🛡️</AppText>
                <AppText variant="body" style={{ fontSize: 16, color: theme.text.primary }}>{shieldCharges}</AppText>
              </View>
              <View style={{ alignItems: "center", paddingRight: 4 }}>
                <AppText variant="caption" style={{ color: theme.text.secondary, fontSize: 12 }}>Speed</AppText>
                <AppText variant="body" style={{ fontSize: 16, color: "#F5F5DC", fontWeight: "bold" }}>{speedMultiplier}x</AppText>
              </View>
            </View>
          </View>

          {/* Difficulty Tier Display */}
          <View style={{ marginBottom: 8, paddingHorizontal: 12, alignItems: "center" }}>
            <AppText variant="caption" style={{ color: theme.text.secondary, fontSize: 14, fontWeight: "bold" }}>
              {currentTier.toUpperCase()}
            </AppText>
          </View>

          {/* Game Board */}
          <SnakeBoard
            snake={snake}
            food={food}
            obstacles={obstacles}
            boardSize={boardSize - GAME_CONFIG.BOARD_PADDING * 2}
            gridSize={gridSize}
            countdownText={countdownText}
            isPaused={isPaused}
            foodPulseToken={foodPulseToken}
            collisionToken={collisionToken}
            lastEatenPosition={lastEatenPosition}
            theme={theme}
            styles={styles}
          />

          {/* Controls */}
          <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
            <SnakeControls 
              onDirectionChange={setDirection} 
              onSpeedBoost={handleMultipleTaps}
              styles={styles} 
              theme={theme} 
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Game Over Modal */}
      <Modal visible={gameOver} transparent animationType="fade">
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <View style={{
            backgroundColor: theme.background.color,
            borderRadius: 16,
            padding: 24,
            width: "80%",
            alignItems: "center",
            borderWidth: 2,
            borderColor: "#F5F5DC",
          }}>
            <AppText variant="h2" style={{ fontSize: 32, marginBottom: 16, color: theme.text.primary }}>
              Game Over
            </AppText>

            <View style={{ width: "100%", marginBottom: 20 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <AppText variant="body" style={{ fontSize: 16, color: theme.text.secondary }}>Final Score:</AppText>
                <AppText variant="body" style={{ fontSize: 20, fontWeight: "bold", color: "#F5F5DC" }}>{score}</AppText>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <AppText variant="body" style={{ fontSize: 16, color: theme.text.secondary }}>High Score:</AppText>
                <AppText variant="body" style={{ fontSize: 20, fontWeight: "bold", color: "#F5F5DC" }}>{highScore}</AppText>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <AppText variant="body" style={{ fontSize: 16, color: theme.text.secondary }}>Tier:</AppText>
                <AppText variant="body" style={{ fontSize: 16, fontWeight: "bold", color: "#F5F5DC" }}>{currentTier}</AppText>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <AppText variant="body" style={{ fontSize: 16, color: theme.text.secondary }}>Multiplier:</AppText>
                <AppText variant="body" style={{ fontSize: 16, fontWeight: "bold", color: "#F5F5DC" }}>x{multiplier}</AppText>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: theme.components.box,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <AppText variant="button" style={{ fontSize: 16, fontWeight: "bold", color: theme.text.primary }}>
                  Exit
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={restartGame}
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: "#F5F5DC",
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <AppText variant="button" style={{ fontSize: 16, fontWeight: "bold", color: "#121212" }}>
                  Replay
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
}
