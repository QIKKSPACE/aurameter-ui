// components/CustomProfileHeader.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather"; // using Feather for consistency
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../constants/context/ThemeContext";
import { useSelector } from "react-redux";
import AppText from "./AppText";

const CustomProfileHeader = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const user=useSelector(state=>state.user)

  return (
    <View style={styles.header}>
      {/* Back Button */}
      <View style={{flexDirection:'row'}}>

      {/* Title */}
      <AppText variant="h3" style={[styles.headerText, { color: theme.text.primary,fontSize:18 }]}>
        @{user.userData?.username}
      </AppText>
      </View>
      

      {/* Settings -> Open Drawer */}
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Icon name="settings" size={26} color={theme.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
  
  },
});

export default CustomProfileHeader;
