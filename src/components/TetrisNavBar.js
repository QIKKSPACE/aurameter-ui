import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather"; // or any icon pack you like

export default function TetrisNavBar({ score = 0, status = "idle", onRestart }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color="#fff" />
        <Text style={styles.title}>Tetris</Text>
      </TouchableOpacity>

      <View style={styles.centerContainer}>
        <Text style={styles.statusText}>{status.toUpperCase()}</Text>
      </View>

      <View style={styles.rightContainer}>
        <Icon name="award" size={24} color="#fff" style={styles.icon} />

        <TouchableOpacity onPress={onRestart} style={styles.iconButton}>
          <Icon name="refresh-cw" size={24} color="#fff" style={styles.icon} />
        </TouchableOpacity>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    position:'absolute',
    top:0,left:0,
    zIndex:1100,
    width:'100%',
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: 'row',
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    letterSpacing: 1,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 16,
  },
  icon: {
    marginHorizontal: 8,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "#222",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  scoreText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
