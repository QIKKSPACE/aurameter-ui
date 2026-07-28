import React, { useMemo, useState, useRef } from "react";
import { TouchableOpacity, View, Modal, PanResponder, StatusBar, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AppText from "../../components/AppText";
import { useTheme } from "../../constants/context/ThemeContext";
import SnakeBoard from "./SnakeBoard";
import SnakeControls from "./SnakeControls";
import { createSnakeStyles } from "./SnakeStyles";
import { snakeChallenge } from "./SnakeTypes";
import { useSnakeGame } from "./useSnakeGame";
import { GAME_CONFIG } from "./GameConfig";
import { useToast } from "../../constants/context/ErrorContext";
import { useDispatch, useSelector } from "react-redux";
import api from "../../services/api";
import { updateUserData } from "../../store/userSlice";

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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Fixed heights for each section (in dp)
  const HEADER_HEIGHT = 52;
  const STATS_HEIGHT = 44;
  const DIFFICULTY_HEIGHT = 28;
  const SPEED_SELECTOR_HEIGHT = 72;
  const BOOST_HEIGHT = 52;
  const PADDING = 8;

  // Pre-calculate initial board size to avoid flicker on first render
  const initialBoardSize = Math.max(
    Math.floor(
      Math.min(
        screenWidth,
        screenHeight
          - (insets.top + insets.bottom)
          - HEADER_HEIGHT
          - STATS_HEIGHT
          - DIFFICULTY_HEIGHT
          - SPEED_SELECTOR_HEIGHT
          - BOOST_HEIGHT
      ) - PADDING * 2
    ),
    0
  );

  const [boardContainerSize, setBoardContainerSize] = useState(initialBoardSize);

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
    selectedSpeedPresetId,
    setSelectedSpeedPresetId,
    speedPresets,
    restartGame,
    resumeGame,
    score,
    setDirection,
    shieldCharges,
    snake,
    speedMultiplier,
    togglePause,
  } = useSnakeGame();

  const styles = useMemo(() => createSnakeStyles(theme, boardContainerSize), [boardContainerSize, theme]);
  const canChangeSpeed = !!countdownText || isPaused || gameOver;

  // ═══════════════════════════════════════════════════════════
  // GESTURE SYSTEM — attached to OUTERMOST View
  // This is the PRIMARY gesture handler at screen level
  // Refs for always-current handler functions
  // ═══════════════════════════════════════════════════════════
  const gestureStartRef = useRef({ x: 0, y: 0 });
  const [isNavigating, setIsNavigating] = useState(false);
  const setDirectionRef = useRef(setDirection);
  const handleBoostRef = useRef(handleMultipleTaps);
  const countdownTextRef = useRef(countdownText);
  const isPausedRef = useRef(isPaused);
  const gameOverRef = useRef(gameOver);
  
  // Update refs on every render to always have latest functions
  setDirectionRef.current = setDirection;
  handleBoostRef.current = handleMultipleTaps;
  countdownTextRef.current = countdownText;
  isPausedRef.current = isPaused;
  gameOverRef.current = gameOver;

  const panResponderRef = useRef<any>(null);
  if (panResponderRef.current === null) {
    panResponderRef.current = PanResponder.create({
      // Do NOT claim initial touch — let header buttons respond to taps
      onStartShouldSetPanResponder: () => false,
      // Only claim deliberate swipe gestures; tiny taps should stay with buttons
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (countdownTextRef.current || isPausedRef.current || gameOverRef.current) {
          return false;
        }

        return (
          Math.abs(gestureState.dx) >= GAME_CONFIG.SWIPE_THRESHOLD ||
          Math.abs(gestureState.dy) >= GAME_CONFIG.SWIPE_THRESHOLD
        );
      },
      onShouldBlockNativeResponder: () => true,
      // Do NOT release the touch to anything else
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (evt) => {
        gestureStartRef.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        };
      },

      onPanResponderRelease: (_, gs) => {
        if (countdownTextRef.current || isPausedRef.current || gameOverRef.current) {
          return;
        }

        const absX = Math.abs(gs.dx);
        const absY = Math.abs(gs.dy);

        if (
          absX < GAME_CONFIG.SWIPE_THRESHOLD &&
          absY < GAME_CONFIG.SWIPE_THRESHOLD
        ) {
          return;
        }

        // Swipe direction (boost is handled by TouchableOpacity, not here)
        if (absX >= absY) {
          setDirectionRef.current(gs.dx > 0 ? "RIGHT" : "LEFT");
        } else {
          setDirectionRef.current(gs.dy > 0 ? "DOWN" : "UP");
        }
      },

      onPanResponderTerminate: (_, gs) => {
        if (countdownTextRef.current || isPausedRef.current || gameOverRef.current) {
          return;
        }

        // Handle even if terminated
        const absX = Math.abs(gs.dx);
        const absY = Math.abs(gs.dy);
        if (
          absX < GAME_CONFIG.SWIPE_THRESHOLD &&
          absY < GAME_CONFIG.SWIPE_THRESHOLD
        ) {
          return;
        }
        if (absX >= absY) {
          setDirectionRef.current(gs.dx > 0 ? "RIGHT" : "LEFT");
        } else {
          setDirectionRef.current(gs.dy > 0 ? "DOWN" : "UP");
        }
      },
    });
  }

  const handleGoBack = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    navigation.goBack();
  };
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const user=useSelector(state=>state.user)
 const [claimingReward, setClaimingReward] = useState(false);
  
  const collectScore = async() => {
    setClaimingReward(true);
    
    if(score<=0) {
      setClaimingReward(false);
      restartGame()
       return;
    }


    
      try {
        const response = await api.post(
          '/game/snake-game',
          {
            aura: score,
          },
        );
    
        if (response?.data?.success) {
          
          dispatch(
        updateUserData({
          aura:
            (user?.userData?.aura || 0) + score,  
        })
      );
    showToast( `You claimed ${score} points.`, "success");

      setClaimingReward(false);
    restartGame()

    
        }
      } catch (err) {
      setClaimingReward(false);
    restartGame()
    
        console.error(
          'Claim reward error:',
          err?.response?.data || err.message,
        );
    showToast("Failed to Claim  Aura, Try again", "error");
      }
    
  }
  return (
    // OUTERMOST VIEW — has panHandlers
    // This is the FIRST view in the component tree
    <View
      style={{ flex: 1, backgroundColor: theme.background.color }}
      {...panResponderRef.current.panHandlers}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.background.color} />

      <View
        style={{
          flex: 1,
          backgroundColor: theme.background.color,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        {/* HEADER */}
          <View
            style={{
              height: HEADER_HEIGHT,
              paddingHorizontal: PADDING,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={handleGoBack}
              style={{ width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: theme.components.card, borderWidth: 1, borderColor: theme.components.border }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="arrow-left" size={20} color={theme.text.primary} />
            </TouchableOpacity>

            <AppText variant="h4" style={{ fontSize: 18 }}>
              {snakeChallenge.title}
            </AppText>

            <TouchableOpacity
              onPress={isPaused ? resumeGame : togglePause}
              style={{ width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: theme.components.card, borderWidth: 1, borderColor: theme.components.border }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name={isPaused ? "play" : "pause"} size={18} color={theme.text.primary} />
            </TouchableOpacity>
          </View>

          {/* STATS ROW */}
          <View
            style={{
              height: STATS_HEIGHT,
              paddingHorizontal: PADDING,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <AppText variant="caption" style={{ color: theme.text.secondary, fontSize: 11 }}>
                Score
              </AppText>
              <AppText variant="h4" style={{ fontSize: 16, color: "#F5F5DC" }}>
                {score}
              </AppText>
            </View>
            <View>
              <AppText variant="caption" style={{ color: theme.text.secondary, fontSize: 11 }}>
                High
              </AppText>
              <AppText variant="h4" style={{ fontSize: 14, color: theme.text.secondary }}>
                {highScore}
              </AppText>
            </View>
            <View style={{ alignItems: "center" }}>
              <AppText variant="caption" style={{ color: theme.text.secondary, fontSize: 11 }}>
                x{multiplier}
              </AppText>
            </View>
            <View style={{ alignItems: "center" }}>
              <AppText variant="caption" style={{ color: theme.text.secondary, fontSize: 11 }}>
                🛡️
              </AppText>
              <AppText variant="body" style={{ fontSize: 14, color: theme.text.primary }}>
                {shieldCharges}
              </AppText>
            </View>
            <View style={{ alignItems: "center", paddingRight: 4 }}>
              <AppText variant="caption" style={{ color: theme.text.secondary, fontSize: 11 }}>
                Speed
              </AppText>
              <AppText variant="body" style={{ fontSize: 14, color: "#F5F5DC", fontWeight: "bold" }}>
                {speedMultiplier}x
              </AppText>
            </View>
          </View>

          {/* DIFFICULTY LABEL */}
          <View
            style={{
              height: DIFFICULTY_HEIGHT,
              paddingHorizontal: PADDING,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AppText variant="caption" style={{ color: theme.text.secondary, fontSize: 13, fontWeight: "bold" }}>
              {currentTier.toUpperCase()}
            </AppText>
          </View>

          <View style={{ paddingHorizontal: PADDING, marginTop: 2 }}>
            <AppText variant="caption" style={{ color: theme.text.secondary, fontSize: 11, textAlign: "center" }}>
              {GAME_CONFIG.STRINGS.SPEED_SELECT_LABEL}
            </AppText>
            <View style={styles.speedRow}>
              {speedPresets.map(preset => {
                const selected = preset.id === selectedSpeedPresetId;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    disabled={!canChangeSpeed}
                    onPress={() => setSelectedSpeedPresetId(preset.id)}
                    style={{
                      marginHorizontal: 4,
                      marginTop: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                      backgroundColor: selected ? theme.text.accent : theme.components.box,
                      opacity: canChangeSpeed ? 1 : 0.55,
                      borderWidth: 1,
                      borderColor: selected ? theme.text.accent : theme.components.border,
                    }}
                  >
                    <AppText
                      variant="caption"
                      style={{
                        color: selected ? "#121212" : theme.text.primary,
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      {preset.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* BOARD AREA — flex:1, pointerEvents="box-none" */}
          {/* The board PASSES all touches to parent PanResponder */}
          <View
            style={{ flex: 1, padding: PADDING, alignItems: "center", justifyContent: "center" }}
            pointerEvents="box-none"
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              const size = Math.floor(Math.min(width, height) - PADDING * 2);
              if (size > 0 && size !== boardContainerSize) {
                setBoardContainerSize(size);
              }
            }}
          >
            {boardContainerSize > 0 && (
              <SnakeBoard
                boardSize={boardContainerSize}
                snake={snake}
                food={food}
                obstacles={obstacles}
                gridSize={gridSize}
                countdownText={countdownText}
                isPaused={isPaused}
                foodPulseToken={foodPulseToken}
                collisionToken={collisionToken}
                lastEatenPosition={lastEatenPosition}
                theme={theme}
                styles={styles}
              />
            )}
          </View>

          {/* BOOST BUTTON */}
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => handleBoostRef.current()}
            style={{
              height: BOOST_HEIGHT,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: PADDING,
              width: "100%",
            }}
          >
            <SnakeControls onSpeedBoost={handleMultipleTaps} styles={styles} theme={theme} />
          </TouchableOpacity>
      </View>

      {/* Game Over Modal */}
      <Modal visible={gameOver} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: theme.background.color,
              borderRadius: 16,
              padding: 24,
              width: "80%",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#F5F5DC",
            }}
          >
            <AppText variant="h2" style={{ fontSize: 32, marginBottom: 16, color: theme.text.primary }}>
              Game Over
            </AppText>

            <View style={{ width: "100%", marginBottom: 20 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <AppText variant="body" style={{ fontSize: 16, color: theme.text.secondary }}>
                  Final Score:
                </AppText>
                <AppText variant="body" style={{ fontSize: 20, fontWeight: "bold", color: "#F5F5DC" }}>
                  {score}
                </AppText>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <AppText variant="body" style={{ fontSize: 16, color: theme.text.secondary }}>
                  High Score:
                </AppText>
                <AppText variant="body" style={{ fontSize: 20, fontWeight: "bold", color: "#F5F5DC" }}>
                  {highScore}
                </AppText>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <AppText variant="body" style={{ fontSize: 16, color: theme.text.secondary }}>
                  Tier:
                </AppText>
                <AppText variant="body" style={{ fontSize: 16, fontWeight: "bold", color: "#F5F5DC" }}>
                  {currentTier}
                </AppText>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <AppText variant="body" style={{ fontSize: 16, color: theme.text.secondary }}>
                  Multiplier:
                </AppText>
                <AppText variant="body" style={{ fontSize: 16, fontWeight: "bold", color: "#F5F5DC" }}>
                  x{multiplier}
                </AppText>
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
                <AppText variant="button" style={{ fontSize: 12, fontWeight: "bold", color: theme.text.primary }}>
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
                <AppText variant="button" style={{ fontSize: 12 , fontWeight: "bold", color: "#121212" }}>
                  Replay
                </AppText>
              </TouchableOpacity>
                              <TouchableOpacity
                              disabled={claimingReward}
                onPress={collectScore}
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: "#F5F5DC",
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <AppText variant="button" style={{ fontSize: 12 , fontWeight: "bold", color: "#121212" }}>
                  {claimingReward ? "Claiming..." : "Reward"}  
                </AppText>

              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
