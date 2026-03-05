// src/components/CustomDrawer.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/Feather";
import { useTheme } from "../constants/context/ThemeContext";
import LinearGradient from "react-native-linear-gradient";
import { useNavigationState } from "@react-navigation/native";
import { useDispatch } from "react-redux";

import AsyncStorage from "@react-native-async-storage/async-storage";
import AppText from "../components/AppText";
import { logout } from "../store/store";
import { flushFailedQueue } from "../services/tokenManager";
import { initiateLogout } from "../services/logoutService";


const CustomDrawer = (props) => {
  const { isDark, toggleTheme, theme,setTheme } = useTheme();
  const dispatch=useDispatch()
  const currentRoute =
    useNavigationState((state) => state.routes[state.index]?.name) || "";
  

  // Wrapper for gradient/solid background
  const BackgroundWrapper = ({ children }) => {
    const drawerGradient = theme?.gradients?.drawer;
    if (drawerGradient) {
      return (
        <LinearGradient
          colors={drawerGradient}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {children}
        </LinearGradient>
      );
    }
    return (
      <View
        style={{
          flex: 1,
          backgroundColor:
            theme?.components?.drawer || theme?.background?.color,
        }}
      >
        {children}
      </View>
    );
  };

  // Drawer menu items
  const menuItems = [
    { label: "Edit Profile", icon: "edit", screen: "EditProfile" },
  { label: "App Theme", icon: "layers", screen: "Theme"  },

    { label: "Aurapoints & Rewards", icon: "gift", screen: "Rewards" },
    { label: "Followers", icon: "users", screen: "Followers" },
    { label: "Following", icon: "user-check", screen: "Following" },
     { label: "IRL", icon: "map-pin", screen: "IRLScreen" },
    { label: "Take A Walk", icon: "activity", screen: "Walking"  },
    { label: "Logout", icon: "log-out" },
 

  ];
 
 const handlePress =async (item) => {
  if (item.isSwitch) return;
  if (item.label === "Logout") {
      // give drawer a moment to close before logging out
  
       // 1️⃣ reject all queued requests
  props.navigation.closeDrawer();

          flushFailedQueue(new Error("User Logging Out"));
      
        // 2️⃣ trigger logout modal + redux cleanup
        initiateLogout({ reason: "Logging You Out Please Wait!" });
         setTheme("dark")

  } else if (item.screen) {
    props.navigation.closeDrawer();

    // Delay navigation until after drawer closes
    setTimeout(() => {
      props.navigation.navigate("HomeStack", { screen: item.screen });
    }, 150); // match drawer animation time
  }
};

  return (
    <BackgroundWrapper>
      <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false} contentContainerStyle={{
       
        marginTop:30,
     
      }}>
        {menuItems.map((item, index) => {
          const isActive = currentRoute === item.screen;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                isActive && {
                  backgroundColor:
                    theme.components?.activeDrawerItem ||
                    "rgba(255,255,255,0.1)",
                  borderRadius: 8,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => handlePress(item)}
            >
              <Icon
                name={item.icon}
                size={20}
                color={isActive ? theme.text.accent : theme.text.primary}
              />
              <AppText
                style={[
                  styles.menuText,
                  { color: isActive ? theme.text.accent : theme.text.primary },
                ]}
                variant="h4"
              >
                {item.label}
              </AppText>

              {item.isSwitch && (
                <Switch
                  style={{ marginLeft: "auto" }}
                  value={!isDark}
                  onValueChange={toggleTheme}
                  thumbColor={isDark ? theme.text.accent : "#888"}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginVertical: 2,
  },
  menuText: {
    marginLeft: 15,
    fontSize: 12,
   
  },
});

export default CustomDrawer;
