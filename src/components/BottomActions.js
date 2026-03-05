import React from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";

export default function BottomActions() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.action}>
        <Icon name="message-circle" size={22} color="#fff" />
        <Text style={styles.label}>Reply</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.action}>
        <Image source={require("../assets/newframe.png")} style={styles.icon} resizeMode="contain" />
        <Text style={styles.label}>Aura</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  action: { alignItems: "center" },
  label: { marginTop: 4, fontSize: 12, color: "#fff", fontWeight: "600" },
  icon: { width: 28, height: 28 },
});
