// screens/ForgotPasswordEmail.js
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
import AppText from "../components/AppText";
import { useToast } from "../constants/context/ErrorContext";

const ForgotPasswordEmail = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Animated toast
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
   const {showToast}=useToast()

  const handleSendCode = async () => {
    if (!email) {
      showToast("Please enter your email", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to send reset code", "error");
      } else {
        //showToast("Verification code sent to your email", "success");
        navigation.navigate("ForgotPasswordCode", { email });
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
              <AppText style={[styles.title, { color: theme.text.primary }]} variant="h3">
                Reset Your Password
              </AppText>
              <AppText style={[styles.subtitle, { color: theme.text.secondary }]} variant="body">
                Enter your registered email address
              </AppText>

              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: theme.components.border,
                    backgroundColor: theme.components.card,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: theme.text.primary }]}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.text.secondary}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.text.accent }]}
                onPress={handleSendCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.background.color} />
                ) : (
                  <AppText
                  variant="button"
                    style={[styles.buttonText, { color: theme.background.color }]}
                  >
                    Send Code
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

export default ForgotPasswordEmail;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  title: { fontSize: 24, textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 25 },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },
  input: { fontSize: 15 },
  button: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    elevation: 4,
  },
  buttonText: { fontSize: 16, },
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
  toastText: { fontWeight: "600", fontSize: 14 },
});
