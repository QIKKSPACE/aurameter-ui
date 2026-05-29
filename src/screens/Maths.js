import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import Grid from "../components/puzzle/Grid";
import { SoundManager } from "../audio/SoundManager";
import { GameHaptics } from "../utils/haptics";
import { completeLevel, nextLevel, retryLevel, updateCellValue } from "../store/puzzleSlice";
import { usePuzzleValidation } from "../hooks/usePuzzleValidation";

const selectMathPuzzle = state => ({
  level: state.mathPuzzle.level,
  puzzle: state.mathPuzzle.puzzle,
  streak: state.mathPuzzle.streak,
  score: state.mathPuzzle.score,
});

function ProgressBar({ progress }) {
  const width = useSharedValue(progress);

  useEffect(() => {
    width.value = withTiming(progress, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0.06, width.value) * 100}%`,
  }));

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, fillStyle]} />
    </View>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function ActionButton({ icon, label, onPress, primary }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.actionWrap, style]}>
      <Pressable
        style={[styles.actionButton, primary && styles.actionButtonPrimary]}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.95, { duration: 70 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 260 });
        }}
      >
        <MaterialIcon name={icon} size={18} color={primary ? "#04111f" : "#e5f4ff"} />
        <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function CompletionModal({ visible, level, score, streak, onNext, onRetry }) {
  const progress = useSharedValue(0);
  const particles = useMemo(
    () => Array.from({ length: 22 }, (_, index) => ({
      id: index,
      left: `${8 + Math.random() * 84}%`,
      top: `${12 + Math.random() * 32}%`,
      size: 4 + Math.random() * 5,
      delay: Math.random() * 220,
      dx: (Math.random() - 0.5) * 70,
      dy: 40 + Math.random() * 90,
    })),
    [visible]
  );

  useEffect(() => {
    progress.value = visible
      ? withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) })
      : withTiming(0, { duration: 180 });
  }, [progress, visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 28 },
      { scale: 0.94 + progress.value * 0.06 },
    ],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.modalOverlay, overlayStyle]}>
      {particles.map(particle => (
        <ModalParticle key={particle.id} particle={particle} />
      ))}
      <Animated.View style={[styles.modalCard, cardStyle]}>
        <View style={styles.modalGlow} />
        <Text style={styles.modalKicker}>Level {level}</Text>
        <Text style={styles.modalTitle}>Complete</Text>
        <Text style={styles.modalSubtitle}>+{10 + level + Math.min(streak, 10)} reward</Text>
        <View style={styles.modalStats}>
          <StatCard label="Score" value={score} />
          <StatCard label="Streak" value={streak} />
        </View>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Next Level</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalRetry} onPress={onRetry}>
          <Text style={styles.modalRetryText}>Replay level</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

function ModalParticle({ particle }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      particle.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );
  }, [particle.delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: progress.value * particle.dx },
      { translateY: progress.value * particle.dy },
      { scale: 1 - progress.value * 0.5 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.modalParticle,
        {
          left: particle.left,
          top: particle.top,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
        },
        style,
      ]}
    />
  );
}

export default function Maths() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { level, puzzle, score, streak } = useSelector(selectMathPuzzle, shallowEqual);
  const validation = usePuzzleValidation(false);
  const [completeVisible, setCompleteVisible] = useState(false);
  const completedRef = useRef(false);
  const lastWrongCountRef = useRef(0);
  const autoNextTimeoutRef = useRef(null);
  const ambient = useSharedValue(0);
  const gridPulse = useSharedValue(0);

  useEffect(() => {
    ambient.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [ambient]);

  useEffect(() => {
    completedRef.current = false;
    lastWrongCountRef.current = 0;
    setCompleteVisible(false);
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    gridPulse.value = withSequence(
      withTiming(1, { duration: 180 }),
      withTiming(0, { duration: 360 })
    );
  }, [gridPulse, level]);

  useEffect(() => {
    if (validation.wrongCount > lastWrongCountRef.current && !completedRef.current) {
      GameHaptics.numberPuzzleWrong();
      SoundManager.playNumberPuzzleWrong();
    }
    lastWrongCountRef.current = validation.wrongCount;
  }, [validation.wrongCount]);

  useEffect(() => {
    if (!validation.allSolved || completedRef.current) return;
    completedRef.current = true;
    Keyboard.dismiss();
    dispatch(completeLevel());
    setCompleteVisible(true);
    gridPulse.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 560 })
    );
    GameHaptics.numberPuzzleComplete();
    SoundManager.playNumberPuzzleComplete();

    autoNextTimeoutRef.current = setTimeout(() => {
      dispatch(nextLevel());
    }, 2800);

    return () => clearTimeout(autoNextTimeoutRef.current);
  }, [dispatch, gridPulse, validation.allSolved]);

  const ambientStyle = useAnimatedStyle(() => ({
    opacity: 0.24 + ambient.value * 0.18,
    transform: [{ scale: 1 + ambient.value * 0.08 }],
  }));

  const handleNext = useCallback(() => {
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    dispatch(nextLevel());
  }, [dispatch]);

  const handleRetry = useCallback(() => {
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    completedRef.current = false;
    setCompleteVisible(false);
    dispatch(retryLevel());
  }, [dispatch]);

  const handleHint = useCallback(() => {
    if (!puzzle) return;
    const empty = Object.values(puzzle.cells).find(cell => cell.editable && cell.value === null);
    if (!empty) return;
    dispatch(updateCellValue({ cellId: empty.id, value: empty.solution }));
    GameHaptics.numberPuzzleCorrect();
    SoundManager.playNumberPuzzleCorrect();
  }, [dispatch, puzzle]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(8, insets.top + 4),
            paddingBottom: Math.max(10, insets.bottom + 8),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.ambientOrb, ambientStyle]} />

        <View style={styles.header}>
          <TouchableOpacity style={styles.roundButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={24} color="#f8fafc" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Number Game</Text>
            <Text style={styles.subtitle}>Level {level}</Text>
          </View>
          <TouchableOpacity style={styles.roundButton} onPress={handleRetry}>
            <MaterialIcon name="refresh" size={21} color="#f8fafc" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <StatCard label="Score" value={score} />
            <StatCard label="Streak" value={streak} />
            <StatCard label="Solved" value={`${validation.solvedCount}/${puzzle?.equations.length || 0}`} />
          </View>
          <ProgressBar progress={validation.progress} />
        </View>

        <View style={styles.boardWrap}>
          <Grid validationPulse={gridPulse} />
        </View>

        <View style={styles.actionRow}>
          <ActionButton icon="lightbulb-on-outline" label="Hint" onPress={handleHint} />
          <ActionButton icon="reload" label="Retry" onPress={handleRetry} />
          <ActionButton icon="arrow-right" label="Skip" onPress={handleNext} primary />
        </View>

        <Text style={styles.helperText}>
          Fill the missing numbers. Correct equations glow automatically.
        </Text>
      </ScrollView>

      <CompletionModal
        visible={completeVisible}
        level={level}
        score={score}
        streak={streak}
        onNext={handleNext}
        onRetry={handleRetry}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  ambientOrb: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    top: -180,
    alignSelf: "center",
    backgroundColor: "rgba(56, 189, 248, 0.36)",
  },
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerCenter: {
    alignItems: "center",
  },
  title: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(226,232,240,0.62)",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 1,
  },
  heroCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 24,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 9,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  statLabel: {
    color: "rgba(226,232,240,0.58)",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  statValue: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },
  progressTrack: {
    height: 9,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#38bdf8",
  },
  boardWrap: {
    flex: 1,
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  actionWrap: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionButton: {
    height: 48,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  actionButtonPrimary: {
    backgroundColor: "#7dd3fc",
    borderColor: "#7dd3fc",
  },
  actionText: {
    color: "#e5f4ff",
    fontWeight: "900",
    fontSize: 13,
    marginLeft: 6,
  },
  actionTextPrimary: {
    color: "#04111f",
  },
  helperText: {
    color: "rgba(226,232,240,0.54)",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 7, 18, 0.78)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalParticle: {
    position: "absolute",
    backgroundColor: "#7dd3fc",
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "rgba(15, 23, 42, 0.98)",
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.34)",
  },
  modalGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -120,
    backgroundColor: "rgba(56, 189, 248, 0.22)",
  },
  modalKicker: {
    color: "#7dd3fc",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  modalTitle: {
    color: "#f8fafc",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 6,
  },
  modalSubtitle: {
    color: "rgba(226,232,240,0.68)",
    fontWeight: "800",
    marginTop: 6,
  },
  modalStats: {
    width: "100%",
    flexDirection: "row",
    marginTop: 20,
  },
  nextButton: {
    width: "100%",
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7dd3fc",
    marginTop: 20,
  },
  nextButtonText: {
    color: "#04111f",
    fontSize: 16,
    fontWeight: "900",
  },
  modalRetry: {
    marginTop: 14,
  },
  modalRetryText: {
    color: "rgba(226,232,240,0.72)",
    fontWeight: "900",
  },
});
