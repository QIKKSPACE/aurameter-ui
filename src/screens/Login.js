// screens/Login.js
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
  Image,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import IconL from "react-native-vector-icons/Octicons";

import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import AppText from "../components/AppText";

import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/userSlice";

const Login = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Animated toast
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const user=useSelector(state=>state.user)

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
const deviceId = useSelector(
  state => state.device.deviceId
);
  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!username || !password) {
      showError("Username/email and password are required");
      return;
    }

    setLoading(true);
    try {
      console.log("Logging in with:", { username, password, deviceId });
      const response = await fetch("https://api.aurameter.in/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password, deviceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Login failed");
      } else {
        console.log(data)
        dispatch(
          setUser({
            userData: data.user,
            token: data.accessToken,
            refreshToken: data.refreshToken,
          })
        );
        //navigation.navigate("MainTabs");
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
      <View style={styles.safeArea} edges={["top", "bottom"]}>
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
             <AppText variant="h2" style={{textAlign:'center',marginBottom:30}}>Aurameter Login</AppText>
              {/* Username */}
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: theme.components.card, borderColor: theme.components.border },
                ]}
              >
                <Icon name="user" size={20} color={theme.text.secondary} />
                <TextInput
                  style={[styles.input, { color: theme.text.primary }]}
                  placeholder="Username or Email"
                  placeholderTextColor={theme.text.secondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              {/* Password */}
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

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: theme.text.accent }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.background.color} />
                ) : (
                  <AppText variant="button" style={[styles.loginText, { color: theme.background.color }]}>Log In</AppText>
                )}
              </TouchableOpacity>

              {/* Footer Links */}
    <View style={styles.footerLinks}>
  
  {/* PRIMARY CTA */}
  <TouchableOpacity 
    onPress={() => navigation.navigate("ChooseUsername")} 
    style={styles.primaryRow}
  >
    <IconL name="sign-in" size={20} color={theme.text.accent} />
    <AppText variant="caption" style={{ color: theme.text.accent, marginLeft: 8,fontSize:16 }}>
      Signup To Enter Auraverse
    </AppText>
   
  </TouchableOpacity>

  {/* SECONDARY ACTION */}
  <TouchableOpacity 
    onPress={() => navigation.navigate("ForgotPasswordEmail")} 
    style={styles.secondaryRow}
  >
    <Icon name="key" size={16} color={theme.text.secondary} />
    <AppText variant="caption" style={{ color: theme.text.secondary, marginLeft: 8,fontSize:16 }}>
      Reset Password
    </AppText>
  </TouchableOpacity>

</View>


            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenBackground>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center" },
  container: { paddingHorizontal: 20 },
  title: { fontSize: 26, textAlign: "center", marginBottom: 30 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginBottom: 18,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15 },
  loginButton: {
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
  loginText: { fontSize: 16 },
  footerLinks: {
    marginTop: 25,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom:20,
  },
  link: { fontSize: 16, marginBottom: 10 },
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
  toastText: { color: "#FF4D4F", fontWeight: "600", fontSize: 14 },
     loginImage: {
    width:'100%' ,   // takes 70% width of screen
    height: 160,    // adjust height as needed
    alignSelf: "center",
    marginBottom: 10,
  },
   footerLinks: {
    alignItems:'center',
    marginTop: 28,
    gap: 16, // consistent spacing
  },

  primaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  secondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.8,
  },
});
