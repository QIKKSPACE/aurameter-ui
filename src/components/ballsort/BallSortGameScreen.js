// src/screens/BallSortGame.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

// Deep clone helper
const deepClone = (arr) => arr.map((tube) => [...tube]);

// Shuffle tubes for game
const generateTubes = (numColors, numTubes, capacity, colors) => {
  const selected = colors.slice(0, numColors);

  let state = [];
  for (let i = 0; i < numColors; i++) {
    state.push(Array(capacity).fill(selected[i]));
  }
  for (let i = numColors; i < numTubes; i++) state.push([]);

  const getValidMoves = (s) => {
    const moves = [];
    for (let f = 0; f < s.length; f++) {
      if (s[f].length === 0) continue;
      for (let t = 0; t < s.length; t++) {
        if (f !== t && s[t].length < capacity) moves.push([f, t]);
      }
    }
    return moves;
  };

  const shuffleMoves = Math.max(80, numColors * 25);
  for (let m = 0; m < shuffleMoves; m++) {
    const valid = getValidMoves(state);
    if (!valid.length) break;

    const [from, to] = valid[Math.floor(Math.random() * valid.length)];
    const movingBall = state[from][state[from].length - 1];

    state = state.map((tube, idx) => {
      if (idx === from) return tube.slice(0, -1);
      if (idx === to) return [...tube, movingBall];
      return [...tube];
    });
  }

  return state;
};

const isWin = (tubes, capacity) =>
  tubes.every(
    (tube) =>
      tube.length === 0 ||
      (tube.length === capacity && tube.every((ball) => ball === tube[0]))
  );

const isTubeComplete = (tube, capacity) =>
  tube.length === capacity && tube.every((ball) => ball === tube[0]);

const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const BallSortGame = () => {
  const { theme } = useTheme();

  // Game constants
  const CAPACITY = 4;
  const BALL_SIZE = 40;
  const TUBE_PADDING = 20;

  // Colors
  const COLORS = [
    "#FF6961",
    "#5B5BFF",
    "#77DD77",
    "#FFD700",
    "#CBAACB",
    "#FFB347",
    "#FFC0CB",
    "#80DEEA",
  ];

  // Core state
  const [level, setLevel] = useState(1);
  const numColors = level + 2; 
  const numTubes = numColors + 2;

  const [tubes, setTubes] = useState([]);
  const [initialTubes, setInitialTubes] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedTube, setSelectedTube] = useState(-1);
  const [hasWon, setHasWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [movingBall, setMovingBall] = useState(null);

  const tubeLayoutsRef = useRef([]);
  const containerLayout = useRef(null);
  const isAnimating = useRef(false);

  // Animations
  const liftValue = useSharedValue(0);
  const leftValue = useSharedValue(0);
  const topValue = useSharedValue(0);

  const selectStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: liftValue.value }],
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: leftValue.value,
    top: topValue.value,
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
  }));

  // Init / reset each level
  useEffect(() => {
    if (level > 4) {
      setGameOver(true);
      return;
    }

    const newTubes = generateTubes(numColors, numTubes, CAPACITY, COLORS);
    setTubes(deepClone(newTubes));
    setInitialTubes(deepClone(newTubes));
    setHistory([]);
    setSelectedTube(-1);
    setMovingBall(null);
    setHasWon(false);

    tubeLayoutsRef.current = [];
    isAnimating.current = false;
    liftValue.value = 0;
    leftValue.value = 0;
    topValue.value = 0;
  }, [level]);

  // Win check
  useEffect(() => {
    if (tubes.length > 0 && isWin(tubes, CAPACITY)) setHasWon(true);
  }, [tubes]);

  // ===== Game Actions =====
  const saveTubeLayout = (i, layout) => {
    tubeLayoutsRef.current[i] = layout;
  };

  const finishMove = (fromIndex, toIndex) => {
    setTubes((prev) => {
      const next = prev.map((t) => [...t]);
      const ball = next[fromIndex].pop();
      if (ball) next[toIndex].push(ball);
      return next;
    });
    setSelectedTube(-1);
    setMovingBall(null);
    isAnimating.current = false;
  };

const onTubePress = (index) => {
  if (isAnimating.current || hasWon || gameOver) return;
  if (!tubeLayoutsRef.current[index]) return;

  if (selectedTube === -1) {
    if (tubes[index].length > 0) {
      setSelectedTube(index);
      liftValue.value = withSpring(-18);
    }
    return;
  }

  if (selectedTube === index) {
    setSelectedTube(-1);
    liftValue.value = withSpring(0);
    return;
  }

  const from = selectedTube;
  const to = index;
  const fromTube = tubes[from];
  const toTube = tubes[to];

  if (fromTube.length === 0) {
    setSelectedTube(-1);
    liftValue.value = withSpring(0);
    return;
  }

  if (toTube.length >= CAPACITY) {
    setSelectedTube(index);
    liftValue.value = withSpring(tubes[index].length > 0 ? -18 : 0);
    return;
  }

  const fromLayout = tubeLayoutsRef.current[from];
  const toLayout = tubeLayoutsRef.current[to];
  const ball = fromTube[fromTube.length - 1];

  if (!fromLayout || !toLayout || !containerLayout.current) {
    finishMove(from, to);
    return;
  }

  // ✅ Fix: adjust Y coordinates relative to container
  const containerY = containerLayout.current?.y || 0;
  const containerX = containerLayout.current?.x || 0;

  const initialLeft =
    fromLayout.x - containerX + (fromLayout.width - BALL_SIZE) / 2;
  const initialTop =
    fromLayout.y - containerY +
    fromLayout.height -
    fromTube.length * BALL_SIZE -
    TUBE_PADDING / 2;

  const targetLeft =
    toLayout.x - containerX + (toLayout.width - BALL_SIZE) / 2;
  const targetTop =
    toLayout.y - containerY +
    toLayout.height -
    (toTube.length + 1) * BALL_SIZE -
    TUBE_PADDING / 2;

  // ✅ Arc now works correctly (ball rises above both positions)
  const arcTop = Math.min(initialTop, targetTop) - 80;

  isAnimating.current = true;
  setMovingBall({ color: ball });
  leftValue.value = initialLeft;
  topValue.value = initialTop;

  setHistory((prev) => [...prev, deepClone(tubes)]);

  topValue.value = withTiming(arcTop, { duration: 280 }, () => {
    leftValue.value = withTiming(targetLeft, { duration: 360 }, () => {
      topValue.value = withTiming(targetTop, { duration: 260 }, () => {
        runOnJS(finishMove)(from, to);
      });
    });
  });

  liftValue.value = withSpring(0);
};


  const onUndo = () => {
    if (isAnimating.current || hasWon) return;
    setHistory((prev) => {
      if (!prev.length) return prev;
      const copy = [...prev];
      const prevTubes = copy.pop();
      setTubes(prevTubes.map((t) => [...t]));
      return copy;
    });
    setSelectedTube(-1);
    liftValue.value = withSpring(0);
  };

  const onRestart = () => {
    if (isAnimating.current) return;
    setTubes(deepClone(initialTubes));
    setHistory([]);
    setSelectedTube(-1);
    liftValue.value = withSpring(0);
    setHasWon(false);
  };

  const onNextLevel = () => setLevel((p) => p + 1);

  const rowSize = numTubes <= 12 ? 6 : 7;

  // ===== UI =====
  return (
    <ScreenBackground>
        <View edges={["top"]} style={styles.overlay}>

  
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: theme.components.box + "99" }, // semi-transparent
          ]}
        >
          <Text style={[styles.levelText, { color: theme.text.primary }]}>
            {gameOver ? "Game Over 🎮" : `Level ${level}`}
          </Text>

          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={onUndo} style={styles.iconButton}>
              <Icon name="undo" size={22} color={theme.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRestart} style={styles.iconButton}>
              <Icon name="restart-alt" size={22} color={theme.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="leaderboard" size={22} color={theme.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {gameOver ? (
          <View style={styles.centerBox}>
            <Text style={[styles.winText, { color: theme.text.accent }]}>
              🎉 Game Completed!
            </Text>
            <TouchableOpacity
              onPress={() => {
                setLevel(1);
                setGameOver(false);
              }}
              style={[styles.nextButton, { backgroundColor: theme.text.accent }]}
            >
              <Text style={[styles.buttonText, { color: theme.text.primary }]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableWithoutFeedback
  onPress={() => {
  if (selectedTube !== -1) {
    // Animate ball dropping back
    liftValue.value = withSpring(0, {}, (isFinished) => {
      if (isFinished) {
        runOnJS(setSelectedTube)(-1);
      }
    });
  }
  
}}

>
  <View style={{ minHeight: 300 }}>

          <View
            key={`level-${level}`}
            style={styles.tubesContainer}
            onLayout={(e) => {
              containerLayout.current = e.nativeEvent.layout;
            }}
          >
            {chunkArray(tubes, rowSize).map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.row}>
                {row.map((tube, i) => {
                  const tubeIndex = rowIndex * rowSize + i;
                  const complete = isTubeComplete(tube, CAPACITY);

                  return (
                    <TouchableOpacity
                      key={`tube-${tubeIndex}`}
                      activeOpacity={0.9}
                      onPress={() => onTubePress(tubeIndex)}
                      onLayout={(e) => {
                        const { x, y, width, height } = e.nativeEvent.layout;
                        saveTubeLayout(tubeIndex, { x, y, width, height });
                      }}
                    >
                      <View
                        style={[
                          styles.tube,
                          { backgroundColor: theme.components.card },
                          complete && { shadowColor: theme.text.accent },
                        ]}
                      >
                        {tube.map((color, j) => {
                          const isTop = j === tube.length - 1;
                          const isSelected =
                            isTop && tubeIndex === selectedTube && !movingBall;
                          const key = `ball-${tubeIndex}-${j}-${color}-${tube.length}`;
                          return (
                            <Animated.View
                              key={key}
                              style={[
                                styles.ball,
                                { backgroundColor: color },
                                isSelected && selectStyle,
                              ]}
                            />
                          );
                        })}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {movingBall && (
              <Animated.View style={[animatedStyle]}>
                <View
                  style={{
                    width: BALL_SIZE,
                    height: BALL_SIZE,
                    borderRadius: BALL_SIZE / 2,
                    backgroundColor: movingBall.color,
                  }}
                />
              </Animated.View>
            )}
          </View>
  </View>

          </TouchableWithoutFeedback>
        )}

        {/* Victory Overlay */}
        {hasWon && !gameOver && (
          <View style={styles.centerBox}>
            <Text style={[styles.winText, { color: theme.text.accent }]}>
              🎉 Victory!
            </Text>
            <TouchableOpacity
              onPress={onNextLevel}
              style={[styles.nextButton, { backgroundColor: theme.text.accent }]}
            >
              <Text style={[styles.buttonText, { color: theme.text.primary }]}>
                Next Level
              </Text>
            </TouchableOpacity>
          </View>
        )}
            </View>

    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 12,
  },
  levelText: { fontSize: 20, fontWeight: "bold" },
  headerButtons: { flexDirection: "row" },
  iconButton: { marginLeft: 12 },
  tubesContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    position: "relative",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  tube: {
    width: 50,
    height: 180,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderColor: "#999",
    justifyContent: "flex-end",
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingBottom: 10,
  },
  ball: { width: 40, height: 40, borderRadius: 20, marginBottom: 6 },
  winText: { fontSize: 26, fontWeight: "bold", marginBottom: 14 },
  centerBox: { alignItems: "center" },
  nextButton: { padding: 12, borderRadius: 10, marginTop: 10 },
  buttonText: { fontSize: 16, fontWeight: "700" },
});

export default BallSortGame;
