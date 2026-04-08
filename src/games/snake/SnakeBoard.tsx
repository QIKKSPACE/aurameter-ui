import React, { memo, useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import AppText from "../../components/AppText";
import type { Food, Obstacle, Point, SnakeSegment } from "./SnakeTypes";
import { GAME_CONFIG } from "./GameConfig";

type SnakeBoardProps = {
  snake: SnakeSegment[];
  food: Food;
  obstacles: Obstacle[];
  boardSize: number;
  gridSize: number;
  countdownText: string | null;
  isPaused: boolean;
  foodPulseToken: number;
  collisionToken: number;
  lastEatenPosition: Point | null;
  theme: any;
  styles: ReturnType<typeof import("./SnakeStyles").createSnakeStyles>;
};

type CellProps = {
  point: Point;
  cellSize: number;
  color: string;
  glow: string;
  isHead?: boolean;
};

const SegmentCell = memo(({ point, cellSize, color, glow, isHead }: CellProps) => {
  const left = useSharedValue(point.x * cellSize);
  const top = useSharedValue(point.y * cellSize);

  useEffect(() => {
    left.value = withTiming(point.x * cellSize, {
      duration: GAME_CONFIG.SEGMENT_ANIMATION_DURATION,
      easing: Easing.linear,
    });
    top.value = withTiming(point.y * cellSize, {
      duration: GAME_CONFIG.SEGMENT_ANIMATION_DURATION,
      easing: Easing.linear,
    });
  }, [cellSize, left, point.x, point.y, top]);

  const animatedStyle = useAnimatedStyle(() => ({
    left: left.value,
    top: top.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: cellSize - 2,
          height: cellSize - 2,
          borderRadius: isHead ? cellSize * GAME_CONFIG.SNAKE_HEAD_BORDER_RADIUS_MULTIPLIER : cellSize * GAME_CONFIG.SNAKE_BODY_BORDER_RADIUS_MULTIPLIER,
          backgroundColor: color,
          shadowColor: glow,
          shadowOpacity: isHead ? GAME_CONFIG.SNAKE_HEAD_SHADOW_OPACITY : GAME_CONFIG.SNAKE_BODY_SHADOW_OPACITY,
          shadowRadius: isHead ? GAME_CONFIG.SNAKE_HEAD_SHADOW_RADIUS : GAME_CONFIG.SNAKE_BODY_SHADOW_RADIUS,
          shadowOffset: { width: 0, height: 0 },
        },
        animatedStyle,
      ]}
    />
  );
});

const FoodCell = memo(
  ({ food, cellSize, theme }: { food: Food; cellSize: number; theme: any }) => {
    const pulse = useSharedValue(1);

    useEffect(() => {
      pulse.value = withRepeat(
        withSequence(
          withTiming(GAME_CONFIG.FOOD_PULSE_ANIMATION.scaleUp, { duration: GAME_CONFIG.FOOD_PULSE_ANIMATION.duration / 2 }),
          withTiming(GAME_CONFIG.FOOD_PULSE_ANIMATION.scaleDown, { duration: GAME_CONFIG.FOOD_PULSE_ANIMATION.duration / 2 }),
        ),
        GAME_CONFIG.FOOD_PULSE_ANIMATION.repeatCount,
        true,
      );
    }, [pulse]);

    const backgroundColor =
      food.kind === "golden"
        ? GAME_CONFIG.FOOD_COLORS.golden.color
        : food.kind === "speed"
          ? GAME_CONFIG.FOOD_COLORS.speed.color
          : food.kind === "shield"
            ? GAME_CONFIG.FOOD_COLORS.shield.color
            : food.kind === "red_apple"
              ? GAME_CONFIG.FOOD_COLORS.red_apple.color
              : theme.text.accent;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulse.value }],
    }));

    return (
      <Animated.View
        style={[
          {
            position: "absolute",
            left: food.position.x * cellSize + cellSize * GAME_CONFIG.FOOD_OFFSET_MULTIPLIER,
            top: food.position.y * cellSize + cellSize * GAME_CONFIG.FOOD_OFFSET_MULTIPLIER,
            width: cellSize * GAME_CONFIG.FOOD_SIZE_MULTIPLIER,
            height: cellSize * GAME_CONFIG.FOOD_SIZE_MULTIPLIER,
            borderRadius: cellSize * GAME_CONFIG.FOOD_BORDER_RADIUS_MULTIPLIER,
            backgroundColor,
            shadowColor: backgroundColor,
            shadowOpacity: GAME_CONFIG.FOOD_SHADOW_OPACITY,
            shadowRadius: GAME_CONFIG.FOOD_SHADOW_RADIUS,
            shadowOffset: { width: 0, height: 0 },
          },
          animatedStyle,
        ]}
      />
    );
  },
);

const ObstacleCell = memo(
  ({
    obstacle,
    cellSize,
    theme,
  }: {
    obstacle: Obstacle;
    cellSize: number;
    theme: any;
  }) => {
    return (
      <View
        style={{
          position: "absolute",
          left: obstacle.x * cellSize + 1,
          top: obstacle.y * cellSize + 1,
          width: obstacle.width * cellSize - 2,
          height: obstacle.height * cellSize - 2,
          backgroundColor: "#444444",
          borderWidth: 2,
          borderColor: "#777777",
          shadowColor: "#000000",
          shadowOpacity: 0.6,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        }}
      />
    );
  },
);

const PulseFeedback = memo(
  ({
    token,
    position,
    cellSize,
    color,
  }: {
    token: number;
    position: Point | null;
    cellSize: number;
    color: string;
  }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
      if (!position) {
        return;
      }

      scale.value = 0.5;
      opacity.value = 0.8;
      scale.value = withTiming(GAME_CONFIG.PULSE_FEEDBACK_SCALE, { duration: GAME_CONFIG.PULSE_FEEDBACK_DURATION });
      opacity.value = withTiming(0, { duration: GAME_CONFIG.PULSE_FEEDBACK_DURATION });
    }, [opacity, position, scale, token]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    }));

    if (!position) {
      return null;
    }

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: position.x * cellSize,
            top: position.y * cellSize,
            width: cellSize,
            height: cellSize,
            borderRadius: cellSize,
            borderWidth: 2,
            borderColor: color,
          },
          animatedStyle,
        ]}
      />
    );
  },
);

function SnakeBoardComponent({
  snake,
  food,
  obstacles,
  boardSize,
  gridSize,
  countdownText,
  isPaused,
  foodPulseToken,
  collisionToken,
  lastEatenPosition,
  theme,
  styles,
}: SnakeBoardProps) {
  const cellSize = boardSize / gridSize;
  const boardGlow = useSharedValue(0.2);
  const shake = useSharedValue(0);

  useEffect(() => {
    boardGlow.value = withRepeat(
      withSequence(
        withTiming(GAME_CONFIG.BOARD_GLOW_MAX, { duration: GAME_CONFIG.BOARD_GLOW_CYCLE_DURATION, easing: Easing.inOut(Easing.ease) }),
        withTiming(GAME_CONFIG.BOARD_GLOW_MIN, { duration: GAME_CONFIG.BOARD_GLOW_CYCLE_DURATION, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [boardGlow]);

  useEffect(() => {
    if (!collisionToken) {
      return;
    }

    shake.value = withSequence(
      ...GAME_CONFIG.SHAKE_SEQUENCE.map(step =>
        withTiming(step.offset, { duration: step.duration }),
      ),
    );
  }, [collisionToken, shake]);

  const shellStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
    shadowOpacity: boardGlow.value,
  }));

  // Memoize grid rendering - grid never changes after component mounts
  const gridLines = useMemo(() => {
    return Array.from({ length: gridSize - 1 }).map((_, index) => {
      const offset = (index + 1) * cellSize;
      return (
        <React.Fragment key={`grid-${index}`}>
          <View
            style={{
              position: "absolute",
              left: offset,
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: `rgba(255,255,255,${GAME_CONFIG.GRID_LINE_OPACITY})`,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: offset,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: `rgba(255,255,255,${GAME_CONFIG.GRID_LINE_OPACITY})`,
            }}
          />
        </React.Fragment>
      );
    });
  }, [gridSize, cellSize]);

  return (
    <Animated.View style={[styles.boardShell, shellStyle]}>
      <View style={styles.boardFrame}>
        {gridLines}

        <FoodCell food={food} cellSize={cellSize} theme={theme} />

        {/* Render obstacles for progressive difficulty */}
        {obstacles.map((obstacle, index) => (
          <ObstacleCell
            key={`obstacle-${index}`}
            obstacle={obstacle}
            cellSize={cellSize}
            theme={theme}
          />
        ))}

        {snake.map((segment, index) => (
          <SegmentCell
            key={`segment-${index}`}
            point={segment}
            cellSize={cellSize}
            color={index === 0 ? "#F5F5DC" : "#FFFDD0"}
            glow="#F5F5DC"
            isHead={index === 0}
          />
        ))}

        <PulseFeedback
          token={foodPulseToken}
          position={lastEatenPosition}
          cellSize={cellSize}
          color="#F5F5DC"
        />

        {(countdownText || isPaused) && (
          <View style={styles.countdownOverlay}>
            <AppText variant="h1">
              {countdownText ?? GAME_CONFIG.STRINGS.PAUSED_TEXT}
            </AppText>
          </View>
        )}

        {isPaused && !countdownText ? (
          <View style={styles.pausedBadge}>
            <AppText variant="caption">Auto-{GAME_CONFIG.STRINGS.PAUSED_TEXT.toLowerCase()}</AppText>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

export default memo(SnakeBoardComponent);
