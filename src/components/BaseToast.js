import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");
const HIDDEN_Y = -120;

export const BaseToast = ({
  visible,
  avatar,
  username,
  message,
  duration = 5000,
  onPress,
  onHide,
}) => {
  /* ───────── shared values ───────── */
  const entranceY = useSharedValue(HIDDEN_Y);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  /* ───────── timer ───────── */
  const timeoutRef = useRef(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  /* ───────── reset ───────── */
  const resetValues = () => {
    cancelAnimation(entranceY);
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    cancelAnimation(opacity);

    entranceY.value = HIDDEN_Y;
    translateX.value = 0;
    translateY.value = 0;
    opacity.value = 0;
  };

  /* ───────── hide ───────── */
  const hideToast = (callback) => {
    clearTimer();

    entranceY.value = withTiming(HIDDEN_Y, { duration: 200 });
    opacity.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished && callback) {
        runOnJS(callback)();
      }
    });
  };

  /* ───────── show ───────── */
  const showToast = () => {
    clearTimer();
    resetValues();

    entranceY.value = withTiming(0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });

    opacity.value = withTiming(1, { duration: 160 });

    timeoutRef.current = setTimeout(() => {
      hideToast(onHide);
    }, duration);
  };

  /* ───────── lifecycle ───────── */
  const messageKey = `${avatar}-${username}-${message}`;

  useEffect(() => {
    if (visible) {
      showToast();
    } else {
      hideToast(onHide);
    }

    return clearTimer;
  }, [visible, messageKey]);

  /* ───────── pan gesture ───────── */
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const dismiss =
        Math.abs(e.translationX) > width * 0.25 ||
        Math.abs(e.translationY) > 60;

      if (dismiss) {
        runOnJS(hideToast)(onHide);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  /* ───────── animated style ───────── */
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: entranceY.value + translateY.value },
      { translateX: translateX.value },
    ],
  }));

  if (!visible) return null;

  /* ───────── render ───────── */
  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <Animated.View>
          <TouchableWithoutFeedback
            onPress={() => {
              hideToast(onHide);
              onPress?.();
            }}
          >
            <View style={styles.toast}>
             <Image
  source={typeof avatar === "string" ? { uri: avatar } : avatar}
  style={styles.avatar}
/>
              <View style={styles.textContainer}>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.message} numberOfLines={2}>
                  {message}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: "#1f1f1f",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  username: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  message: {
    color: "#dcdcdc",
    fontSize: 13,
    marginTop: 2,
  },
});
