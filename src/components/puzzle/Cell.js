import React, { useEffect } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { usePuzzleState } from "../../hooks/usePuzzleState";
import { GameHaptics } from "../../utils/haptics";
import { SoundManager } from "../../audio/SoundManager";

function Cell({ cell, size, borderColor, status }) {
  const { setCellValue, puzzle } = usePuzzleState();
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);
  const glow = useSharedValue(0);

  const min = puzzle?.digitRange?.min ?? 0;
  const max = puzzle?.digitRange?.max ?? 9999;

  useEffect(() => {
    if (status === "correct") {
      glow.value = withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(0, { duration: 600 })
      );
      scale.value = withSequence(
        withTiming(1.1, { duration: 100, easing: Easing.out(Easing.ease) }),
        withSpring(1, { damping: 10, stiffness: 250 })
      );
    }

    if (status === "wrong") {
      shake.value = withSequence(
        withTiming(-10, { duration: 40 }),
        withSpring(0, { damping: 3.5, stiffness: 450 })
      );
    }
  }, [glow, scale, shake, status]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value },
      { scale: scale.value },
    ],
    shadowOpacity: 0.18 + glow.value * 0.38,
  }));

  const handleChange = (text) => {
    if (text === "") {
      setCellValue(cell.id, null);
      return;
    }

    const digitsOnly = text.replace(/[^\d]/g, "");
    if (!digitsOnly) return;

    const clamped = Math.min(Math.max(Number(digitsOnly), min), max);
    setCellValue(cell.id, clamped);
    GameHaptics.numberPuzzleTap();
    SoundManager.playNumberPuzzleTap();
  };

  return (
    <Animated.View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          borderRadius: Math.max(14, size * 0.24),
          borderColor,
        },
        cell.editable ? styles.editable : styles.fixed,
        animatedStyle,
      ]}
    >
      <View style={styles.innerGlow} />
      <TextInput
        value={cell.value === null ? "" : String(cell.value)}
        onChangeText={handleChange}
        keyboardType="number-pad"
        editable={cell.editable}
        maxLength={String(max).length}
        style={[
          styles.text,
          {
            fontSize: Math.max(16, size * 0.28),
          },
        ]}
        placeholder="?"
        placeholderTextColor="rgba(255,255,255,0.28)"
        textAlign="center"
        selectionColor="#7dd3fc"
        accessibilityLabel={cell.editable ? "Editable number cell" : "Fixed result cell"}
      />
    </Animated.View>
  );
}

export default React.memo(Cell);

const styles = StyleSheet.create({
  cell: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#7dd3fc",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 5,
    overflow: "hidden",
  },
  editable: {
    backgroundColor: "rgba(15, 23, 42, 0.96)",
  },
  fixed: {
    backgroundColor: "rgba(20, 83, 45, 0.9)",
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.045)",
  },
  text: {
    color: "#f8fafc",
    fontWeight: "900",
    width: "100%",
    padding: 0,
  },
});
