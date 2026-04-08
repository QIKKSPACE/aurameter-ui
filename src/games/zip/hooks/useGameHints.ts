import { useCallback, useEffect, useRef, useState } from "react";
import { unstable_batchedUpdates } from "react-native";
import { convertPathToPoints, generateHint, HintResult } from "../HintSystem";
import type { Node, PathSegment, Point, ZipGameState } from "../ZipTypes";

export const useGameHints = (
  gameState: ZipGameState | null,
  setGameState: (updater: (prev: ZipGameState | null) => ZipGameState | null) => void,
  levelSolutionRef: React.MutableRefObject<Point[] | null>,
  hintProgressRef: React.MutableRefObject<number>,
  hintsUsed: number,
  setHintsUsed: (n: number | ((prev: number) => number)) => void,
  showToast: (msg: string) => void
) => {
  const [hintPath, setHintPath] = useState<PathSegment[]>([]);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncHintProgress = useCallback((newPath: PathSegment[]) => {
    if (!levelSolutionRef.current || levelSolutionRef.current.length === 0)
      return;

    try {
      const playerPoints = convertPathToPoints(newPath);
      const solutionPoints = levelSolutionRef.current;

      let matchLength = 0;
      for (
        let i = 0;
        i < playerPoints.length && i < solutionPoints.length;
        i++
      ) {
        if (playerPoints[i].x === solutionPoints[i].x && playerPoints[i].y === solutionPoints[i].y) {
          matchLength = i + 1;
        } else {
          break;
        }
      }

      if (matchLength > hintProgressRef.current) {
        hintProgressRef.current = matchLength;
      }
    } catch (error) {
      // Silently fail
    }
  }, [levelSolutionRef, hintProgressRef]);

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = null;
      }
    };
  }, []);

  const handleHint = useCallback(() => {
    if (!gameState) {
      return;
    }
    if (gameState.completed || gameState.gameOver) {
      return;
    }
    if (!levelSolutionRef.current) {
      showToast("Hint not ready");
      return;
    }
    if (gameState.hintsRemaining <= 0) {
      showToast("No hints remaining");
      return;
    }

    try {
      const hintResult: HintResult = generateHint(
        gameState.path,
        levelSolutionRef.current,
        hintProgressRef.current,
        gameState.nodes
      );

      if (hintResult.hintSegments.length === 0) {
        // Still consume the hint even if no segments (player at end of path or other edge case)
        unstable_batchedUpdates(() => {
          setGameState((prevState) => {
            const newHints = Math.max(0, (prevState?.hintsRemaining || 0) - 1);
            console.log("💡 [HINT] Update - hintsRemaining:", prevState?.hintsRemaining, "→", newHints);
            if (!prevState) return prevState;
            return {
              ...prevState,
              hintsRemaining: newHints,
            };
          });
          setHintsUsed((prev) => {
            console.log("💡 [HINT] Update - hintsUsed:", prev, "→", prev + 1);
            return prev + 1;
          });
        });
        showToast("You've completed this level!");
        return;
      }

      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = null;
      }

      if (
        hintResult.shouldCorrectPath &&
        hintResult.correctionPath &&
        hintResult.correctionPath.length > 0
      ) {
        unstable_batchedUpdates(() => {
          setGameState((prevState) => {
            const newHints = Math.max(0, (prevState?.hintsRemaining || 0) - 1);
            console.log("💡 [HINT] Update - hintsRemaining:", prevState?.hintsRemaining, "→", newHints);
            if (!prevState) return prevState;
            return {
              ...prevState,
              path: hintResult.correctionPath as PathSegment[],
              hintsRemaining: newHints,
            };
          });
          setHintsUsed((prev) => {
            return prev + 1;
          });
        });
      } else {
        unstable_batchedUpdates(() => {
          setGameState((prevState) => {
            const newHints = Math.max(0, (prevState?.hintsRemaining || 0) - 1);
            if (!prevState) return prevState;
            return {
              ...prevState,
              hintsRemaining: newHints,
            };
          });
          setHintsUsed((prev) => {
            return prev + 1;
          });
        });
      }

      setHintPath(hintResult.hintSegments);
      hintProgressRef.current = hintResult.nextHintStart;

      // Set new timeout - 5 seconds to display hint
      hintTimeoutRef.current = setTimeout(() => {
        setHintPath([]);
        hintTimeoutRef.current = null;
      }, 5000);
    } catch (error) {
      unstable_batchedUpdates(() => {
        setGameState((prevState) => {
          const newHints = Math.max(0, (prevState?.hintsRemaining || 0) - 1);
          if (!prevState) return prevState;
          return {
            ...prevState,
            hintsRemaining: newHints,
          };
        });
        setHintsUsed((prev) => {
          return prev + 1;
        });
      });
    }
  }, [gameState, levelSolutionRef, hintProgressRef, setHintsUsed, showToast, setGameState]);

  return {
    hintPath,
    setHintPath,
    handleHint,
    syncHintProgress,
  };
};
