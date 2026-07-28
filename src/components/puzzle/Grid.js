import React, { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { usePuzzleState } from "../../hooks/usePuzzleState";
import { usePuzzleValidation } from "../../hooks/usePuzzleValidation";
import Cell from "./Cell";

function Grid({ validationPulse }) {
  const { puzzle } = usePuzzleState();
  const validation = usePuzzleValidation(false);
  const { width: screenW, height: screenH } = useWindowDimensions();

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + validationPulse.value * 0.018 }],
  }));

  const geometry = useMemo(() => {
    if (!puzzle) return null;
    const cellsArray = Object.values(puzzle.cells);
    const operatorsArray = puzzle.operators || [];
    const allX = [...cellsArray.map((c) => c.x), ...operatorsArray.map((o) => o.x)];
    const allY = [...cellsArray.map((c) => c.y), ...operatorsArray.map((o) => o.y)];
    const maxX = Math.max(...allX) + 1;
    const maxY = Math.max(...allY) + 1;
    const cellSize = Math.floor(
      Math.min(
        (screenW - 32) / maxX,
        (screenH * 0.58) / maxY,
        72
      )
    );

    return {
      cellsArray,
      operatorsArray,
      maxX,
      maxY,
      cellSize: Math.max(38, cellSize),
    };
  }, [puzzle, screenH, screenW]);

  if (!puzzle || !geometry) return null;

  const { cellsArray, operatorsArray, maxX, maxY, cellSize } = geometry;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: maxX * cellSize,
          height: maxY * cellSize,
        },
        pulseStyle,
      ]}
    >
      {cellsArray.map((cell) => {
        const status = validation.cellStatus[cell.id];
        const isLocked = !cell.editable;
        const borderColor =
          isLocked
            ? "rgba(52, 211, 153, 0.9)"
            : status === "correct"
            ? "#22c55e"
            : status === "wrong"
            ? "#fb7185"
            : "rgba(148, 163, 184, 0.38)";

        return (
          <View
            key={cell.id}
            style={[
              styles.cellWrapper,
              {
                left: cell.x * cellSize,
                top: cell.y * cellSize,
              },
            ]}
          >
            <Cell
              cell={cell}
              size={cellSize - 5}
              borderColor={borderColor}
              status={status}
            />
          </View>
        );
      })}

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
                fontSize: Math.max(18, cellSize * 0.46),
                color: op.symbol === "=" ? "#34d399" : "#f8fafc",
              },
            ]}
          >
            {op.symbol}
          </Text>
        </View>
      ))}
    </Animated.View>
  );
}

export default React.memo(Grid);

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignSelf: "center",
    marginVertical: 18,
  },
  cellWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  operatorWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  operator: {
    fontWeight: "900",
    textShadowColor: "rgba(125, 211, 252, 0.35)",
    textShadowRadius: 12,
  },
});
