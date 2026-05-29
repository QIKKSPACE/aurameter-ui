// screens/ThemeOnboardingScreen.js
import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../constants/context/ThemeContext";
import { themes } from "../constants/themes";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenBackground from "../components/ScreenBackground";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
import AppText from "../components/AppText";
import api from "../services/api";
import { useToast } from "../constants/context/ErrorContext";
import axios from "axios";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { isThemeUnlocked } from "../constants/themeLocks";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = CARD_WIDTH * 1.3;
const SPACING = 20;

/* 🔹 Background Renderer */
const BackgroundPreview = React.memo(({ background }) => {
  if (!background) return null;

  return (
    <View style={styles.backgroundWrapper}>
      {background.type === "image" && background.image && (
        <Image
          source={
            typeof background.image === "string"
              ? { uri: background.image }
              : background.image
          }
          style={styles.fullImage}
          resizeMode="contain"
        />
      )}
      {background.type === "gradient" && background.gradient && (
        <LinearGradient colors={background.gradient} style={styles.fullImage} />
      )}
      {background.type === "color" && background.color && (
        <View
          style={[styles.fullImage, { backgroundColor: background.color }]}
        />
      )}
    </View>
  );
});

/* 🔹 Theme Card

  dispatch(
          setUser({
            userData: { id: data.user.id, username: data.user.username, email: data.user.email },
            token: data.accessToken,
            refreshToken: data.refreshToken,
          })*/
const ThemeCard = React.memo(
  ({ item, index, scrollX, selected, onSelect, setTheme }) => {
    const unlocked = isThemeUnlocked(item.id);
    const inputRange = [
      (index - 1) * (CARD_WIDTH + SPACING),
      index * (CARD_WIDTH + SPACING),
      (index + 1) * (CARD_WIDTH + SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[styles.cardWrapper, { transform: [{ scale }], opacity }]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (!unlocked) return;
            onSelect(item.id);
            setTheme(item.id); // 👈 still triggers live theme change globally
          }}
        >
          <View style={styles.card}>
            <BackgroundPreview background={item.background} />

            {/* Overlay Info */}
            <View
              style={[
                styles.overlay,
                { backgroundColor: item.overlayColor || "rgba(0,0,0,0.35)" },
              ]}
            >
              <Text
                style={[
                  styles.themeName,
                  { color: item.textColor || "#FFF" },
                ]}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  styles.themeType,
                  { color: item.subTextColor || "#BBB" },
                ]}
            >
              {item.type}
              </Text>
            </View>

            {!unlocked && (
              <View style={styles.lockBadge}>
                <MaterialIcon name="lock-outline" size={18} color="#fff" />
              </View>
            )}

            {/* Glow for selected theme */}
            {selected === item.id && unlocked && (
              <LinearGradient
                colors={["#00E5FF", "#A45EE5"]}
                style={styles.activeGlow}
              />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

/* 🔹 Memoized FlatList (fully detached from context) */
const ThemeCarousel = React.memo(
  ({ themeList, scrollX, selected, onSelect, setTheme }) => {
    return (
      <Animated.FlatList
        data={themeList}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        bounces={false}
        removeClippedSubviews={false}
        initialNumToRender={3}
        contentContainerStyle={{
          paddingHorizontal: (width - CARD_WIDTH) / 2,
          alignItems: "center",
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => (
          <ThemeCard
            item={item}
            index={index}
            scrollX={scrollX}
            selected={selected}
            onSelect={onSelect}
            setTheme={setTheme}
          />
        )}
      />
    );
  }
);

/* 🔹 Main Screen */
const ThemeOnboardingScreen = ({ navigation,route }) => {
  const { setTheme, themeId } = useTheme();
  const [selected, setSelected] = useState(themeId || "dark");
  const scrollX = useRef(new Animated.Value(0)).current;
  const { user,accessToken,refreshToken,campusId } = route.params;

  // ✅ Create a local snapshot once — this never changes
  const themeListRef = useRef(Object.values(themes));
  const themeList = themeListRef.current;
 const dispatch=useDispatch()
  // Use selected theme for background only (not affecting FlatList)
  const currentTheme = themes[selected] || themes["dark"];
  console.log(accessToken,"token",refreshToken,campusId)
  const [isOnboarding,setIsOnboarding]=useState(false)
  const { showToast } = useToast();
  
  const handleActivate = useCallback(async () => {
  if (!isThemeUnlocked(selected)) {
    showToast("This theme is locked right now", "error");
    return;
  }
  setIsOnboarding(true);

  try {
    const res = await axios.post(
      "http://localhost:5001/auth/complete-onboarding/",
      { themeId: selected, campusId },          // request body
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // include token directly
        },
      }
    );



    setIsOnboarding(false);

    if (res.data.success) {
      dispatch(
               setUser({
                 userData: { id: user.id, username: user.username, email:user.email,campusId },
                 token: accessToken,
                 refreshToken:refreshToken,
               })
              )
    } else {
      showToast(res.data.error || "Something went wrong", "error");
    }
  } catch (err) {
    console.error("Onboarding error:", err);
    setIsOnboarding(false);
    showToast("Something went wrong", "error");
  }
}, [selected, campusId, accessToken, dispatch, refreshToken, showToast, user]);

  return (
    <ScreenBackground>
      <View style={styles.container}>
        {/* Screen Background */}
        {currentTheme.type === "gradient" && currentTheme.gradient && (
          <LinearGradient
            colors={currentTheme.gradient}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Titles */}
        <AppText
          style={[styles.title, { color: currentTheme.text.primary || "#FFF" }]}
          variant="h2"
        >
         Pick Your Theme
        </AppText>
        <AppText
        variant="body"
          style={[
            styles.subtitle,
            { color: currentTheme.text.primary || "#AAA" },
          ]}
        >
          Let your aura decide your color
        </AppText>

        {/* Carousel (never remounts) */}
        <View style={{ height: CARD_HEIGHT + 40 }}>
          <ThemeCarousel
            themeList={themeList}
            scrollX={scrollX}
            selected={selected}
            onSelect={setSelected}
            setTheme={setTheme}
          />
        </View>

        {/* Activate Button */}
        <TouchableOpacity style={styles.activateBtn} onPress={()=>handleActivate()} disabled={isOnboarding}>
          <LinearGradient
            colors={currentTheme.gradients.tab || ["#00E5FF", "#A45EE5"]}
            style={styles.activateGradient}
          >
            <AppText
            variant="button"
              style={[
                styles.activateText,
                { color: currentTheme.text.primary || "#FFF" },
              ]}
            >
              {isOnboarding?"Preparing Your Profile":"Activate This Theme"}
             
            </AppText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
};

export default ThemeOnboardingScreen;

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
  
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 30,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: SPACING / 2,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  backgroundWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
  },
  themeName: {
    fontSize: 20,
    fontWeight: "700",
  },
  themeType: {
    fontSize: 13,
    marginTop: 3,
  },
  activeGlow: {
    position: "absolute",
    bottom: 0,
    height: 5,
    width: "100%",
  },
  lockBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.46)",
    alignItems: "center",
    justifyContent: "center",
  },
  activateBtn: {
    position: "absolute",
    bottom: 40,
    width: "80%",
  },
  activateGradient: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  activateText: {
    fontSize: 16,

  },
});
