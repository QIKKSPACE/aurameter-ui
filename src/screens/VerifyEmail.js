// screens/VerifyEmail.js
import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import Icon from "react-native-vector-icons/Feather";
import { useFocusEffect } from "@react-navigation/native";
import AppText from "../components/AppText";

const VerifyEmail = ({ navigation, route }) => {
  const { user,accessToken,refreshToken } = route.params;
  const { theme } = useTheme();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputs = useRef([]);

  // Animated values for toast
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showError = (message) => {
    setError(message);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 20, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, { toValue: -80, duration: 300, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => setError(""));
      }, 3000);
    });
  };

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < code.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      showError("Enter full 6-digit code");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/auth/verify-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email:user.email, code: fullCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Verification failed");
        return;
      }
       
       navigation.navigate("PickCampus", { user:data,user,accessToken:data.accessToken,refreshToken:data.refreshToken });

    } catch (err) {
      console.error("verifySignup error:", err);
      showError("Server error, please try again later");
    }
  };  
useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      // Block back action
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove(); // ✅ use remove() on subscription
  }, [])
);
  return (
    <ScreenBackground>
      <View style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Toast Error */}
        {error ? (
          <Animated.View
            style={[
              styles.toast,
              {
                backgroundColor: "#FFF1F0",
                borderColor: "#FF4D4F",
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <Icon name="alert-circle" size={18} color="#FF4D4F" style={{ marginRight: 6 }} />
            <Text style={styles.toastText}>{error}</Text>
          </Animated.View>
        ) : null}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              {/* Title */}
              <AppText style={[styles.title, { color: theme.text.primary }]} variant="h3">
                Verify Your Email
              </AppText>
              <AppText style={[styles.subtitle, { color: theme.text.secondary }]} variant="body">
                Enter the 6-digit code sent to your email.
              </AppText>

              {/* Code Inputs */}
              <View style={styles.codeContainer}>
               {code.map((digit, index) => (
  <TextInput
    key={index}
    ref={(el) => (inputs.current[index] = el)}
    style={[
      styles.codeInput,
      {
        borderColor: theme.components.border,
        backgroundColor: theme.components.card,
        color: theme.text.primary,
      },
    ]}
    keyboardType="number-pad"
    maxLength={1}
    value={digit}
    onChangeText={(text) => {
      const newCode = [...code];
      newCode[index] = text.slice(-1); // ensure only 1 char
      setCode(newCode);

      if (text && index < code.length - 1) {
        inputs.current[index + 1].focus();
      }
    }}
    onKeyPress={({ nativeEvent }) => {
      if (nativeEvent.key === "Backspace") {
        const newCode = [...code];

        if (digit) {
          // Clear current box
          newCode[index] = "";
          setCode(newCode);
        } else if (index > 0) {
          // Move to previous box and clear it
          newCode[index - 1] = "";
          setCode(newCode);
          inputs.current[index - 1].focus();
        }
      }
    }}
  />
))}

              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.verifyButton, { backgroundColor: theme.text.accent }]}
                onPress={handleVerify}
              >
                <AppText style={[styles.verifyText, { color: theme.background.color }]} variant="button">
                  Verify
                </AppText>
              </TouchableOpacity>

              {/* Skip Button */}
              <View style={styles.skipContainer}>
                <TouchableOpacity
                  style={[styles.skipButton, { backgroundColor: theme.components.card }]}
                  onPress={() => {
       navigation.navigate("PickCampus", { user,accessToken,refreshToken });

                  }}
                >
                  <AppText style={[styles.skipText, { color: theme.text.accent }]} variant="button">Skip</AppText>
                  <Icon name="arrow-right" size={18} color={theme.text.accent} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenBackground>
  );
};

export default VerifyEmail;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 25,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  verifyButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  verifyText: {
    fontSize: 16,
  },
  skipContainer: {
    position: "absolute",
    bottom: 25,
    right: 20,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  skipText: {
    fontSize: 14,
    marginRight: 6,
  },
  toast: {
    position: "absolute",
    top: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  toastText: {
    color: "#FF4D4F",
    fontWeight: "600",
    fontSize: 14,
  },
});
