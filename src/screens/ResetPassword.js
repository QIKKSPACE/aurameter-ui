// screens/ResetPassword.js
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
import Icon from "react-native-vector-icons/Feather";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import { useToast } from "../constants/context/ErrorContext";
import AppText from "../components/AppText";

const ResetPassword = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { email,codeStr } = route.params; // from ForgotPasswordCode
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Animated toast
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {showToast} =useToast()
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      showToast("Both fields are required", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://api.aurameter.in/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password,code:codeStr }),
      });
      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to reset password", "error");
      } else {
        showToast("Password reset successful!", "success");
        setTimeout(() => navigation.navigate("Login"), 1500);
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
                Create New Password
              </AppText>
              <AppText variant="body" style={[styles.subtitle, { color: theme.text.secondary }]}>
                Enter your new password and confirm it 🔒
              </AppText>

              {/* New Password */}
              <View
                style={[styles.inputContainer, { borderColor: theme.components.border, backgroundColor: theme.components.card }]}
              >
                <TextInput
                  style={[styles.input, { color: theme.text.primary }]}
                  placeholder="New Password"
                  placeholderTextColor={theme.text.secondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color={theme.text.accent}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <View
                style={[styles.inputContainer, { borderColor: theme.components.border, backgroundColor: theme.components.card }]}
              >
                <TextInput
                  style={[styles.input, { color: theme.text.primary }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={theme.text.secondary}
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Icon
                    name={showConfirm ? "eye" : "eye-off"}
                    size={20}
                    color={theme.text.accent}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.text.accent }]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.background.color} />
                ) : (
                  <AppText variant="button" style={[styles.buttonText, { color: theme.background.color }]}>
                    Reset Password
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

export default ResetPassword;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  title: { fontSize: 24, textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 25 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },
  input: { flex: 1, fontSize: 15 },
  button: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    elevation: 4,
  },
  buttonText: { fontSize: 16, },
  
});
