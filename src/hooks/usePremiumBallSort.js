// src/hooks/usePremiumBallSort.js
import { useState, useCallback, useEffect, useRef } from "react";
import { generateTubes, isWin, getValidMoves } from "../engine/ballSortEngine";
import { deepClone } from "../utils/clone";

export const usePremiumBallSort = ({ level, capacity, colors }) => {
  const [tubes, setTubes] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedTube, setSelectedTube] = useState(-1);
  const [hasWon, setHasWon] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [movesUsed, setMovesUsed] = useState(0);
  
  // To avoid unneeded re-renders on layout
  const tubeLayouts = useRef({});

  const MAX_COLORS = colors.length;
  // Difficulty scaling
  const numColors = Math.min(3 + Math.floor((level - 1) / 3), MAX_COLORS);
  const emptyTubes = numColors <= 5 ? 2 : 3;
  const numTubes = numColors + emptyTubes;
  const shuffleDepth = Math.max(50, numColors * 30);
  const moveLimit = Math.max(numColors * (capacity - 1) + 6, 18);

  // Initialize Level
  const initLevel = useCallback(() => {
    const newTubes = generateTubes(numColors, numTubes, capacity, colors, shuffleDepth);
    tubeLayouts.current = {};
    setTubes(deepClone(newTubes));
    setHistory([]);
    setSelectedTube(-1);
    setHasWon(false);
    setHasLost(false);
    setIsMoving(false);
    setMovesUsed(0);
  }, [numColors, numTubes, capacity, colors, shuffleDepth]);

  useEffect(() => {
    initLevel();
  }, [initLevel, level]);

  // Check Win condition
  useEffect(() => {
    if (tubes.length > 0 && isWin(tubes, capacity)) {
      setHasWon(true);
      setHasLost(false);
      return;
    }

    if (movesUsed >= moveLimit && !hasWon) {
      setHasLost(true);
    }
  }, [tubes, capacity, hasWon, moveLimit, movesUsed]);

  const onTubeLayout = useCallback((index, layout) => {
    tubeLayouts.current[index] = layout;
  }, []);

  const handleUndo = useCallback(() => {
    if (isMoving || hasWon || hasLost || history.length === 0) return;
    const newHistory = [...history];
    const prevTubes = newHistory.pop();
    setTubes(prevTubes);
    setHistory(newHistory);
    setSelectedTube(-1);
  }, [isMoving, hasLost, hasWon, history]);

  const handleRestart = useCallback(() => {
    if (isMoving) return;
    initLevel();
  }, [isMoving, initLevel]);

  const handleHint = useCallback(() => {
    if (isMoving || hasWon || hasLost) return;
    const validMoves = getValidMoves(tubes, capacity);
    if (validMoves.length > 0) {
      setSelectedTube(validMoves[0][0]); // Select the source tube of a valid move
    }
  }, [tubes, capacity, isMoving, hasLost, hasWon]);

  const registerMove = useCallback(() => {
    setMovesUsed(prev => prev + 1);
  }, []);

  return {
    tubes,
    setTubes,
    history,
    setHistory,
    selectedTube,
    setSelectedTube,
    hasWon,
    hasLost,
    isMoving,
    setIsMoving,
    movesUsed,
    moveLimit,
    movesRemaining: Math.max(moveLimit - movesUsed, 0),
    registerMove,
    tubeLayouts,
    onTubeLayout,
    handleUndo,
    handleRestart,
    handleHint,
    numTubes,
    capacity
  };
};
