// screens/StepTrackerScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";


 
const StepTrackerScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <ScreenBackground>
      <View edges={["top"]} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={26} color={theme.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            Take A Walk <Text style={{ color: theme.text.accent }}>👣</Text>
          </Text>
        </View>

        {/* Top Illustration */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/girl_running.png")} // ⚡ make sure filename matches your assets
            style={styles.girlImage}
            resizeMode="contain"
          />
          <Image
            source={require("../assets/Ellipse_112.png")} // ⚡ same here
            style={styles.shadowImage}
            resizeMode="contain"
          />
        </View>

        {/* Title & Subtitle */}
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Step Tracker 
        </Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Sync your steps to earn{" "}
          <Text style={{ color: theme.text.accent }}>+5 Aura</Text> daily
        </Text>

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.button, { borderColor: theme.text.accent }]}
        >
          <Text style={[styles.buttonText, { color: theme.text.primary }]}>
            Track & Earn Aura
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { borderColor: theme.text.accent }]}
        >
          <Text style={[styles.buttonText, { color: theme.text.primary }]}>
            Watch Tutorial
          </Text>
        </TouchableOpacity>

        {/* Help link */}
        <TouchableOpacity>
          <Text style={[styles.helpText, { color: theme.text.accent }]}>
            Need Help?
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
};

export default StepTrackerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  girlImage: {
    width: 90,
    height: 90,
    position: "absolute",
    zIndex: 2,
  },
  shadowImage: {
    width: 160,
    height: 20,
    marginTop: 70,
    zIndex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 40,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    width: "80%",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  helpText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 20,
  },
});
