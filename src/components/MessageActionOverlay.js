import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import AppText from "./AppText";

const { width, height } = Dimensions.get("window");
const REACTIONS = ["❤️", "😂", "😮", "😢", "👍"];


const MessageActionOverlay = ({
  message,
  anchor,
  isMe,
  onClose,
  onReply,
  onDelete,
  onRetry,
  onReact,
}) => {

  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);
const OVERLAY_HEIGHT = message?.status=="failed"?200:100; // approx (reactions + actions)
  useEffect(() => {
    // Smooth pop-in without vibration
    scale.value = withTiming(1, { duration: 150 });
    opacity.value = withTiming(1, { duration: 150 });
  }, []);

  const close = () => {
    opacity.value = withTiming(0, { duration: 120 });
    scale.value = withTiming(0.95, { duration: 120 }, () => {
      runOnJS(onClose)();
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Clamp position to screen
  const left = Math.min(width - 260, Math.max(12, anchor.x - 130));
 const top =
  anchor.y + OVERLAY_HEIGHT > height
    ? anchor.y - OVERLAY_HEIGHT - 16 // flip upward
    : Math.max(80, anchor.y - 90);
const clampedTop = Math.max(12, Math.min(top, height - OVERLAY_HEIGHT - 12));


  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* BACKDROP */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      {/* OVERLAY CARD */}
      <Animated.View
  style={[
    styles.container,
    containerStyle,
    { top: clampedTop, left },
  ]}
>
        {/* REACTIONS */}
      

        {/* DIVIDER */}
        <View style={styles.divider} />

        {/* ACTIONS */}
        <ActionItem
          label="Reply"
          onPress={() => {
            onReply?.();
            close();
          }}
        />

        {message.status === "failed" && (
          <ActionItem
            label="Retry"
            onPress={() => {
              onRetry?.();
              close();
            }}
          />
        )}
       
        {(message.status === "failed" && isMe) && (
          <ActionItem
            label="Delete"
            danger
            onPress={() => {
              onDelete?.();
              close();
            }}
          />
        )}
      </Animated.View>
    </View>
  );
};

const ActionItem = ({ label, onPress, danger }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.actionItem,
      pressed && styles.actionPressed,
    ]}
  >
    <AppText style={[styles.actionText, danger && { color: "#ff4d4f" }]}>
      {label}
    </AppText>
  </Pressable>
);

export default MessageActionOverlay;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  container: {
    position: "absolute",
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    minWidth: 240,
    paddingVertical: 8,
    elevation: 8,
  },
  reactionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  emojiButton: {
    padding: 6,
  },
  emoji: {
    fontSize: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 6,
  },
  actionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionPressed: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  actionText: {
    fontSize: 14,
    color: "#fff",
  },
});
