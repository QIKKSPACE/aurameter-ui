import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Dimensions, Text } from "react-native";
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useDerivedValue,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  FadeIn,
  FadeOut,
  ScaleInCenter,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const SIZE = Math.min(width * 0.85, 340);
const R = SIZE / 2;
const CENTER = R;

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function AuraDialModal({
  visible,
  onClose,
  onSend,
  onConfirmNegative,
  currentUserAura = 5,
  canSendNegative = false,
  hasSentAura = false,
  sentAuraValue=0,
 
}) {
  const angle = useSharedValue(0);
  const isWarningVisible = useSharedValue(0);
  const [pendingValue, setPendingValue] = useState(null);
   //console.log("AuraDialModal rendered with props:", { visible, currentUserAura, canSendNegative, hasSentAura, setAuraValue });
  // Sync angle to existing value if already sent
  useEffect(() => {
    if (hasSentAura) {
      const targetAngle = (sentAuraValue / 10) * Math.PI;
      angle.value = withSpring(targetAngle);
      isWarningVisible.value = withTiming(1); // Keep the pill visible
    }
  }, [hasSentAura, sentAuraValue]);

  const maxPositiveAura = useMemo(() => Math.max(1, Math.min(10, currentUserAura)), [currentUserAura]);

  const aura = useDerivedValue(() => {
    if (hasSentAura) return sentAuraValue;
    const normalized = angle.value / Math.PI;
    let v = Math.round(normalized * 10);
    return Math.max(-10, Math.min(10, v));
  });

  const gesture = Gesture.Pan()
    .enabled(pendingValue === null && !hasSentAura) // Lock dial if confirmation open or already sent
    .onUpdate((e) => {
      const x = e.x - CENTER;
      const y = e.y - CENTER;
      let a = Math.atan2(y, x) + Math.PI / 2;

      if (a > Math.PI) a -= Math.PI * 2;
      if (a < -Math.PI) a += Math.PI * 2;

      const potentialAura = Math.round((a / Math.PI) * 10);

      if (!canSendNegative && a < -0.1) {
        if (isWarningVisible.value === 0) isWarningVisible.value = withSpring(1);
        return;
      }

      if (potentialAura > maxPositiveAura) {
        if (isWarningVisible.value === 0) isWarningVisible.value = withSpring(1);
        return;
      }

      isWarningVisible.value = withTiming(0);
      angle.value = a;
    })
    .onEnd(() => {
      const v = aura.value;
      isWarningVisible.value = withTiming(0);
      if (v === 0) {
        runOnJS(onClose)();
      } else {
        runOnJS(setPendingValue)(v);
      }
    });

  const handleFinalConfirm = () => {
    if (pendingValue < 0 && onConfirmNegative) {
      onConfirmNegative(pendingValue);
    } else {
      onSend(pendingValue);
    }
    setPendingValue(null);
    onClose();
  };

  /* ---------------- ANIMATED STYLES ---------------- */

  const warningStyle = useAnimatedStyle(() => ({
    opacity: isWarningVisible.value,
    transform: [{ translateY: interpolate(isWarningVisible.value, [0, 1], [10, 0]) }],
  }));

  const handProps = useAnimatedProps(() => ({
    x2: CENTER + (R - 50) * Math.sin(angle.value),
    y2: CENTER - (R - 50) * Math.cos(angle.value),
    stroke: interpolateColor(aura.value, [-10, 0, 10], ["#ff4d4d", "#ffffff", "#00ff88"]),
    strokeOpacity: hasSentAura ? 0.5 : 1,
  }));

  const centerGlowProps = useAnimatedProps(() => ({
    fill: interpolateColor(aura.value, [-10, 0, 10], ["#ef4444", "#111827", "#10b981"]),
    fillOpacity: interpolate(Math.abs(aura.value), [0, 10], [0.1, 0.8]),
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <AnimatedView 
        style={[
          styles.statusPill, 
          warningStyle, 
          hasSentAura && styles.lockedPill
        ]}
      >
        <Text style={[styles.statusText, hasSentAura && styles.lockedText]}>
          {hasSentAura 
            ? "Aura already sent for this interaction" 
            : (!canSendNegative && aura.value <= 0 
              ? "Mutual Connection Required" 
              : `Limit: +${maxPositiveAura} Aura`
            )
          }
        </Text>
      </AnimatedView>

      <GestureDetector gesture={gesture}>
        <View style={[styles.glassContainer, (pendingValue !== null || hasSentAura) && { opacity: 0.6 }]}>
          <Svg width={SIZE} height={SIZE}>
            <Circle cx={CENTER} cy={CENTER} r={R - 20} stroke="rgba(255,255,255,0.05)" strokeWidth={20} fill="none" />
            {[...Array(21)].map((_, i) => {
              const val = i - 10;
              const a = (val / 10) * Math.PI;
              const isLocked = (val < 0 && !canSendNegative) || val > maxPositiveAura;
              return (
                <Line
                  key={i}
                  x1={CENTER + (R - 35) * Math.sin(a)}
                  y1={CENTER - (R - 35) * Math.cos(a)}
                  x2={CENTER + (R - (val % 5 === 0 ? 55 : 45)) * Math.sin(a)}
                  y2={CENTER - (R - (val % 5 === 0 ? 55 : 45)) * Math.cos(a)}
                  stroke={isLocked ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.4)"}
                  strokeWidth={val % 5 === 0 ? 2.5 : 1}
                />
              );
            })}
            <AnimatedCircle cx={CENTER} cy={CENTER} r={60} animatedProps={centerGlowProps} />
            <AnimatedLine x1={CENTER} y1={CENTER} animatedProps={handProps} strokeWidth={3} strokeLinecap="round" />
            <Circle cx={CENTER} cy={CENTER} r={6} fill="#fff" />
          </Svg>
          <View pointerEvents="none" style={styles.content}>
            <AnimatedAuraValue aura={aura} hasSent={hasSentAura} fixedVal={sentAuraValue} />
            <Text style={styles.auraLabel}>{hasSentAura ? "SENT" : "AURA"}</Text>
          </View>
        </View>
      </GestureDetector>

      {/* CONFIRMATION MODAL */}
      {pendingValue !== null && (
        <AnimatedView entering={FadeIn} exiting={FadeOut} style={styles.confirmOverlay}>
          <AnimatedView entering={ScaleInCenter} style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Confirm Aura</Text>
            <Text style={[styles.confirmValue, { color: pendingValue > 0 ? "#00ff88" : "#ff4d4d" }]}>
              {pendingValue > 0 ? `+${pendingValue}` : pendingValue}
            </Text>
            <Text style={styles.confirmSub}>Are you sure you want to send this impact?</Text>
            
            <View style={styles.buttonRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setPendingValue(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.sendBtn, { backgroundColor: pendingValue > 0 ? "#10b981" : "#ef4444" }]} 
                onPress={handleFinalConfirm}
              >
                <Text style={styles.sendText}>Send Now</Text>
              </Pressable>
            </View>
          </AnimatedView>
        </AnimatedView>
      )}
    </View>
  );
}

function AnimatedAuraValue({ aura, hasSent, fixedVal }) {
  const [displayValue, setDisplayValue] = useState("0");
  useDerivedValue(() => {
    const v = hasSent ? fixedVal : aura.value;
    runOnJS(setDisplayValue)(v > 0 ? `+${v}` : `${v}`);
  });
  return <Text style={styles.valueText}>{displayValue}</Text>;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  glassContainer: {
    width: SIZE,
    height: SIZE,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: SIZE / 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: { position: "absolute", alignItems: "center" },
  valueText: { fontSize: 52, fontWeight: "200", color: "#fff", letterSpacing: -2 },
  auraLabel: { fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: "700", letterSpacing: 4 },
  statusPill: {
    position: "absolute",
    top: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  lockedPill: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statusText: { color: "#ef4444", fontSize: 12, fontWeight: "600" },
  lockedText: { color: "#8e8e93" },
  
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  confirmCard: {
    width: "100%",
    backgroundColor: "#1c1c1e",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  confirmTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 8 },
  confirmValue: { fontSize: 48, fontWeight: "800", marginBottom: 8 },
  confirmSub: { color: "#8e8e93", textAlign: "center", marginBottom: 24, fontSize: 14 },
  buttonRow: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, height: 50, justifyContent: "center", alignItems: "center", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.05)" },
  sendBtn: { flex: 2, height: 50, justifyContent: "center", alignItems: "center", borderRadius: 14 },
  cancelText: { color: "#fff", fontWeight: "600" },
  sendText: { color: "#fff", fontWeight: "700" },
});