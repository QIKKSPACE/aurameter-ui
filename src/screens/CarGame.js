import { StyleSheet, View } from "react-native";
import React from "react";
import { GameCanvas } from "../game/GameCanvas";

const CarGame = () => {
  return (
    <View style={styles.container}>
      <GameCanvas />
    </View>
  );
};

export default CarGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});
