import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  Pressable,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";

import Grid from "../components/puzzle/Grid";
import { SoundManager } from "../audio/SoundManager";
import { GameHaptics } from "../utils/haptics";
import {
  completeLevel,
  retryLevel,
  setScore,
  takeHint,
} from "../store/puzzleSlice";
import { usePuzzleValidation } from "../hooks/usePuzzleValidation";
import {
  calculateLevelReward,
  getRewardMultiplier,
} from "../utils/numberGameProgression";
import { updateUserData } from "../store/userSlice";
import api from "../services/api";
import { useToast } from "../constants/context/ErrorContext";

const selectMathPuzzle = (state) => ({
  level: state.mathPuzzle.level,
  puzzle: state.mathPuzzle.puzzle,
  score: state.mathPuzzle.score,
  hintUsed: state.mathPuzzle.hintUsed,
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

function StatCard({ label, value, accent = false }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>
        {value}
      </Text>
    </View>
  );
}

function ActionButton({ icon, label, onPress, disabled = false, primary = false }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        primary && styles.actionButtonPrimary,
        disabled && styles.actionButtonDisabled,
        pressed && !disabled && { transform: [{ scale: 0.98 }] },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Icon
        name={icon}
        size={18}
        color={primary ? "#04111f" : disabled ? "rgba(226,232,240,0.34)" : "#e5f4ff"}
      />
      <Text
        style={[
          styles.actionText,
          primary && styles.actionTextPrimary,
          disabled && styles.actionTextDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CompletionModal({
  visible,
  level,
  score,
  reward,
  hintUsed,
  onContinue,
  onRetry,
}) {
  if (!visible) return null;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onContinue}>
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onContinue} />
        <View style={styles.modalCard}>
          <View style={styles.modalGlow} />
          <Text style={styles.modalKicker}>Level {level}</Text>
          <Text style={styles.modalTitle}>Solved</Text>
          <Text style={styles.modalSubtitle}>
            {hintUsed
              ? "Hint used, so this level earns 1 point."
              : `Reward is ${reward} based on the equation count and score tier.`}
          </Text>

          <View style={styles.modalStats}>
            <StatCard label="Reward" value={reward} accent />
            <StatCard label="Total" value={score} />
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={onContinue}>
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalRetry} onPress={onRetry}>
            <Text style={styles.modalRetryText}>Replay level</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function Maths() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { level, puzzle, score, hintUsed } = useSelector(selectMathPuzzle, shallowEqual);
  const validation = usePuzzleValidation(false);
  const gridPulse = useSharedValue(0);
const user=useSelector(state=>state.user)
const { showToast } = useToast();

  const [completionVisible, setCompletionVisible] = useState(false);
  const [rewardPreview, setRewardPreview] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const completionGuardRef = useRef(false);
 const [claimingReward, setClaimingReward] = useState(false);
  const currentMultiplier = getRewardMultiplier(score);

  useEffect(() => {
    completionGuardRef.current = false;
    setCompletionVisible(false);
    setRewardPreview(0);
  }, [level]);

  useEffect(() => {
    gridPulse.value = withSequence(
      withTiming(1, { duration: 140 }),
      withTiming(0, { duration: 320 })
    );
  }, [gridPulse, level]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event?.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!validation.allSolved || completionGuardRef.current || !puzzle) return;

    completionGuardRef.current = true;
    const reward = calculateLevelReward({
      score,
      equationCount: puzzle.equations.length,
      hintUsed,
    });

    setRewardPreview(reward);
    setCompletionVisible(true);
    GameHaptics.numberPuzzleComplete();
    SoundManager.playNumberPuzzleComplete();
  }, [hintUsed, puzzle, score, validation.allSolved]);

  const handleContinue = () => {
    setCompletionVisible(false);
    dispatch(completeLevel());
  };

  const handleRetry = () => {
    completionGuardRef.current = false;
    setCompletionVisible(false);
    setRewardPreview(0);
    dispatch(retryLevel());
  };

  const handleHint = () => {
    if (!puzzle) return;
    if (hintUsed) {
      Alert.alert("Hint limit reached", "You can use only one hint on each level.");
      return;
    }

    const editableCells = Object.values(puzzle.cells).filter((cell) => cell.editable);

    const target =
      editableCells.find((cell) => cell.value === null) || editableCells[0];

    if (!target) {
      Alert.alert("No hint available", "There are no editable cells left to reveal.");
      return;
    }

    dispatch(
      takeHint({
        cellId: target.id,
        value: target.solution,
      })
    );
    GameHaptics.numberPuzzleCorrect();
    SoundManager.playNumberPuzzleCorrect();
  };
 const claimReward = async() => {
  setClaimingReward(true);
 if (score <= 0) {
showToast( `No Points,Complete more levels to earn points!`, "failure");


    return;
  }

  try {
    const response = await api.post(
      '/game/number-game',
      {
        level: level,
        aura: score,
      },
    );

    if (response?.data?.success) {
      dispatch(setScore(0));
      dispatch(
    updateUserData({
      aura:
        (user?.userData?.aura || 0) + score,  
    })
  );
showToast( `You claimed ${score} points.`, "success");
  setClaimingReward(false);

    }
  } catch (err) {
  setClaimingReward(false);

    console.error(
      'Claim reward error:',
      err?.response?.data || err.message,
    );
showToast("Failed to Claim  Aura, Try again", "error");
  }

 }
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 20 + keyboardHeight },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
          nestedScrollEnabled
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.roundButton} onPress={() => navigation.goBack()}>
              <Icon name="chevron-back" size={24} color="#f8fafc" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.title}>Number Game</Text>
              <Text style={styles.subtitle}>Level {level}</Text>
            </View>

            <View style={styles.levelBadge}>
             
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <StatCard label="Score" value={score} accent />
              <StatCard
                label="Solved"
                value={`${validation.solvedCount}/${puzzle?.equations.length || 0}`}
              />
            </View>
            <ProgressBar progress={validation.progress} />
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {puzzle?.equations.length || 0} equations
              </Text>
              <Text style={styles.metaText}>
                {Object.values(puzzle?.cells || {}).filter((cell) => cell.editable).length} cells
              </Text>
              <Text style={styles.metaText}>
                {puzzle?.difficulty?.operators?.join(" ") || "+ -"}
              </Text>
            </View>
          </View>

          <View style={styles.boardWrap}>
            <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
   
  }}
  nestedScrollEnabled={true}
  
>

            <Grid validationPulse={gridPulse} />
</ScrollView>

          </View>

          <View style={styles.actionRow}>
            <ActionButton
              icon="bulb"
              label="Hint 1/1" 
              onPress={handleHint}
              disabled={!puzzle || hintUsed}
            />
            <ActionButton
              icon="reload"
              label="Retry"
              onPress={handleRetry}
              disabled={!puzzle}  
            />
            <ActionButton
              icon="gift"
              label="Reward"
              onPress={claimReward}
              disabled={claimingReward ||  score <= 0}
            />
          </View>

         
        </ScrollView>
      </KeyboardAvoidingView>

      <CompletionModal
        visible={completionVisible}
        level={level}
        score={score}
        reward={rewardPreview}
        hintUsed={hintUsed}
        onContinue={handleContinue}
        onRetry={handleRetry}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
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
  levelBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
   
  },
  levelBadgeText: {
    color: "#7dd3fc",
    fontSize: 14,
    fontWeight: "900",
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
  statValueAccent: {
    color: "#7dd3fc",
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
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  metaText: {
    color: "rgba(226,232,240,0.68)",
    fontSize: 11,
    fontWeight: "800",
  },
  boardWrap: {
    
    paddingVertical: 18,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionButton: {
    flex: 1,
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
  actionButtonDisabled: {
    opacity: 0.45,
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
  actionTextDisabled: {
    color: "rgba(226,232,240,0.34)",
  },
  helperText: {
    color: "rgba(226,232,240,0.54)",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 14,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 7, 18, 0.78)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
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
    textAlign: "center",
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
