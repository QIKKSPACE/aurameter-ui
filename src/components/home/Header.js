import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";
import IonIcons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../constants/context/ThemeContext";

export default function Header() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      
      {/* LEFT → Profile */}
      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
      <Image source={require("../../assets/newframe.png")} style={[styles.avatar,{marginLeft:10}]} />
       
      </TouchableOpacity>

     

      {/* RIGHT → Wallet + Notifications */}
      <View style={styles.rightSection}>
        
        <TouchableOpacity
          onPress={() => navigation.navigate("Rewards")}
          style={styles.iconBtn}
        >
          <IonIcons name="gift" size={26} color={theme.text.primary}/>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("IRLScreen")}
          style={styles.iconBtn}
        >
          <IonIcons name="location-outline" size={26} color={theme.text.primary} />
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
 
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop:15
  },

  avatar: { 
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBtn: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 12,
  },
});