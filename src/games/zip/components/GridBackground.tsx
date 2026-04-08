import React from "react";
import { Path as SvgPath } from "react-native-svg";
import type { Obstacle } from "../ZipTypes";

type GridBackgroundProps = {
  gridSize: number;
  boardSize: number;
  cellSize: number;
  obstacles: Obstacle[];
  theme: any;
};

export const GridBackground = React.memo(
  ({ gridSize, boardSize, cellSize, obstacles, theme }: GridBackgroundProps) => {
    return (
      <>
        {Array.from({ length: gridSize + 1 }).map((_, i) => {
          const pos = i * cellSize;
          return (
            <React.Fragment key={`grid-${i}`}>
              <SvgPath d={`M ${pos} 0 L ${pos} ${boardSize}`} stroke={theme.text.secondary} strokeWidth={0.5} opacity={0.1} />
              <SvgPath d={`M 0 ${pos} L ${boardSize} ${pos}`} stroke={theme.text.secondary} strokeWidth={0.5} opacity={0.1} />
            </React.Fragment>
          );
        })}

        {obstacles.map((obstacle, idx) => {
          const x = obstacle.x * cellSize;
          const y = obstacle.y * cellSize;
          return (
            <React.Fragment key={`obstacle-${idx}`}>
              <SvgPath
                d={`M ${x} ${y} L ${x + cellSize} ${y} L ${x + cellSize} ${y + cellSize} L ${x} ${y + cellSize} Z`}
                fill="#4A4A4A"
                opacity={0.6}
              />
              <SvgPath d={`M ${x + cellSize * 0.2} ${y + cellSize * 0.2} L ${x + cellSize * 0.8} ${y + cellSize * 0.8}`} stroke="#666" strokeWidth={1} opacity={0.5} />
              <SvgPath d={`M ${x + cellSize * 0.8} ${y + cellSize * 0.2} L ${x + cellSize * 0.2} ${y + cellSize * 0.8}`} stroke="#666" strokeWidth={1} opacity={0.5} />
            </React.Fragment>
          );
        })}
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.gridSize === nextProps.gridSize &&
      prevProps.boardSize === nextProps.boardSize &&
      prevProps.cellSize === nextProps.cellSize &&
      prevProps.obstacles === nextProps.obstacles &&
      prevProps.theme === nextProps.theme
    );
  }
);

GridBackground.displayName = "GridBackground";
