import { useEffect, useState } from "react";
import { generateTubes } from "../utils/generator";
import { isWin } from "../utils/rules";
import { deepClone } from "../utils/clone";

export const useBallSortGame = ({ level, capacity, colors }) => {
  const MAX_COLORS = colors.length;

  const numColors = Math.min(
    3 + Math.floor(level / 4),
    MAX_COLORS
  );

  const emptyTubes =
    numColors <= 6 ? 2 :
    numColors <= 9 ? 3 :
    3;

  const numTubes = numColors + emptyTubes;

  const [tubes, setTubes] = useState([]);
  const [initialTubes, setInitialTubes] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedTube, setSelectedTube] = useState(-1);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    let newTubes;
    do {
      newTubes = generateTubes(
        numColors,
        numTubes,
        capacity,
        colors,
        level
      );
    } while (isWin(newTubes, capacity));

    setTubes(deepClone(newTubes));
    setInitialTubes(deepClone(newTubes));
    setHistory([]);
    setSelectedTube(-1);
    setHasWon(false);
  }, [level, numColors, numTubes, capacity, colors]);

  useEffect(() => {
    if (tubes.length && isWin(tubes, capacity)) {
      setHasWon(true);
    }
  }, [tubes, capacity]);

  return {
    tubes,
    setTubes,
    initialTubes,
    history,
    setHistory,
    selectedTube,
    setSelectedTube,
    hasWon,
    numTubes,
    numColors,
  };
};

