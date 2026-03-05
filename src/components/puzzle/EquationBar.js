import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { usePuzzleState } from "../../hooks/usePuzzleState";

export default function EquationBar() {
  const { puzzle } = usePuzzleState();
  if (!puzzle) return null;

  return (
    <View style={styles.container}>
      {puzzle.equations.map((eq) => (
        <Text key={eq.id} style={styles.equation}>
          {eq.cells.join(` ${eq.operator} `)} = {eq.result}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#0f172a",
    borderRadius: 14,
  },

  equation: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 4,
  },
});
