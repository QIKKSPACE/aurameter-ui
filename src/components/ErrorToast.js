import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import FeatherIcon from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import AppText from "./AppText";

const ErrorToast = ({ type = "success", message, theme, toastKey }) => {
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  // Use a unique key to retrigger toast when message changes
  const effectiveKey = toastKey ?? message ?? Date.now();

useEffect(() => {
  if (!message) return;

  // Reset values immediately
  slideAnim.stopAnimation();
  fadeAnim.stopAnimation();
  slideAnim.setValue(-20);
  fadeAnim.setValue(0);
  setVisible(true);

  // Animate in
  Animated.parallel([
    Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
  ]).start();

  // Auto-hide
  const timeout = setTimeout(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -20, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  }, 3000);

  return () => clearTimeout(timeout);
}, [effectiveKey, message]);


  if (!visible) return null;

  const isError = type === "error";
  const iconName = isError ? "alert-circle" : "check-circle";
  const iconColor = isError ? "#FF4D4F" : "#52c41a";
  const bgColor = isError
    ? theme?.components?.card || "rgba(35, 20, 20, 0.12)"
    : theme?.components?.card || "rgba(35, 100, 35, 0.12)";

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -20, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }], opacity: fadeAnim, backgroundColor: bgColor },
      ]}
    >
      <FeatherIcon name={iconName} size={18} color={iconColor} style={{ marginRight: 8 }} />
      <AppText variant="caption" style={{ color: theme?.text?.primary || "#000", flex: 1 }}>
        {message}
      </AppText>
      <TouchableOpacity onPress={handleClose} style={{ marginLeft: 8 }}>
        <Ionicons name="close" size={18} color={theme?.text?.primary || "#000"} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    left: "50%",
    marginLeft: -150,
    width: 300,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1000,
  },
});

export default ErrorToast;
