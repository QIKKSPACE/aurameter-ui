// screens/ThemeSelectionScreen.js
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
} from "react-native";
import { useTheme } from "../constants/context/ThemeContext";
import { themes } from "../constants/themes";
import ScreenBackground from "../components/ScreenBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import LinearGradient from "react-native-linear-gradient";
import AppText from "../components/AppText";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import api from "../services/api";

// 🔹 Stable preview component
const ThemePreview = React.memo(({ background }) => {
  if (!background) return <View style={styles.previewBox} />;

  return (
    <View style={styles.previewBox}>
      {background.type === "image" && background.image && (
        <Image source={background.image} style={styles.previewBox} resizeMode="cover" />
      )}
      {background.type === "gradient" && background.gradient && (
        <LinearGradient colors={background.gradient} style={styles.previewBox} />
      )}
      {background.type === "color" && background.color && (
        <View style={[styles.previewBox, { backgroundColor: background.color }]} />
      )}
    </View>
  );
});

// 🔹 Memoized theme card
const RenderThemeItem = React.memo(({ item, isActive, onPress, theme }) => (
  <TouchableOpacity
    style={[
      styles.card,
      { backgroundColor: theme.components.card, opacity: theme.opacity.light },
      isActive && styles.activeCard,
    ]}
onPress={() => onPress(item.id)}
  >
    <ThemePreview background={item.background} />
    <View style={{ flex: 1 }}>
      <AppText variant="h4" style={[styles.themeName, { color: theme.text.primary }]}>{item.name}</AppText>
      <AppText variant="body"style={[styles.themeId, { color: theme.text.secondary }]}>{item.id.toUpperCase()}</AppText>
    </View>
    {isActive ? (
      <Icon name="check-circle" size={22} color={theme.text.accent} />
    ) : (
      <Icon name="circle" size={22} color={theme.text.secondary} />
    )}
  </TouchableOpacity>
));

const TABS = ["General", "Basic", "Premium"];

const ThemeSelectionScreen = ({navigation}) => {
  const { theme, themeId, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("General");

  // 🔹 Precompute tabs content
  const tabData = useMemo(() => {
    const allThemes = Object.values(themes);
    return TABS.reduce((acc, tab) => {
      acc[tab] = allThemes.filter(item => item.type === tab);
      return acc;
    }, {});
  }, []);
 const applyTheme = async (selectedThemeId) => {
  try {
    // 1️⃣ Update UI immediately
    setTheme(selectedThemeId);
   
    // 2️⃣ Sync with backend
   const res= await api.post("/user/themeId", {
      themeId: selectedThemeId,
    });
   console.log(res)
  } catch (error) {
    console.error("Failed to update theme", error);
    // Optional: revert theme or show toast
  }
};
  return (
    <ScreenBackground>
      <View edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <MaterialIcon name="arrow-left" size={26} color={theme.text.primary} />
                </TouchableOpacity>
                <AppText variant="h3" style={[ { color: theme.text.primary,fontSize:24,fontWeight:600 }]}>Themes</AppText>
                <View style={{ width: 26 }} />
              </View>

        {/* 🔹 Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map(tab => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={styles.tabButton}
              >
                <AppText
                   variant="h4"
                  style={[
                    styles.tabText,
                    {
                      color: isActive ? theme.text.accent : theme.text.secondary,
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                >
                  {tab.toUpperCase()}
                </AppText>
                {isActive && (
                <View
                                style={[
                                  styles.tabUnderline,
                                  { backgroundColor: theme.text.accent },
                                ]}
                              />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 🔹 Theme cards */}
        <FlatList
  data={tabData[activeTab]}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <RenderThemeItem
      item={item}
      isActive={themeId === item.id}
      onPress={applyTheme}
      theme={theme}
    />
  )}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 50 }}
/>
      </View>
    </ScreenBackground>
  );
};

export default ThemeSelectionScreen;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection:'row',alignItems:'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#555",
  },
  tabButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 16,
  },
  tabUnderline: {
    height: 3,
    width: "100%",
    borderRadius: 2,
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 12,
    padding: 14,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: "#00E5FF",
  },
  previewBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
  },
  themeName: {
    fontSize: 14,
    fontWeight: "600",
  },
  themeId: {
    fontSize: 12,
    marginTop: 2,
  },
});
