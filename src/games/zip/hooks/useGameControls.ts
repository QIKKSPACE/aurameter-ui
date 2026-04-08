import { useCallback, useRef } from "react";
import { getPathCells } from "../ZipEngine";
import {
  detectCompletion,
  extendPath,
  pointsEqual,
  undoMove as undoMoveEngine,
  validateMove,
} from "../ZipEngine";
import { convertPathToPoints } from "../HintSystem";
import type { PathSegment, Point, ZipGameState } from "../ZipTypes";

export const useGameControls = (
  gameState: ZipGameState | null,
  setGameState: (updater: (prev: ZipGameState | null) => ZipGameState | null) => void,
  gameStateRef: React.MutableRefObject<ZipGameState | null>,
  hintProgressRef: React.MutableRefObject<number>,
  setHintPath: (path: PathSegment[]) => void,
  showToast: (msg: string) => void,
  lastCellKeyRef: React.MutableRefObject<string | null>,
  lastNodeWarningShownRef: React.MutableRefObject<boolean>,
  setShowLastNodeWarning: (show: boolean) => void,
  syncHintProgress: (newPath: PathSegment[]) => void
) => {
  const checkLastNodeWarning = useCallback(
    (newNodeIndex: number) => {
      if (!gameState) return;
      if (lastNodeWarningShownRef.current) return;

      const { nodes, path, gridSize, obstacles } = gameState;
      const isLastNode = newNodeIndex === nodes.length - 1;
      if (!isLastNode) return;

      const requiredCells = gridSize * gridSize - obstacles.length;
      const filledCells = getPathCells(path, gridSize).size;

      if (filledCells < requiredCells) {
        setShowLastNodeWarning(true);
        lastNodeWarningShownRef.current = true;

        setTimeout(() => {
          setShowLastNodeWarning(false);
        }, 3000);
      }
    },
    [gameState, lastNodeWarningShownRef, setShowLastNodeWarning]
  );
  const handleTapCell = useCallback(
    (cell: Point) => {
      if (!gameState || gameState.completed) return;

      const { path, nodes, gridSize, obstacles, currentNodeIndex } = gameState;

      if (path.length === 0) {
        if (!pointsEqual(cell, nodes[0].position)) return;
        const initialSegment: PathSegment = {
          from: nodes[0].position,
          to: nodes[0].position,
        };
        setGameState((prev) =>
          prev
            ? {
                ...prev,
                selectedStartNode: nodes[0],
                currentNodeIndex: 0,
                path: [initialSegment],
              }
            : prev
        );
        return;
      }

      const lastSegment = path[path.length - 1];
      const currentPos = lastSegment.to;

      if (pointsEqual(cell, currentPos)) return;

      if (currentNodeIndex + 1 < nodes.length) {
        const nextNode = nodes[currentNodeIndex + 1];
        if (pointsEqual(cell, nextNode.position)) {
          if (
            validateMove(
              currentPos,
              cell,
              gridSize,
              obstacles,
              path,
              currentNodeIndex,
              nodes
            )
          ) {
            const newPath = extendPath(currentPos, cell, path);
            checkLastNodeWarning(currentNodeIndex + 1);
            syncHintProgress(newPath);

            setGameState((prev) => {
              if (!prev) return prev;
              const updatedState = {
                ...prev,
                path: newPath,
                currentNodeIndex: currentNodeIndex + 1,
              };
              const isComplete = detectCompletion(newPath, nodes, gridSize, obstacles);
              if (isComplete) {
                updatedState.completed = true;
                updatedState.elapsedTime = Math.floor(
                  (Date.now() - (prev.timerStartTime || Date.now())) / 1000
                );

              }
              return updatedState;
            });
            return;
          }
        }
      }

      if (
        !validateMove(
          currentPos,
          cell,
          gridSize,
          obstacles,
          path,
          currentNodeIndex,
          nodes
        )
      )
        return;

      const newPath = extendPath(currentPos, cell, path);
      syncHintProgress(newPath);

      setGameState((prev) => {
        if (!prev) return prev;
        const updatedState = {
          ...prev,
          path: newPath,
        };
        const isComplete = detectCompletion(newPath, nodes, gridSize, obstacles);
        if (isComplete) {
          updatedState.completed = true;
          updatedState.elapsedTime = Math.floor(
            (Date.now() - (prev.timerStartTime || Date.now())) / 1000
          );
        }
        return updatedState;
      });
    },
    [gameState, checkLastNodeWarning, syncHintProgress, setGameState]
  );

  const handleDragCell = useCallback(
    (cell: Point) => {
      const currentState = gameStateRef.current;
      if (!currentState || currentState.completed) return;

      const { path, nodes, gridSize, obstacles, currentNodeIndex } = currentState;

      // ✅ FIX: Allow drag to initialize path on first node (like tap does)
      if (path.length === 0) {
        if (!pointsEqual(cell, nodes[0].position)) return;
        const initialSegment: PathSegment = {
          from: nodes[0].position,
          to: nodes[0].position,
        };
        setGameState((prev) => {
          return prev
            ? {
                ...prev,
                selectedStartNode: nodes[0],
                currentNodeIndex: 0,
                path: [initialSegment],
              }
            : prev;
        });
        lastCellKeyRef.current = `${cell.x}-${cell.y}`;
        return;
      }

      const lastSegment = path[path.length - 1];
      const currentPos = lastSegment.to;

      // BACKTRACK CHECK — before duplicate guard
      const pathPoints = convertPathToPoints(currentState.path);
      if (pathPoints.length >= 2) {
        const secondLast = pathPoints[pathPoints.length - 2];
        if (pointsEqual(cell, secondLast)) {
          lastCellKeyRef.current = `${cell.x}-${cell.y}`;
          setGameState((prev) => {
            return prev
              ? { ...prev, path: prev.path.slice(0, prev.path.length - 1) }
              : prev;
          });
          return;
        }
      }

      // DUPLICATE GUARD — after backtrack check
      const cellKey = `${cell.x}-${cell.y}`;
      if (lastCellKeyRef.current === cellKey) {
        return;
      }
      lastCellKeyRef.current = cellKey;

      // SAME POSITION CHECK
      if (pointsEqual(cell, currentPos)) {
        return;
      }

      if (currentNodeIndex + 1 < nodes.length) {
        const nextNode = nodes[currentNodeIndex + 1];
        if (pointsEqual(cell, nextNode.position)) {
          if (
            validateMove(
              currentPos,
              cell,
              gridSize,
              obstacles,
              path,
              currentNodeIndex,
              nodes
            )
          ) {
            const newPath = extendPath(currentPos, cell, path);
            if (newPath.length > path.length) {
              checkLastNodeWarning(currentNodeIndex + 1);
              syncHintProgress(newPath);

              setGameState((prev) => {
                if (!prev) return prev;
                const updatedState = {
                  ...prev,
                  path: newPath,
                  currentNodeIndex: currentNodeIndex + 1,
                };
                if (
                  detectCompletion(newPath, nodes, gridSize, obstacles)
                ) {
                  updatedState.completed = true;
                  updatedState.elapsedTime = Math.floor(
                    (Date.now() - (prev.timerStartTime || Date.now())) / 1000
                  );
                }
                return updatedState;
              });
              return;
            }
          }
        }
      }

      if (
        validateMove(
          currentPos,
          cell,
          gridSize,
          obstacles,
          path,
          currentNodeIndex,
          nodes
        )
      ) {
        const newPath = extendPath(currentPos, cell, path);
        if (newPath.length > path.length) {
          syncHintProgress(newPath);

          setGameState((prev) => {
            if (!prev) return prev;
            const updatedState = {
              ...prev,
              path: newPath,
            };
            if (detectCompletion(newPath, nodes, gridSize, obstacles)) {
              updatedState.completed = true;
              updatedState.elapsedTime = Math.floor(
                (Date.now() - (prev.timerStartTime || Date.now())) / 1000
              );
            }
            return updatedState;
          });
        }
      }
    },
    [checkLastNodeWarning, syncHintProgress, setGameState, gameStateRef, lastCellKeyRef]
  );

  const handleUndo = useCallback(() => {
    if (!gameState || gameState.path.length === 0) return;
    const newState = undoMoveEngine(gameState);
    lastCellKeyRef.current = null;
    setGameState(() => newState);
  }, [gameState, setGameState, lastCellKeyRef]);

  return {
    handleTapCell,
    handleDragCell,
    handleUndo,
  };
};
