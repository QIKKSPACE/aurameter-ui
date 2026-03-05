import React, { useEffect } from "react";
import { View } from "react-native";
import { useDispatch, useStore } from "react-redux";
import TetrisNavBar from "../components/TetrisNavBar";
import TetrisGestureWrapper from "../game/TetrisGestureWrapper";
import { startGame } from "../store/tetrisGameSlice";
import { spawnPiece } from "../game/tetrisEngine";
import { startGravityLoop } from "../game/tetrisGravityLoop";
export default function TetrisTestScreen() {
  const dispatch = useDispatch();
  const store = useStore();
  const score = 1234; // pull from Redux slice if you want dynamic
useEffect(() => {
  const stop = startGravityLoop(dispatch, store);
  return () => stop();
}, [dispatch, store]);

  useEffect(() => {
    // Start fresh game
    dispatch(startGame());

    // Spawn first piece
    dispatch(spawnPiece);
  }, [dispatch]);

  return (
    <View style={{ flex: 1 }}>
          <TetrisNavBar score={score} />
      <TetrisGestureWrapper />
    </View>
  );
}
