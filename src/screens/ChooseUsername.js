import React, { useState, useRef, useEffect } from "react";
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
  Image,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import AppText from "../components/AppText";
import { useToast } from "../constants/context/ErrorContext";
const ChooseUsername = ({ navigation }) => {
  const { theme } = useTheme();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const { showToast } = useToast();

  // Animated value for toast
  const slideAnim = useRef(new Animated.Value(-80)).current; // Start above the screen
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showError = (message) => {
    setError(message);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hide after 3 seconds
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -80,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setError(""));
      }, 3000);
    });
  };

  const isValidUsername = (text) => {
  const cleaned = text.toLowerCase();
  const regex = /^[a-z0-9._]+$/;
  return regex.test(cleaned);
};

const checkUsername = async () => {
  Keyboard.dismiss();

  if (!username) {
    showError("Username cannot be empty");
    return;
  }
 if (username.length<5) {
    showToast("Username mustn't be less than 5 character","error");
    return;
  }
  if (!isValidUsername(username)) {
    showToast("Username can only contain letters, numbers, '.' and '_'.", "error");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("https://api.aurameter.in/auth/check-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || "Something went wrong");
    } else if (data.available) {
      navigation.navigate("AddEmailAndPassword", { username });
    } else {
      showError("Username is already taken");
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
      <View style={styles.safeArea}>
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

                              <Image
                          source={require("../assets/login.png")}
                          style={styles.loginImage}
                          resizeMode="contain"
                        />
              {/* Title */}
              <AppText  variant="h2" style={[{ color: theme.text.primary,textAlign:'center' }]}>
                Choose a Username
              </AppText>
              <AppText  variant="caption"style={[styles.subtitle, { color: theme.text.secondary }]}>
                This will be your unique identity
              </AppText>

              {/* Username Field */}
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.components.card,
                    borderColor: theme.components.border,
                  },
                ]}
              >
                <Icon name="user" size={20} color={theme.text.secondary} />
                <TextInput
                  style={[styles.input, { color: theme.text.primary }]}
                  placeholder="Enter username"
                  placeholderTextColor={theme.text.secondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.text.accent }]}
                onPress={checkUsername}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.background.color} />
                ) : (
                  <AppText variant="button"style={[styles.buttonText, { color: theme.background.color }]}>
                    Continue
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

export default ChooseUsername;

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
  buttonText: { fontSize: 16 },
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
   loginImage: {
    width:'100%' ,   // takes 70% width of screen
    height: 160,    // adjust height as needed
    alignSelf: "center",
    marginBottom: 10,
  },
});
