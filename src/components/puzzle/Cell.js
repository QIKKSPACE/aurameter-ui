import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { usePuzzleState } from "../../hooks/usePuzzleState";

export default function Cell({ cell, size, borderColor, status }) {

  const { setCellValue, puzzle } = usePuzzleState();

  // Get current puzzle's digitRange for clamping
  const min = puzzle?.digitRange?.min ?? 0;
  const max = puzzle?.digitRange?.max ?? 9999;

  return (
    <View
  style={[
    styles.cell,
    {
      width: size,
      height: size,
      borderRadius: size * 0.25,
      borderWidth: 2,
      borderColor,
    },
    cell.editable ? styles.editable : styles.fixed,
  ]}
>
      <TextInput
        value={cell.value === null ? "" : String(cell.value)}
        onChangeText={(text) => {
          if (text === "") {
            setCellValue(cell.id, null);
            return;
          }
          let num = Number(text);
          if (!Number.isNaN(num)) {
            // Clamp to allowed range
            num = Math.min(Math.max(num, min), max);
            setCellValue(cell.id, num);
          }
        }}
        keyboardType="number-pad"
        editable={cell.editable}
        style={[
          styles.text,
          { fontSize: size * 0.2 },
        ]}
        placeholder="?"
        placeholderTextColor="#6b7280"
        textAlign="center"
      />

     
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
  },
  editable: {
    backgroundColor: "#1c1c1e",
  },
  fixed: {
    backgroundColor: "#2c2c2e",
  },
  text: {
    color: "#ffffff",
    fontWeight: "600",
    width: "100%",
  },
  lock: {
    position: "absolute",
    right: 4,
    bottom: 2,
    color: "#10b981",
    fontWeight: "700",
  },
  indicator: {
  position: "absolute",
  right: 6,
  bottom: 4,
  fontWeight: "800",
},
});
