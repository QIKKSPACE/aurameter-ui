import React, { useMemo } from "react";
import { Defs, LinearGradient, Stop, Polyline } from "react-native-svg";
import type { PathSegment } from "../ZipTypes";

type PathLayerProps = {
  gameState: {
    path: PathSegment[];
  } | null;
  hintPath: PathSegment[];
  boardSize: number;
  cellSize: number;
  theme: any;
};

export const PathLayer = React.memo(
  ({ gameState, hintPath, boardSize, cellSize, theme }: PathLayerProps) => {
    const pathPoints = useMemo(() => {
      let points = "";
      if (gameState && gameState.path.length > 0) {
        const pathPointsArray: string[] = [];
        gameState.path.forEach((seg) => {
          pathPointsArray.push(`${seg.from.x * cellSize + cellSize / 2},${seg.from.y * cellSize + cellSize / 2}`);
        });
        const lastSeg = gameState.path[gameState.path.length - 1];
        pathPointsArray.push(`${lastSeg.to.x * cellSize + cellSize / 2},${lastSeg.to.y * cellSize + cellSize / 2}`);
        points = pathPointsArray.join(" ");
      }
      return points;
    }, [gameState, cellSize]);

    const hintPathPoints = useMemo(() => {
      let points = "";
      if (hintPath.length > 0) {
        const hintPointsArray: string[] = [];
        hintPath.forEach((seg) => {
          hintPointsArray.push(`${seg.from.x * cellSize + cellSize / 2},${seg.from.y * cellSize + cellSize / 2}`);
        });
        const lastHintSeg = hintPath[hintPath.length - 1];
        hintPointsArray.push(`${lastHintSeg.to.x * cellSize + cellSize / 2},${lastHintSeg.to.y * cellSize + cellSize / 2}`);
        points = hintPointsArray.join(" ");
      }
      return points;
    }, [hintPath, cellSize]);

    const pathWidth = cellSize * 0.5;

    return (
      <>
        <Defs>
          <LinearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.primary} stopOpacity="1" />
            <Stop offset="100%" stopColor={theme.secondary} stopOpacity="0.8" />
          </LinearGradient>
          <LinearGradient id="hintGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.7" />
            <Stop offset="100%" stopColor={theme.secondary} stopOpacity="0.5" />
          </LinearGradient>
        </Defs>

        {hintPathPoints && (
          <Polyline
            points={hintPathPoints}
            stroke="url(#hintGradient)"
            strokeWidth={pathWidth * 0.8}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
            strokeDasharray="5,5"
          />
        )}

        {pathPoints && (
          <Polyline
            points={pathPoints}
            stroke="url(#pathGradient)"
            strokeWidth={pathWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.gameState === nextProps.gameState &&
      prevProps.hintPath === nextProps.hintPath &&
      prevProps.boardSize === nextProps.boardSize &&
      prevProps.cellSize === nextProps.cellSize &&
      prevProps.theme === nextProps.theme
    );
  }
);

PathLayer.displayName = "PathLayer";
