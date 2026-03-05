import React, { useRef, useState } from "react";
import { Pressable, View } from "react-native";

import ScreenBackground from "../components/ScreenBackground";
import GameHeader from "../components/ballsort/GameHeader";
import TubeGrid from "../components/ballsort/TubeGrid";
import WinOverlay from "../components/ballsort/WinOverlay";


import { useBallSortGame } from "../hooks/useBallSortGame";
import { COLORS, CAPACITY } from "../constants/constants";
import { deepClone } from "../utils/clone";
import { useTheme } from "../constants/context/ThemeContext";

const BallSortGameScreen = () => {
  const { theme } = useTheme();

  // ✅ TEMP level state
  const [level, setLevel] = useState(1);

  const {
    tubes,
    setTubes,
    history,
    setHistory,
    selectedTube,
    setSelectedTube,
    hasWon,
  } = useBallSortGame({
    level,
    capacity: CAPACITY,
    colors: COLORS,
  });
const canMove = (from, to, tubes, capacity) => {
  if (from === to) return false;
  if (!tubes[from].length) return false;
  if (tubes[to].length >= capacity) return false;

  if (!tubes[to].length) return true;

  return true;
};

  // ✅ basic tube tap logic (NO animation yet)
 const onTubePress = (index) => {
  // 1️⃣ No tube selected → select
  if (selectedTube === -1) {
  // ❗️do NOT select empty tube
  if (!tubes[index].length) return;

  setSelectedTube(index);
  return;
}

  // 2️⃣ Same tube tapped → deselect
  if (selectedTube === index) {
    setSelectedTube(-1);
    return;
  }

  const from = selectedTube;
  const to = index;

  // 3️⃣ Validate move
  if (!canMove(from, to, tubes, CAPACITY)) {
    setSelectedTube(-1);
    return;
  }

  // 4️⃣ Perform move
  const newTubes = deepClone(tubes);
  const ball = newTubes[from].pop();
  newTubes[to].push(ball);

  setHistory([...history, tubes]);
  setTubes(newTubes);
  setSelectedTube(-1);
};

const tubeLayouts = useRef({});

const onTubeLayout = (index, layout) => {
  tubeLayouts.current[index] = layout;
};
  return (
    <ScreenBackground>
      <GameHeader
        level={level}
        onUndo={() => {}}
        onRestart={() => setLevel(level)}
        theme={theme}
      />
<Pressable
  style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
  onPress={() => setSelectedTube(-1)}
> 

      <TubeGrid
        tubes={tubes}
        selectedTube={selectedTube}
        onTubePress={onTubePress}
        theme={theme}
        rowSize={4}
        capacity={CAPACITY}
          onTubeLayout={onTubeLayout}

      />
</Pressable>

      {hasWon && (
        <WinOverlay
          theme={theme}
          onNext={() => setLevel(level + 1)}
        />
      )}
    </ScreenBackground>
  );
};

export default BallSortGameScreen;
