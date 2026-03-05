// screens/IRLScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import ScreenBackground from "../components/ScreenBackground";
import { useTheme } from "../constants/context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

const IRLScreen = () => {
  const { theme } = useTheme();
  const navigation=useNavigation()
  return (
    <ScreenBackground>
      <View edges={["top"]} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
                      <Icon name="arrow-left" size={26} color={theme.text.primary} />
                    </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            IRL
          </Text>
          <Icon name="info" size={24} color={theme.text.primary} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Meet, Connect & Earn 
            </Text>
            <Text style={[styles.sectionText, { color: theme.text.secondary }]}>
              <Text style={{ fontWeight: "600", color: theme.text.primary }}>
                IRL (In Real Life)
              </Text>{" "}
              makes hanging out with friends **actually rewarding**.  
              When you and a friend are within{" "}
              <Text style={{ fontWeight: "600", color: theme.text.accent }}>
                10 meters
              </Text>{" "}
              of each other, start a **real-life streak** instantly by scanning
              QR codes. 
            </Text>
          </View>

          {/* Why IRL is Different */}
          <View style={[styles.section, styles.card, { backgroundColor: theme.components.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Why IRL? 🌍
            </Text>
            <View style={styles.bulletRow}>
              <Icon name="wifi-off" size={18} color={theme.text.accent} />
              <Text style={[styles.sectionText, { color: theme.text.secondary }]}>
                Social media is always online — IRL works **offline**, too.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Icon name="users" size={18} color={theme.text.accent} />
              <Text style={[styles.sectionText, { color: theme.text.secondary }]}>
                Connect face-to-face with real people, not just profiles.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Icon name="zap" size={18} color={theme.text.accent} />
              <Text style={[styles.sectionText, { color: theme.text.secondary }]}>
                Earn streaks & rewards by just being together 
              </Text>
            </View>
          </View>

          {/* Beyond Streaks */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              More Than Streaks 
            </Text>
            <Text style={[styles.sectionText, { color: theme.text.secondary }]}>
              IRL is also your pass to{" "}
              <Text style={{ fontWeight: "600", color: theme.text.primary }}>
                Aura rewards
              </Text>.  
              Check in at{" "}
              <Text style={{ fontWeight: "600", color: theme.text.accent }}>
                cafes, cinemas, parks, and partner stores
              </Text>{" "}
              by scanning an{" "}
              <Text style={{ fontWeight: "600", color: theme.text.primary }}>
                Aurameter QR
              </Text>.  
              Boom  — Aura instantly added to your account.
            </Text>
          </View>

          {/* How it Works */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              How It Works 
            </Text>
            <View style={styles.bulletRow}>
              <Icon name="smartphone" size={18} color={theme.text.accent} />
              <Text style={[styles.sectionText, { color: theme.text.secondary }]}>
                Show your QR code to your friend
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Icon name="camera" size={18} color={theme.text.accent} />
              <Text style={[styles.sectionText, { color: theme.text.secondary }]}>
                They scan it with their app
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Icon name="zap" size={18} color={theme.text.accent} />
              <Text style={[styles.sectionText, { color: theme.text.secondary }]}>
                A streak is born instantly 
              </Text>
            </View>
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <Image
              source={{
                uri: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=IRL_DUMMY",
              }}
              style={styles.qrImage}
            />
            <Text style={[styles.qrLabel, { color: theme.text.secondary }]}>
              Your IRL QR Code
            </Text>
          </View>

          {/* Scan Button */}
          <View style={styles.scanContainer}>
            <TouchableOpacity
              style={[
                styles.scanButton,
                { backgroundColor: theme.components.card },
              ]}
            >
              <Icon name="camera" size={22} color={theme.text.primary} />
              <Text style={[styles.scanText, { color: theme.text.primary }]}>
                Scan QR
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ScreenBackground>
  );
};

export default IRLScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 15,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
  },
  section: {
    marginHorizontal: 20,
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },
  qrContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  qrLabel: {
    fontSize: 14,
    marginTop: 10,
  },
  scanContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scanText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
