// components/home/HomeHeader.js
import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../constants/context/ThemeContext";
import AppText from "../AppText";
import { styles } from "./styles";

const HomeHeader = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={styles.logoRow}>
      <Image source={require("../../assets/newframe.png")} style={styles.auraIcon} />
      <AppText variant="h2">AURAVERSE</AppText>
      <TouchableOpacity onPress={() => navigation.navigate("Search")}>
        <Icon name="search" size={26} color={theme.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default HomeHeader;
