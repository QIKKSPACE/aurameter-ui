import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { usePuzzleState } from "../../hooks/usePuzzleState";
import { usePuzzleValidation } from "../../hooks/usePuzzleValidation";
import Cell from "./Cell";
export default function Grid({ validate }) {
  const { puzzle } = usePuzzleState();
  const validation = usePuzzleValidation(validate);


  const { width: screenW, height: screenH } = useWindowDimensions();

  if (!puzzle) return null;

  const cellsArray = Object.values(puzzle.cells);
  const operatorsArray = puzzle.operators || [];

  // Grid bounds (include operators too)
  const allX = [...cellsArray.map((c) => c.x), ...operatorsArray.map((o) => o.x)];
  const allY = [...cellsArray.map((c) => c.y), ...operatorsArray.map((o) => o.y)];

  const maxX = Math.max(...allX) + 1;
  const maxY = Math.max(...allY) + 1;

  const padding =20;
  const maxCellSize = 80; // optional cap for very large screens
  const cellSize = Math.min(
    (screenW - padding * 2) / maxX,
    (screenH - padding * 2) / maxY,
    maxCellSize
  );

  return (
    <View
      style={[styles.container, { width: maxX * cellSize, height: maxY * cellSize }]}
    >
      {/* Number cells */}
      {cellsArray.map((cell) => {
        // Highlight border based on validation
       const status = validation.cellStatus[cell.id];

const borderColor =
  !cell.editable
    ? "#10b981"
    : status === "correct"
    ? "#22c55e"
    : status === "wrong"
    ? "#ef4444"
    : "#374151";

        return (
          <View
            key={cell.id}
            style={[
              styles.cellWrapper,
              { left: cell.x * cellSize, top: cell.y * cellSize },
            ]}
          >
            <Cell
  cell={cell}
  size={cellSize}
  borderColor={borderColor}
  status={status}
/>
          </View>
        );
      })}

      {/* Operators */}
      {operatorsArray.map((op) => (
        <View
          key={op.id}
          style={[
            styles.operatorWrapper,
            {
              left: op.x * cellSize,
              top: op.y * cellSize,
              width: cellSize,
              height: cellSize,
            },
          ]}
        >
          <Text
            style={[
              styles.operator,
              {
                fontSize: cellSize * 0.55,
                lineHeight: cellSize,
                color: op.symbol === "=" ? "#10b981" : "#FFD700",
              },
            ]}
          >
            {op.symbol}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignSelf: "center",
    backgroundColor: "#020617",
    marginVertical: 20,
  },
  cellWrapper: {
    position: "absolute",
  },
  operatorWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  operator: {
    fontWeight: "800",
  },
});
