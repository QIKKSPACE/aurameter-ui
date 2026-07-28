// screens/ForgotPasswordCode.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import { useToast } from "../constants/context/ErrorContext";
import AppText from "../components/AppText";

const ForgotPasswordCode = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { email } = route.params;
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputs = useRef([]);
  const {showToast}=useToast()
  // Animated toast
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  // Handle backspace like Instagram
  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputs.current[index - 1].focus();
    }
  };

  const handleVerifyCode = async () => {
    const codeStr = code.join("");
    if (codeStr.length !== 6) {
      showToast("Please enter the 6-digit code", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://api.aurameter.in/auth/verify-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeStr }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Invalid code", "error");
      } else {
        //showToast("Code verified!", "success");
        navigation.navigate("ResetPassword", { email,codeStr });
      }
    } catch (err) {
      console.error(err);
      showToast("Unable to connect to server", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.safeArea} edges={["top", "bottom"]}>
      

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <AppText variant="h3"
              style={[styles.title, { color: theme.text.primary }]}>
                Enter Verification Code
              </AppText>
              <AppText variant="body"
              style={[styles.subtitle, { color: theme.text.secondary }]}>
                Check your email and enter the 6-digit code 🔑
              </AppText>

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
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.text.accent }]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.background.color} />
                ) : (
                  <AppText style={[styles.buttonText, { color: theme.background.color }]} variant="button">
                    Verify Code
                  </AppText>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenBackground>
  );
};

export default ForgotPasswordCode;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  title: { fontSize: 24, textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 25 },
  codeContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  button: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    elevation: 4,
  },
  buttonText: { fontSize: 16 },
 
});
