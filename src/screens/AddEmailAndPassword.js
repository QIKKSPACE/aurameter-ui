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
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import AppText from "../components/AppText";

const AddEmailAndPassword = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { username } = route.params;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSignup = async () => {
    Keyboard.dismiss()
    if (!email || !password || !rePassword) {
      showError("All fields are required");
      return;
    }

    if (password !== rePassword) {
      showError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://api.aurameter.in/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Signup failed");
      } else {
        navigation.navigate("VerifyEmail", { user:data.user,accessToken:data.accessToken,refreshToken:data.refreshToken  });
      }
    } catch (err) {
      console.error(err);
      showError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.safeArea} >
        {/* Toast Error */}
      {error ? (
              <Animated.View
                 style={[
                       {
                         position: "absolute",
                         top: 20,
                         left: "50%",
                         transform: [
                           { translateX: -150 },
                           { translateY: slideAnim },
                         ],
                         width: 300,
                         paddingVertical: 18,
                         paddingHorizontal: 16,
                         backgroundColor:
                           theme.components.card
                             ?  theme.components.card
                             : "rgba(35, 20, 20, 0.12)",
                         borderRadius: 14,
                         flexDirection: "row",
                         alignItems: "center",
                         backdropFilter: "blur(6px)", // ignored on Android but fine
                         opacity: fadeAnim,
                       },
                     ]}
              >
                <Icon
                  name="alert-circle"
                  size={18}
                  color="#FF4D4F"
                  style={{ marginRight: 8 }}
                />
                <AppText variant="caption" style={{ color: theme.text.primary }}>
                  {error}
                </AppText>
              </Animated.View>
            ) : null}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <AppText variant="h2" style={[{ color: theme.text.primary,textAlign:'center' }]}>
                Secure Your Account
              </AppText>
              <AppText variant="caption" style={[styles.subtitle, { color: theme.text.secondary }]}>
                Add your email and password
              </AppText>

              {/* Email Field */}
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: theme.components.card, borderColor: theme.components.border },
                ]}
              >
                <Icon name="mail" size={20} color={theme.text.secondary} />
                <TextInput
                  style={[styles.input, { color: theme.text.primary }]}
                  placeholder="Email address"
                  placeholderTextColor={theme.text.secondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Password Field */}
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: theme.components.card, borderColor: theme.components.border },
                ]}
              >
                <Icon name="lock" size={20} color={theme.text.secondary} />
                <TextInput
                  style={[styles.input, { color: theme.text.primary }]}
                  placeholder="Password"
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

              {/* Re-enter Password */}
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: theme.components.card, borderColor: theme.components.border },
                ]}
              >
                <Icon name="lock" size={20} color={theme.text.secondary} />
                <TextInput
                  style={[styles.input, { color: theme.text.primary }]}
                  placeholder="Re-enter Password"
                  placeholderTextColor={theme.text.secondary}
                  secureTextEntry={!showPassword}
                  value={rePassword}
                  onChangeText={setRePassword}
                />
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.text.accent }]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.background.color} />
                ) : (
                  <AppText variant="button" style={[{ color: theme.background.color }]}>
                    Finish
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

export default AddEmailAndPassword;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center" },
  container: { paddingHorizontal: 20 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 30,
    marginTop:10
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 18,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15 },
  button: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
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
