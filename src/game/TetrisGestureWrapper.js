import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { SoundManager } from "../audio/SoundManager";
import { GameHaptics } from "../utils/haptics";
import TetrisRenderer from "./TetrisRenderer";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  createEmptyBoard,
  createNewPiece,
  getFullLineIndexes,
  hardDropPiece,
  hasCollision,
  mergePiece,
  movePiece as engineMovePiece,
  removeLines,
  resetPiecePosition,
  rotatePiece as engineRotatePiece,
  softDropPiece,
  spawnPiece,
} from "./tetrisEngine";
import {
  clearLines,
  gameOver,
  pauseGame,
  resumeGame,
  setBoard,
  setCurrentPiece,
  setNextPiece,
  startGame,
  resetScore
} from "../store/tetrisGameSlice";
import { useToast } from "../constants/context/ErrorContext";
import { updateUserData } from "../store/userSlice";
import api from "../services/api";

const DAS_DELAY = 135;
const ARR_INTERVAL = 38;
const SOFT_DROP_INTERVAL = 42;
const CLEAR_ANIMATION_MS = 360;
const SWIPE_STEP_COOLDOWN = 75;

const selectTetrisHud = state => ({
  status: state.tetrisGame.status,
  score: state.tetrisGame.score,
  level: state.tetrisGame.level,
  linesCleared: state.tetrisGame.linesCleared,
  dropInterval: state.tetrisGame.dropInterval,
  startedAt: state.tetrisGame.startedAt,
});

const pieceLabel = (piece) => piece?.key || "-";

function MiniPiece({ piece, label }) {
  const cells = useMemo(() => {
    if (!piece) return [];
    const offsetX = Math.max(0, Math.floor((4 - piece.shape[0].length) / 2));
    const offsetY = Math.max(0, Math.floor((4 - piece.shape.length) / 2));
    const result = [];
    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) result.push({ x: x + offsetX, y: y + offsetY });
      });
    });
    return result;
  }, [piece]);

  return (
    <View style={styles.previewPanel}>
      <Text style={styles.panelLabel}>{label}</Text>
      <View style={styles.previewGrid}>
        {cells.map((cell, index) => (
          <View
            key={`${label}-${index}`}
            style={[
              styles.previewBlock,
              {
                left: cell.x * 13,
                top: cell.y * 13,
                backgroundColor: piece.color,
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.pieceKey}>{pieceLabel(piece)}</Text>
    </View>
  );
}

function HudStat({ label, value, pulse }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.06 }],
  }));

  return (
    <Animated.View style={[styles.statPill, animatedStyle]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Animated.View>
  );
}

function ControlButton({ icon, label, onPress, onPressIn, onPressOut, wide }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressIn = () => {
    scale.value = withTiming(0.94, { duration: 70 });
    onPressIn?.();
  };

  const pressOut = () => {
    scale.value = withSpring(1, { damping: 13, stiffness: 220 });
    onPressOut?.();
  };

  return (
    <Animated.View style={[wide ? styles.controlWide : styles.controlWrap, animatedStyle]}>
      <Pressable
        style={({ pressed }) => [
          styles.controlButton,
          wide && styles.controlButtonWide,
          pressed && styles.controlButtonPressed,
        ]}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        <Icon name={icon} size={wide ? 23 : 21} color="#f7fbff" />
        <Text style={styles.controlLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function ClearParticles({ trigger }) {
  const particles = useMemo(() => {
    if (!trigger) return [];
    return Array.from({ length: 26 }, (_, index) => ({
      id: `${trigger.id}-${index}`,
      x: Math.random() * trigger.boardWidth,
      y: Math.random() * 130 + trigger.y - 65,
      size: Math.random() * 4 + 3,
      dx: (Math.random() - 0.5) * 80,
      dy: (Math.random() - 0.8) * 90,
      delay: Math.random() * 80,
    }));
  }, [trigger]);

  if (!trigger) return null;

  return (
    <View pointerEvents="none" style={styles.particleLayer}>
      {particles.map(particle => (
        <Particle key={particle.id} particle={particle} />
      ))}
    </View>
  );
}

function Particle({ particle }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      particle.delay,
      withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) })
    );
  }, [particle.delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: progress.value * particle.dx },
      { translateY: progress.value * particle.dy },
      { scale: 1 - progress.value * 0.6 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
        },
        style,
      ]}
    />
  );
}

export default function TetrisGestureWrapper() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const dispatch = useDispatch();
  const {
    status,
    score,
    level,
    linesCleared,
    dropInterval,
    startedAt,
  } = useSelector(selectTetrisHud, shallowEqual);

  const [board, setBoardState] = useState(() => createEmptyBoard());
  const [currentPiece, setCurrentPieceState] = useState(null);
  const [nextPiece, setNextPieceState] = useState(() => createNewPiece());
  const [holdPiece, setHoldPiece] = useState(null);
  const [clearingRows, setClearingRows] = useState([]);
  const [clearTrigger, setClearTrigger] = useState(null);

  const boardRef = useRef(board);
  const pieceRef = useRef(currentPiece);
  const nextPieceRef = useRef(nextPiece);
  const holdPieceRef = useRef(holdPiece);
  const canHoldRef = useRef(true);
  const statusRef = useRef(status);
  const clearingRef = useRef(false);
  const rafRef = useRef(null);
  const lastDropRef = useRef(0);
  const repeatTimeoutRef = useRef(null);
  const repeatIntervalRef = useRef(null);
  const dragLastXRef = useRef(0);
  const dragLastYRef = useRef(0);
  const dragAccumXRef = useRef(0);
  const dragAccumYRef = useRef(0);
  const dragMovedRef = useRef(false);
  const lastSwipeMoveAtRef = useRef(0);
const user=useSelector(state=>state.user)
const { showToast } = useToast();

  const scorePulse = useSharedValue(0);
  const boardShake = useSharedValue(0);
  const boardDim = useSharedValue(0);
  const overlayProgress = useSharedValue(0);
  const ambientPulse = useSharedValue(0);

  const compactHeight = height < 740;
  const topBarHeight = compactHeight ? 30 : 34;
  const hudHeight = compactHeight ? 50 : 56;
  const controlsHeight = compactHeight ? 112 : 124;
  const verticalChrome =
    Math.max(4, insets.top) +
    Math.max(8, insets.bottom + 4) +
    topBarHeight +
    hudHeight +
    controlsHeight +
    42;
  const cellSize = Math.max(
    18,
    Math.floor(
      Math.min(
        (width - 24) / BOARD_WIDTH,
        (height - verticalChrome) / BOARD_HEIGHT
      )
    )
  );
  const boardWidth = cellSize * BOARD_WIDTH;
  const boardHeight = cellSize * BOARD_HEIGHT;

  const [countdown, setCountdown] = useState(5);
  const countdownTimerRef = useRef(null);

  useEffect(() => {
    statusRef.current = status;
    boardDim.value = withTiming(status === "gameover" ? 1 : 0, { duration: 420 });
    overlayProgress.value = (status === "gameover" || status === "paused" || status === "idle")
      ? withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) })
      : withTiming(0, { duration: 180 });
  }, [boardDim, overlayProgress, status]);

  useEffect(() => {
    if (status === "idle") {
      setCountdown(5);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      
      let currentCountdown = 5;
      countdownTimerRef.current = setInterval(() => {
        currentCountdown -= 1;
        setCountdown(currentCountdown);
        
        if (currentCountdown <= 0) {
          clearInterval(countdownTimerRef.current);
          dispatch(startGame());
        }
      }, 1000);
      
      return () => {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      };
    }
  }, [status, dispatch]);

  useEffect(() => {
    ambientPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [ambientPulse]);

  const syncBoard = useCallback((nextBoard) => {
    boardRef.current = nextBoard;
    setBoardState(nextBoard);
    dispatch(setBoard(nextBoard));
  }, [dispatch]);

  const syncPiece = useCallback((piece) => {
    pieceRef.current = piece;
    setCurrentPieceState(piece);
    dispatch(setCurrentPiece(piece));
  }, [dispatch]);

  const syncNextPiece = useCallback((piece) => {
    nextPieceRef.current = piece;
    setNextPieceState(piece);
    dispatch(setNextPiece(piece));
  }, [dispatch]);

  const initializeGame = useCallback(() => {
    const empty = createEmptyBoard();
    const first = createNewPiece();
    const upcoming = createNewPiece();

    clearingRef.current = false;
    canHoldRef.current = true;
    holdPieceRef.current = null;
    lastDropRef.current = 0;

    setClearingRows([]);
    setClearTrigger(null);
    setHoldPiece(null);
    syncBoard(empty);
    syncPiece(first);
    syncNextPiece(upcoming);
  }, [syncBoard, syncNextPiece, syncPiece]);

  useEffect(() => {
    if (startedAt) initializeGame();
  }, [initializeGame, startedAt]);

  const triggerScorePulse = useCallback(() => {
    scorePulse.value = 0;
    scorePulse.value = withSequence(
      withTiming(1, { duration: 130, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 220 })
    );
  }, [scorePulse]);

  const triggerImpact = useCallback((cleared) => {
    boardShake.value = 0;
    boardShake.value = withSequence(
      withTiming(cleared >= 4 ? 1 : 0.65, { duration: 45 }),
      withTiming(-0.45, { duration: 55 }),
      withTiming(0, { duration: 90 })
    );
  }, [boardShake]);

  const finishSpawn = useCallback((nextBoard) => {
    const nextSpawn = spawnPiece(nextBoard, nextPieceRef.current);
    if (nextSpawn.gameOver) {
      syncPiece(null);
      dispatch(gameOver());
      SoundManager.playTetrisGameOver();
      GameHaptics.tetrisGameOver();
      return;
    }

    syncPiece(nextSpawn.piece);
    syncNextPiece(nextSpawn.nextPiece);
    canHoldRef.current = true;
  }, [dispatch, syncNextPiece, syncPiece]);

  const lockCurrentPiece = useCallback((pieceToLock = pieceRef.current) => {
    if (!pieceToLock || clearingRef.current) return;

    const merged = mergePiece(boardRef.current, pieceToLock);
    const fullRows = getFullLineIndexes(merged);
    syncBoard(merged);
    syncPiece(null);

    if (!fullRows.length) {
      finishSpawn(merged);
      return;
    }

    clearingRef.current = true;
    setClearingRows(fullRows);
    setClearTrigger({
      id: Date.now(),
      boardWidth,
      y: fullRows.reduce((sum, row) => sum + row, 0) / fullRows.length * cellSize,
    });
    triggerImpact(fullRows.length);

    if (fullRows.length >= 4) {
      GameHaptics.tetrisTetrisClear();
      SoundManager.playTetrisCombo();
    } else {
      GameHaptics.tetrisLineClear();
      SoundManager.playTetrisClear();
    }

    setTimeout(() => {
      const { newBoard, cleared } = removeLines(merged, fullRows);
      dispatch(clearLines(cleared));
      triggerScorePulse();
      setClearingRows([]);
      setClearTrigger(null);
      clearingRef.current = false;
      syncBoard(newBoard);
      finishSpawn(newBoard);
    }, CLEAR_ANIMATION_MS);
  }, [boardWidth, cellSize, dispatch, finishSpawn, syncBoard, syncPiece, triggerImpact, triggerScorePulse]);

  const canAct = useCallback(() =>
    statusRef.current === "playing" && pieceRef.current && !clearingRef.current,
  []);

  const moveHorizontal = useCallback((direction) => {
    if (!canAct()) return;
    const moved = engineMovePiece(boardRef.current, pieceRef.current, direction);
    if (moved !== pieceRef.current) {
      syncPiece(moved);
      SoundManager.playTetrisMove();
      GameHaptics.tetrisMove();
    }
  }, [canAct, syncPiece]);

  const rotate = useCallback(() => {
    if (!canAct()) return;
    const rotated = engineRotatePiece(boardRef.current, pieceRef.current);
    if (rotated !== pieceRef.current) {
      syncPiece(rotated);
      SoundManager.playTetrisRotate();
      GameHaptics.tetrisRotate();
    }
  }, [canAct, syncPiece]);

  const softDrop = useCallback(() => {
    if (!canAct()) return;
    const result = softDropPiece(boardRef.current, pieceRef.current);
    if (result.locked) {
      lockCurrentPiece();
    } else {
      syncPiece(result.piece);
      GameHaptics.tetrisSoftDrop();
    }
  }, [canAct, lockCurrentPiece, syncPiece]);

  const hardDrop = useCallback(() => {
    if (!canAct()) return;
    const dropped = hardDropPiece(boardRef.current, pieceRef.current);
    syncPiece(dropped);
    SoundManager.playTetrisDrop();
    GameHaptics.tetrisHardDrop();
    triggerImpact(2);
    lockCurrentPiece(dropped);
  }, [canAct, lockCurrentPiece, syncPiece, triggerImpact]);

  const holdCurrentPiece = useCallback(() => {
    if (!canAct() || !canHoldRef.current) return;
    const current = pieceRef.current;
    const stored = holdPieceRef.current;

    canHoldRef.current = false;
    holdPieceRef.current = resetPiecePosition(current);
    setHoldPiece(holdPieceRef.current);
    SoundManager.playTetrisRotate();
    GameHaptics.tetrisRotate();

    if (!stored) {
      const nextSpawn = spawnPiece(boardRef.current, nextPieceRef.current);
      if (nextSpawn.gameOver) {
        dispatch(gameOver());
        return;
      }
      syncPiece(nextSpawn.piece);
      syncNextPiece(nextSpawn.nextPiece);
      return;
    }

    const swap = resetPiecePosition(stored);
    if (hasCollision(boardRef.current, swap)) {
      dispatch(gameOver());
      return;
    }
    syncPiece(swap);
  }, [canAct, dispatch, syncNextPiece, syncPiece]);

  const startRepeat = useCallback((action, delay = DAS_DELAY, interval = ARR_INTERVAL) => {
    action();
    clearTimeout(repeatTimeoutRef.current);
    clearInterval(repeatIntervalRef.current);
    repeatTimeoutRef.current = setTimeout(() => {
      repeatIntervalRef.current = setInterval(action, interval);
    }, delay);
  }, []);

  const stopRepeat = useCallback(() => {
    clearTimeout(repeatTimeoutRef.current);
    clearInterval(repeatIntervalRef.current);
  }, []);

  useEffect(() => stopRepeat, [stopRepeat]);

  useEffect(() => {
    const loop = (timestamp) => {
      rafRef.current = requestAnimationFrame(loop);
      if (statusRef.current !== "playing" || clearingRef.current) {
        lastDropRef.current = timestamp;
        return;
      }

      if (!lastDropRef.current) {
        lastDropRef.current = timestamp;
        return;
      }

      if (timestamp - lastDropRef.current >= dropInterval) {
        softDrop();
        lastDropRef.current = timestamp;
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dropInterval, softDrop]);

  const togglePause = useCallback(() => {
    if (status === "playing") {
      dispatch(pauseGame());
      return;
    }
    if (status === "paused") {
      dispatch(resumeGame());
    }
  }, [dispatch, status]);

  const handleRestart = useCallback(() => {
    dispatch(startGame());
  }, [dispatch]);

  const resetDragTracking = useCallback(() => {
    dragLastXRef.current = 0;
    dragLastYRef.current = 0;
    dragAccumXRef.current = 0;
    dragAccumYRef.current = 0;
    dragMovedRef.current = false;
    lastSwipeMoveAtRef.current = 0;
  }, []);

  const handlePanUpdate = useCallback((translationX, translationY) => {
    if (!canAct()) return;

    const now = Date.now();
    const deltaX = translationX - dragLastXRef.current;
    const deltaY = translationY - dragLastYRef.current;
    dragLastXRef.current = translationX;
    dragLastYRef.current = translationY;
    dragAccumXRef.current += deltaX;
    dragAccumYRef.current += Math.max(0, deltaY);

    if (now - lastSwipeMoveAtRef.current < SWIPE_STEP_COOLDOWN) return;

    const horizontalThreshold = Math.max(14, cellSize * 0.58);
    const verticalThreshold = Math.max(14, cellSize * 0.58);
    const absX = Math.abs(dragAccumXRef.current);

    if (absX >= horizontalThreshold && absX > dragAccumYRef.current * 0.85) {
      const direction = dragAccumXRef.current > 0 ? "right" : "left";
      moveHorizontal(direction);
      dragAccumXRef.current = 0;
      dragAccumYRef.current = 0;
      dragMovedRef.current = true;
      lastSwipeMoveAtRef.current = now;
      return;
    }

    if (dragAccumYRef.current >= verticalThreshold && dragAccumYRef.current > absX * 0.75) {
      softDrop();
      dragAccumYRef.current = 0;
      dragAccumXRef.current = 0;
      dragMovedRef.current = true;
      lastSwipeMoveAtRef.current = now;
    }
  }, [canAct, cellSize, moveHorizontal, softDrop]);

  const handlePanEnd = useCallback((translationX, translationY) => {
    const absX = Math.abs(translationX);
    const absY = Math.abs(translationY);

    if (!dragMovedRef.current && absX > absY && absX > Math.max(18, cellSize * 0.55)) {
      moveHorizontal(translationX < 0 ? "left" : "right");
    } else if (!dragMovedRef.current && translationY > Math.max(18, cellSize * 0.55)) {
      softDrop();
    } else if (!dragMovedRef.current && translationY < -Math.max(34, cellSize)) {
      holdCurrentPiece();
    }

    resetDragTracking();
  }, [cellSize, holdCurrentPiece, moveHorizontal, resetDragTracking, softDrop]);

  const panGesture = Gesture.Pan()
    .minDistance(6)
    .onBegin(() => {
      "worklet";
      runOnJS(resetDragTracking)();
    })
    .onUpdate(e => {
      "worklet";
      runOnJS(handlePanUpdate)(e.translationX, e.translationY);
    })
    .onEnd(e => {
      "worklet";
      runOnJS(handlePanEnd)(e.translationX, e.translationY);
    });

  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDistance(12)
    .onEnd(() => {
      "worklet";
      runOnJS(rotate)();
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDistance(14)
    .onEnd(() => {
      "worklet";
      runOnJS(hardDrop)();
    });

  const gesture = Gesture.Exclusive(
    doubleTapGesture,
    Gesture.Simultaneous(panGesture, tapGesture)
  );

  const boardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - boardDim.value * 0.45,
    transform: [
      { translateX: boardShake.value * 9 },
      { translateY: Math.abs(boardShake.value) * 2 },
      { scale: 1 - boardDim.value * 0.025 },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayProgress.value,
    transform: [{ scale: 0.96 + overlayProgress.value * 0.04 }],
  }));

  const ambientStyle = useAnimatedStyle(() => ({
    opacity: 0.28 + ambientPulse.value * 0.2,
    transform: [{ scale: 1 + ambientPulse.value * 0.08 }],
  }));

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(4, insets.top),
          paddingBottom: Math.max(8, insets.bottom + 4),
        },
      ]}
    >
      <Animated.View style={[styles.ambient, ambientStyle]} />
      <View style={[styles.topBar, { height: topBarHeight }]}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#f7fbff" />
        </TouchableOpacity>
       
        <TouchableOpacity style={styles.iconButton} onPress={togglePause}>
          <Icon name={status === "paused" ? "play" : "pause"} size={22} color="#f7fbff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.hudRow, { minHeight: hudHeight }]}>
        <MiniPiece label="Hold" piece={holdPiece} />
          <View style={styles.topScorePill}>
          <Text style={styles.topScoreLabel}>Score</Text>
          <Text style={styles.topScoreValue}>{score}</Text>
        </View>
        <MiniPiece label="Next" piece={nextPiece} />
      </View>

      <GestureDetector gesture={gesture}>
        <View style={[styles.boardStage, { width: boardWidth, height: boardHeight }]}>
          <TetrisRenderer
            board={board}
            currentPiece={currentPiece}
            clearingRows={clearingRows}
            boardAnimatedStyle={boardAnimatedStyle}
            cellSize={cellSize}
          />
          <ClearParticles trigger={clearTrigger} />
          {clearingRows.length ? (
            <View pointerEvents="none" style={styles.clearFlash}>
              <Text style={styles.clearFlashText}>
                +{clearingRows.length}
              </Text>
            </View>
          ) : null}
        </View>
      </GestureDetector>

      <View style={[styles.controlDeck, { height: controlsHeight }]}>
        <View style={styles.controlRow}>
          <ControlButton
            icon="chevron-left"
            label="Left"
            onPressIn={() => startRepeat(() => moveHorizontal("left"))}
            onPressOut={stopRepeat}
          />
          <ControlButton icon="rotate-cw" label="Turn" onPress={rotate} />
          <ControlButton
            icon="chevron-right"
            label="Right"
            onPressIn={() => startRepeat(() => moveHorizontal("right"))}
            onPressOut={stopRepeat}
          />
        </View>
        <View style={styles.controlRow}>
          <ControlButton icon="archive" label="Hold" onPress={holdCurrentPiece} />
          <ControlButton
            icon="arrow-down"
            label="Soft"
            onPressIn={() => startRepeat(softDrop, 0, SOFT_DROP_INTERVAL)}
            onPressOut={stopRepeat}
          />
          <ControlButton
            icon="chevrons-down"
            label="Drop"
            wide
            onPress={hardDrop}
          />
        </View>
      </View>

      {(status === "gameover" || status === "paused" || status === "idle") && (
        <Animated.View style={[styles.overlay, overlayStyle]}>
          {status === "idle" ? (
            <>
              <Text style={styles.overlayTitle}>Get Ready</Text>
              <Text style={[styles.overlayScore, { fontSize: 64, marginTop: 32, color: "#6ddcff" }]}>
                {countdown}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.overlayTitle}>
                {status === "paused" ? "Paused" : "Game Over"}
              </Text>
              <Text style={styles.overlayScore}>Score {score}</Text>
              <View style={styles.overlayActions}>
                {status === "paused" ? (
                  <TouchableOpacity style={styles.primaryButton} onPress={togglePause}>
                    <Text style={styles.primaryButtonText}>Resume</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity style={styles.secondaryButton} onPress={handleRestart}>
                  <Text style={styles.secondaryButtonText}>Restart</Text>
                </TouchableOpacity>
                {score > 0 ? (
                  <TouchableOpacity style={styles.secondaryButton} onPress={async()=>{
try {
    const response = await api.post(
      '/game/tetris-game',
      {
       
        aura: score,
      },
    );

    if (response?.data?.success) {
      //dispatch(collectReward());
      dispatch(
    updateUserData({
      aura:
        (user?.userData?.aura || 0) + score,
    })
  );
  dispatch(resetScore());
showToast( `You claimed ${score} points.`, "success");
    }
  } catch (err) {
    console.log(
      'Claim reward error:',
      err?.response?.data || err.message,
    );
showToast("Failed to Claim  Aura, Try again", "error");
  }
                  }}>
                    <Text style={styles.secondaryButtonText}>Claim Aura</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#050712",
    paddingHorizontal: 12,
  },
  ambient: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    top: -170,
    alignSelf: "center",
    backgroundColor: "rgba(76, 125, 255, 0.42)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },
  title: {
    color: "#f7fbff",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  topScorePill: {
    height: 34,
    minWidth: 118,
    paddingHorizontal: 16,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },
  topScoreLabel: {
    color: "rgba(247,251,255,0.55)",
    fontSize: 10,
    fontWeight: "900",
    marginRight: 8,
    textTransform: "uppercase",
  },
  topScoreValue: {
    color: "#f7fbff",
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(247,251,255,0.58)",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 1,
  },
  hudRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    marginTop: 1,
    marginBottom: 4,
  },
  previewPanel: {
    width: 72,
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    paddingVertical: 6,
    alignItems: "center",
  },
  panelLabel: {
    color: "rgba(247,251,255,0.58)",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  previewGrid: {
    width: 48,
    height: 34,
    marginTop: 3,
    position: "relative",
  },
  previewBlock: {
    position: "absolute",
    width: 11,
    height: 11,
    borderRadius: 3,
  },
  pieceKey: {
    color: "#f7fbff",
    fontSize: 10,
    fontWeight: "900",
  },
  statsColumn: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: "space-between",
  },
  statPill: {
    minHeight: 22,
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statLabel: {
    color: "rgba(247,251,255,0.56)",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  statValue: {
    color: "#f7fbff",
    fontSize: 13,
    fontWeight: "900",
  },
  boardStage: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  particleLayer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
  },
  particle: {
    position: "absolute",
    backgroundColor: "#f7fbff",
    shadowColor: "#6ddcff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  clearFlash: {
    position: "absolute",
    top: "42%",
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  clearFlashText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },
  controlDeck: {
    justifyContent: "center",
    paddingTop: 2,
    paddingBottom: 2,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  controlWrap: {
    width: 72,
    marginHorizontal: 4,
  },
  controlWide: {
    width: 116,
    marginHorizontal: 4,
  },
  controlButton: {
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  controlButtonWide: {
    backgroundColor: "rgba(97, 139, 255, 0.24)",
    borderColor: "rgba(121, 208, 255, 0.25)",
  },
  controlButtonPressed: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  controlLabel: {
    color: "rgba(247,251,255,0.72)",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,7,18,0.78)",
    paddingHorizontal: 24,
  },
  overlayTitle: {
    color: "#f7fbff",
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
  },
  overlayScore: {
    color: "rgba(247,251,255,0.7)",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 10,
  },
  overlayActions: {
    flexDirection: "row",
    marginTop: 24,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 24,
    backgroundColor: "#6ddcff",
    marginHorizontal: 6,
  },
  primaryButtonText: {
    color: "#06111c",
    fontWeight: "900",
    fontSize: 15,
  },
  secondaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginHorizontal: 6,
  },
  secondaryButtonText: {
    color: "#f7fbff",
    fontWeight: "900",
    fontSize: 15,
  },
});
