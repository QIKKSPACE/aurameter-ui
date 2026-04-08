import React, { useMemo } from "react";
import { View } from "react-native";
import AppText from "../../../components/AppText";
import type { Node } from "../ZipTypes";

type GameNodeProps = {
  node: Node;
  cellSize: number;
  isActive: boolean;
  theme: any;
  styles: any;
};

export const GameNode = React.memo(
  ({ node, cellSize, isActive, theme, styles }: GameNodeProps) => {
    const x = node.position.x * cellSize + cellSize / 2;
    const y = node.position.y * cellSize + cellSize / 2;
    const size = cellSize * 0.6;
    
    const nodeWrapStyle = useMemo(
      () => [styles.nodeWrap, { left: x - size / 2, top: y - size / 2, width: size, height: size }],
      [x, y, size, styles.nodeWrap]
    );

    const nodeStyle = useMemo(
      () => [
        styles.node,
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2, 
          backgroundColor: isActive ? theme.primary : theme.secondary 
        },
      ],
      [size, isActive, theme.primary, theme.secondary, styles.node]
    );

    return (
      <View style={nodeWrapStyle} pointerEvents="none">
        <View style={nodeStyle}>
          <AppText style={{ color: "#fff", fontWeight: "700", fontSize: cellSize * 0.25 }}>
            {node.number}
          </AppText>
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.node === nextProps.node &&
      prevProps.cellSize === nextProps.cellSize &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.theme === nextProps.theme &&
      prevProps.styles === nextProps.styles
    );
  }
);

GameNode.displayName = "GameNode";
