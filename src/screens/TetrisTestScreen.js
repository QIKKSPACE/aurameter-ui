import React, { useEffect, useRef } from "react";
import { StatusBar, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import TetrisGestureWrapper from "../game/TetrisGestureWrapper";
import { initGame } from "../store/tetrisGameSlice";

export default function TetrisTestScreen() {
  const dispatch = useDispatch();
  const rehydrated = useSelector((state) => state._persist?.rehydrated);
  const didInitRef = useRef(false);

  useEffect(() => {
    if (!rehydrated || didInitRef.current) {
      return;
    }

    didInitRef.current = true;
    dispatch(initGame());
  }, [dispatch, rehydrated]);

  return (
    <View style={{ flex: 1, backgroundColor: "#050712" }}>
      <StatusBar hidden />
      <TetrisGestureWrapper />
    </View>
  );
}
