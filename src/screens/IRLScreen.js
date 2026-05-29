import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useTheme } from "../constants/context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import ScreenBackground from "../components/ScreenBackground";
// Note: Using standard View if LinearGradient isn't installed, 
// but highly recommend 'expo-linear-gradient' for the "Hell Premium" look.

const { width } = Dimensions.get("window");

const PremiumIRLScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  // Animation Scales
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lockAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous Radar Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const FeatureCard = ({ icon, title, desc }) => (
    <View style={[styles.premiumCard, { backgroundColor: theme.components.card, borderColor: theme.text.accent + '33' }]}>
      <View style={[styles.iconCircle, { backgroundColor: theme.text.accent + '15' }]}>
        <Icon name={icon} size={20} color={theme.text.accent} />
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.cardTitle, { color: theme.text.primary }]}>{title}</Text>
        <Text style={[styles.cardDesc, { color: theme.text.secondary }]}>{desc}</Text>
      </View>
    </View>
  );

  return (
    <ScreenBackground>
      <View style={{ flex: 1 }}>
        {/* Header: Minimal & Floating */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: theme.components.card }]}
          >
            <Icon name="chevron-left" size={24} color={theme.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Aura IRL</Text>
          <TouchableOpacity>
            <Icon name="help-circle" size={22} color={theme.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroBadge, { color: theme.text.accent, backgroundColor: theme.text.accent + '20' }]}>
              GENESIS PHASE
            </Text>
            <Text style={[styles.heroTitle, { color: theme.text.primary }]}>
              The Physical{"\n"}<Text style={{ color: theme.text.accent }}>Proof of Social.</Text>
            </Text>
          </View>

          {/* Interactive QR Radar */}
          <View style={styles.radarContainer}>
            <Animated.View style={[styles.pulseRing, { 
              borderColor: theme.text.accent, 
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({ inputRange: [1, 1.1], outputRange: [0.3, 0] }) 
            }]} />
            
            <View style={[styles.qrWrapper, { shadowColor: theme.text.accent }]}>
              <Image
                source={{ uri: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=LOCKED&color=6366f1" }}
                style={[styles.qrImage, { opacity: 0.2, filter: 'blur(10px)' }]} // Blurred for Coming Soon
              />
              
              {/* Coming Soon Overlay */}
              <View style={styles.lockOverlay}>
                <Icon name="lock" size={32} color={theme.text.accent} />
                <Text style={[styles.lockText, { color: theme.text.primary }]}>UNLOCKING SOON</Text>
                <View style={[styles.countdownBar, { backgroundColor: theme.text.accent + '30' }]}>
                   <View style={[styles.countdownFill, { backgroundColor: theme.text.accent, width: '70%' }]} />
                </View>
              </View>
            </View>
          </View>

          {/* Value Propositions */}
          <View style={styles.featuresGrid}>
            <FeatureCard 
              icon="map-pin" 
              title="Hyper-Local" 
              desc="10m precision proximity detection for genuine interactions." 
            />
            <FeatureCard 
              icon="zap" 
              title="Aura Multiplier" 
              desc="Boost your social standing by visiting verified Aurameter hubs." 
            />
            <FeatureCard 
              icon="shield" 
              title="Encrypted Streaks" 
              desc="Your real-world connections, secured by Genesis protocols." 
            />
          </View>

          {/* Premium CTA */}
        

        </ScrollView>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    height: 80,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  heroBadge: {
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: 'center',
    lineHeight: 38,
  },
  radarContainer: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
  },
  qrWrapper: {
    width: 220,
    height: 220,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  qrImage: {
    width: 160,
    height: 160,
    borderRadius: 10,
  },
  lockOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  lockText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
    letterSpacing: 1,
  },
  countdownBar: {
    width: 120,
    height: 4,
    borderRadius: 2,
    marginTop: 15,
    overflow: 'hidden',
  },
  countdownFill: {
    height: '100%',
    borderRadius: 2,
  },
  featuresGrid: {
    gap: 15,
    marginBottom: 30,
  },
  premiumCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  mainCta: {
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default PremiumIRLScreen;