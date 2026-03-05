import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import AppText from "../components/AppText";
import { useSelector } from "react-redux";
import api from "../services/api";
import { useToast } from "../constants/context/ErrorContext";

const UpdateEmailScreen = ({navigation}) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const userdata=useSelector(state =>state.user.userData)
  const [sending,setSending]=useState(false)
  const showToast=useToast()
  useEffect(()=>{
setEmail(userdata.email)
  },[])
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

  const handleRequestVerification =  async() => {
    Keyboard.dismiss();
    if (!email) {
      showError("Please enter an email");
      return;
    }
    try {
         setSending(true)
         const  res= await api.post("/updateEmail",{email})
          console.log(res)
    if(res?.data?.success)
    {
    navigation.navigate("VerifyEmailUpdate")
         setSending(false)

    }
    else
    {
         setSending(false)

        showError(res.data?.message)
    }
    } catch (error) {
         setSending(false)

        showError("Something Went Wrong")
        
    }
   
    
  };

  return (
    <ScreenBackground>
      <View style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Toast Error */}
        {error ? (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 20,
                left: "50%",
                transform: [{ translateX: -150 }, { translateY: slideAnim }],
                width: 300,
                paddingVertical: 18,
                paddingHorizontal: 16,
                backgroundColor: theme.components.card || "rgba(35, 20, 20, 0.12)",
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                backdropFilter: "blur(6px)",
                opacity: fadeAnim,
              },
            ]}
          >
            <Icon name="alert-circle" size={18} color="#FF4D4F" style={{ marginRight: 8 }} />
            <AppText variant="caption" style={{ color: theme.text.primary }}>
              {error}
            </AppText>
          </Animated.View>
        ) : null}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              <AppText variant="h2" style={[{ color: theme.text.primary, textAlign: "center" }]}>
                Update Email
              </AppText>
              <AppText variant="caption" style={[styles.subtitle, { color: theme.text.secondary }]}>
                Enter your new email address to receive verification
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
                  placeholder="New Email Address"
                  placeholderTextColor={theme.text.secondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Request Verification Button */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.text.accent }]}
                onPress={handleRequestVerification}
                disabled={sending}
              >
                {sending?<ActivityIndicator size={"small"} />:   <AppText variant="button" style={{ color: theme.background.color }}>
                  Request Verification
                </AppText>}
             
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenBackground>
  );
};

export default UpdateEmailScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center" },
  container: { paddingHorizontal: 20 },
  subtitle: { fontSize: 15, textAlign: "center", marginBottom: 30, marginTop: 10 },
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
});
