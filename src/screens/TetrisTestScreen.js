import React, { useEffect } from "react";
import { StatusBar, View } from "react-native";
import { useDispatch } from "react-redux";
import TetrisGestureWrapper from "../game/TetrisGestureWrapper";
import { initGame } from "../store/tetrisGameSlice";

export default function TetrisTestScreen() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initGame());
  }, [dispatch]);

  return (
    <View style={{ flex: 1, backgroundColor: "#050712" }}>
      <StatusBar hidden />
      <TetrisGestureWrapper />
    </View>
  );
}
