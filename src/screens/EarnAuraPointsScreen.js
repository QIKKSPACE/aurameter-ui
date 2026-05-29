// screens/EarnAuraPointsScreen.js
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import Icon from "react-native-vector-icons/Feather";

const { width, height } = Dimensions.get("window");

const EarnAuraPointsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const user = useSelector((state) => state.user);

  // ── Animations ──────────────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const badgeFade = useRef(new Animated.Value(0)).current;
  const badgeSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Entrance sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(badgeFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(badgeSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    // Continuous pulse on the aura ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    // Glow flicker
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0.4, 1],
    outputRange: [0.25, 0.55],
  });

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" />

      {/* ── Ambient background orbs ── */}
      <Animated.View style={[styles.orb1, { opacity: glowOpacity }]} />
      <Animated.View style={[styles.orb2, { opacity: glowOpacity }]} />
      <View style={styles.orb3} />

      <SafeAreaView style={styles.safeArea}>

        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={20} color="#E8E0FF" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Aura Points</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Profile card ── */}
        <Animated.View
          style={[
            styles.profileCard,
            { opacity: fadeAnim, transform: [{ translateY: slideUp }] },
          ]}
        >  
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              {user?.userData?.avatar ? (
                <Image
                  source={{ uri: user?.userData?.avatar }}
                  style={styles.avatarImg}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {(user?.username ?? "?")[0].toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.profileText}>
            <Text style={styles.username}>{user?.userData?.username ?? "User"}</Text>
            <Text style={styles.userTagline}>Aura Collector</Text>
          </View>

          {/* Stat chips */}
          <View style={styles.statsRow}>
            {/* Aura chip */}
            <View style={styles.statChip}>
              <View style={styles.statChipInner}>
                <Image
                  source={require("../assets/newframe.png")}
                  style={styles.auraIcon}
                  resizeMode="contain"
                />
                <Text style={styles.statValue}>{user?.userData?.aura ?? 0}</Text>
              </View>
              <Text style={styles.statLabel}>Aura</Text>
            </View>

            <View style={styles.statDivider} />

            {/* Redeem chip */}
            <View style={styles.statChip}>
              <View style={styles.statChipInner}>
                <Icon name="star" size={15} color="#C084FC" />
                <Text style={styles.statValue}>{user?.userData?.redeemPoints ?? 0}</Text>
              </View>
              <Text style={styles.statLabel}>Redeem</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Coming Soon hero ── */}
        <View style={styles.heroSection}>
          {/* Pulsing glow ring */}
          <Animated.View
            style={[styles.glowRing, { transform: [{ scale: pulseAnim }], opacity: glowOpacity }]}
          />

          {/* Central icon */}
          <Animated.View
            style={[
              styles.heroIconWrap,
              { opacity: fadeAnim, transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Image
              source={require("../assets/newframe.png")}
              style={styles.heroAuraIcon}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Text */}
          <Animated.View
            style={[
              styles.heroTextWrap,
              {
                opacity: badgeFade,
                transform: [{ translateY: badgeSlide }],
              },
            ]}
          >
            <View style={styles.comingSoonBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.comingSoonBadgeText}>IN DEVELOPMENT</Text>
            </View>

            <Text style={styles.heroHeadline}>Coming{"\n"}Soon</Text>

            <Text style={styles.heroSubtitle}>
              Earn, collect & redeem your{"\n"}Aura points across top brands.
            </Text>
          </Animated.View>

          {/* Feature pills */}
          <Animated.View style={[styles.pillsRow, { opacity: badgeFade }]}>
            {["Earn rewards", "Top brands", "Redeem points"].map((label, i) => (
              <View key={i} style={styles.featurePill}>
                <Text style={styles.featurePillText}>{label}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* ── Notify CTA ── */}
    

      </SafeAreaView>
    </ScreenBackground>
  );
};

export default EarnAuraPointsScreen;
/*
    <Animated.View style={[styles.ctaWrap, { opacity: badgeFade }]}>
          <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
            <Icon name="bell" size={15} color="#0D0D1A" style={{ marginRight: 8 }} />
            <Text style={styles.ctaBtnText}>Notify me when live</Text>
          </TouchableOpacity>
          <Text style={styles.ctaNote}>We'll ping you the moment it launches.</Text>
        </Animated.View> */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // ── Ambient orbs
  orb1: {
    position: "absolute",
    top: -60,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#7C3AED",
  },
  orb2: {
    position: "absolute",
    bottom: 80,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#4F46E5",
  },
  orb3: {
    position: "absolute",
    top: height * 0.38,
    left: width * 0.3,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(192,132,252,0.12)",
  },

  // ── Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 10 : 4,
    marginBottom: 22,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E8E0FF",
    letterSpacing: 0.4,
  },

  // ── Profile card
  profileCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  avatarWrapper: { marginRight: 14 },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4C1D95",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#E9D5FF",
    fontSize: 20,
    fontWeight: "700",
  },
  profileText: { flex: 1 },
  username: {
    color: "#F5F0FF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  userTagline: {
    color: "#7C6FA0",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statChip: {
    alignItems: "center",
    gap: 3,
  },
  statChipInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(167,139,250,0.15)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.25)",
  },
  auraIcon: {
    width: 16,
    height: 16,
  },
  statValue: {
    color: "#E9D5FF",
    fontSize: 14,
    fontWeight: "700",
  },
  statLabel: {
    color: "#7C6FA0",
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 2,
  },

  // ── Hero
  heroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  glowRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#A78BFA",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
  },
  heroIconWrap: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(109,40,217,0.3)",
    borderWidth: 1.5,
    borderColor: "rgba(167,139,250,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 16,
  },
  heroAuraIcon: {
    width: 72,
    height: 72,
  },
  heroTextWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  comingSoonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(124,58,237,0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#A78BFA",
  },
  comingSoonBadgeText: {
    color: "#C4B5FD",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  heroHeadline: {
    fontSize: 54,
    fontWeight: "800",
    color: "#F5F0FF",
    textAlign: "center",
    lineHeight: 58,
    letterSpacing: -1.5,
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#7C6FA0",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: 0.1,
  },

  // ── Pills
  pillsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featurePill: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  featurePillText: {
    color: "#9D8EBF",
    fontSize: 12,
    fontWeight: "500",
  },

  // ── CTA
  ctaWrap: {
    paddingBottom: Platform.OS === "ios" ? 16 : 24,
    alignItems: "center",
    gap: 10,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A78BFA",
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 18,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  ctaBtnText: {
    color: "#0D0D1A",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  ctaNote: {
    color: "#4B4170",
    fontSize: 12,
    textAlign: "center",
  },
});
