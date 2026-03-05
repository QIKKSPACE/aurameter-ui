import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";

export default function TopBar({ onClose, onDelete, showDelete }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onClose}>
        <Icon name="x" size={26} color="#fff" />
      </TouchableOpacity>
      <View style={styles.actions}>
        {showDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
            <MaterialIcon name="delete" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 20,
  },
  actions: { flexDirection: "row", gap: 12 },
  iconBtn: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 6,
    borderRadius: 30,
  },
});
