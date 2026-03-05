import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialIcons";
import IonIcons from "react-native-vector-icons/Ionicons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Svg, { Defs, LinearGradient, Stop, Rect, Polygon } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../constants/context/ThemeContext";
import { useSelector } from "react-redux";

// Screens
import HomeScreen from "../screens/HomeScreen";
import MindbloomDaily from "../screens/MindBloom";
import InboxScreen from "../screens/MessageScreen";
import NotificationScreen from "../screens/NotificationScreen";
import ProfileScreen from "../screens/Profile";

const Tab = createBottomTabNavigator();

/* 🔹 Glow behind active icon */
const ActiveTabGlow = ({ width = 70, height = 70, colors }) => (
  <Svg width={width} height={height}>
   
  </Svg>
);

/* 🔹
 <Defs>
      <LinearGradient id="grad" x1="50%" y1="5%" x2="50%" y2="100%">
        <Stop offset="0%" stopColor={colors[0]} stopOpacity="0.8" />
        <Stop offset="100%" stopColor={colors[1]} stopOpacity="0.0" />
      </LinearGradient>
    </Defs>
    <Polygon
      points={`0,${height} ${width / 2},4 ${width},${height}`}
      fill="url(#grad)"
    />
 Gradient tab background */
const TabBarBackground = ({ theme }) => (
  <Svg width="100%" height="100%">
    <Defs>
      <LinearGradient id="tabGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor={theme.gradients.tab[0]} />
        <Stop offset="100%" stopColor={theme.gradients.tab[1]} />
      </LinearGradient>
    </Defs>
    <Rect width="100%" height="100%" fill="url(#tabGrad)" />
  </Svg>
);

const TabNavigator = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const { count } = useSelector((state) => state.notifications);
  const chatUnread = useSelector((state) => state.unread);

  const isGestureNavigation = insets.bottom > 20;
const bottomPadding = 8;
  const getIconName = (routeName) => {
    switch (routeName) {
      case "Home":
        return "home";
      case "Aura +":
        return "castle";
      case "Chats":
        return "chatbox";
      case "Notification":
        return "notifications";
      case "Profile":
        return "user-large";
      default:
        return "circle";
    }
  };

  const getIconComponent = (routeName) => {
    if (routeName === "Profile") return FontAwesome6;
    if (routeName === "Notification" || routeName === "Chats") return IonIcons;
    return MaterialCommunityIcons;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ focused, color }) => {
          const IconComponent = getIconComponent(route.name);
          const iconName = getIconName(route.name);
          const iconSize = route.name === "Profile" ? 24 : 26;

          return (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              {/* Glow */}
              {focused && (
                <View style={{ position: "absolute", top: -18 }}>
                  <ActiveTabGlow
                    width={70}
                    height={70}
                    colors={theme.polygonGradient}
                  />
                </View>
              )}

              {/* Top indicator */}
              {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: -16,
                    width: 28,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: theme.text.accent,
                  }}
                />
              )}

              {/* Icon */}
              <View style={{ transform: [{ scaleX: -1 }] }}>
                <IconComponent name={iconName} size={iconSize} color={color} />
              </View>

              {/* 🔴 Notification Badge */}
              {route.name === "Notification" && count > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -6,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: "#FF3B30",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: "700",
                    }}
                  >
                    {count > 99 ? "99+" : count}
                  </Text>
                </View>
              )}

                 {route.name === "Chats" && chatUnread.unreadChats > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -6,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: "#FF3B30",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: "700",
                    }}
                  >
                    {chatUnread.unreadChats > 99 ? "99+" : chatUnread?.unreadChats}
                  </Text>
                </View>
              )}
            </View>
          );
        },

        tabBarActiveTintColor: theme.text.secondary,
        tabBarInactiveTintColor: theme.text.secondary,
        tabBarShowLabel: false,
        tabBarBackground: () => <TabBarBackground theme={theme} />,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          paddingHorizontal: 10,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: 50 
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Aura +" component={MindbloomDaily} />
      <Tab.Screen name="Chats" component={InboxScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
