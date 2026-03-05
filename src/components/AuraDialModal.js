import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  TextInput,
} from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useDerivedValue,
  interpolateColor,
  runOnJS,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const SIZE = Math.min(width * 0.75, 300);
const R = SIZE / 2;
const CENTER = R;

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function AuraDialModal({
  visible,
  onClose,
  onSend,
  onConfirmNegative,
}) {
  const angle = useSharedValue(0);

  /* ---------------- ANGLE → AURA ---------------- */
  const aura = useDerivedValue(() => {
    const normalized = angle.value / Math.PI; // -1 → 1
    const v = Math.round(normalized * 10);
    return Math.max(-10, Math.min(10, v));
  });

  /* ---------------- GESTURE ---------------- */
  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      const x = e.x - CENTER;
      const y = e.y - CENTER;

      let a = Math.atan2(y, x);
      a += Math.PI / 2;

      if (a > Math.PI) a -= Math.PI * 2;
      if (a < -Math.PI) a += Math.PI * 2;

      angle.value = a;
    })
    .onEnd(() => {
      const v = aura.value;

      if (v === 0) {
        runOnJS(onClose)();
        return;
      }

      if (v < 0 && onConfirmNegative) {
        runOnJS(onConfirmNegative)(v);
      } else {
        runOnJS(onSend)(v);
      }

      runOnJS(onClose)();
    });

  /* ---------------- HAND ---------------- */
  const handProps = useAnimatedProps(() => {
    const len = R - 40;
    return {
      x2: CENTER + len * Math.sin(angle.value),
      y2: CENTER - len * Math.cos(angle.value),
    };
  });

  /* ---------------- CENTER COLOR ---------------- */
  const centerProps = useAnimatedProps(() => ({
    fill: interpolateColor(
      aura.value,
      [-10, 0, 10],
      ["#ef4444", "#1f2937", "#22c55e"]
    ),
  }));

  /* ---------------- CENTER TEXT ---------------- */
  const textProps = useAnimatedProps(() => {
    const v = aura.value;
    return {
      text: `${v > 0 ? "+" : ""}${v}`,
    };
  });

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <GestureDetector gesture={gesture}>
        <View style={styles.dialWrapper}>
          <View style={styles.dialShadow} />

          <Svg width={SIZE} height={SIZE}>
            {/* Outer Ring */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={R - 6}
              stroke="#374151"
              strokeWidth={14}
              fill="none"
            />

            {/* Ticks */}
            {[...Array(20)].map((_, i) => {
              const a = (i / 20) * Math.PI * 2;
              const r1 = R - 20;
              const r2 = i % 5 === 0 ? R - 36 : R - 28;

              return (
                <Line
                  key={i}
                  x1={CENTER + r1 * Math.sin(a)}
                  y1={CENTER - r1 * Math.cos(a)}
                  x2={CENTER + r2 * Math.sin(a)}
                  y2={CENTER - r2 * Math.cos(a)}
                  stroke="#9ca3af"
                  strokeWidth={i % 5 === 0 ? 3 : 1}
                />
              );
            })}

            {/* Hand */}
            <AnimatedLine
              x1={CENTER}
              y1={CENTER}
              animatedProps={handProps}
              stroke="#e5e7eb"
              strokeWidth={4}
              strokeLinecap="round"
            />

            {/* Center */}
            <AnimatedCircle
              cx={CENTER}
              cy={CENTER}
              r={36}
              animatedProps={centerProps}
            />
          </Svg>

          {/* CENTER VALUE */}
          <AnimatedTextInput
            editable={false}
            pointerEvents="none"
            animatedProps={textProps}
            style={styles.centerValue}
          />

          {/* LABEL */}
          <View pointerEvents="none" style={styles.centerLabelWrapper}>
            <Animated.Text style={styles.centerLabel}>Aura</Animated.Text>
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  dialWrapper: {
    width: SIZE,
    height: SIZE,
    justifyContent: "center",
    alignItems: "center",
  },

  dialShadow: {
    position: "absolute",
    width: SIZE + 20,
    height: SIZE + 20,
    borderRadius: (SIZE + 20) / 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },

  centerValue: {
    position: "absolute",
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },

  centerLabelWrapper: {
    position: "absolute",
    top: "56%",
  },

  centerLabel: {
    fontSize: 12,
    color: "#d1d5db",
  },
});
