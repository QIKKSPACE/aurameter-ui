import React, { useCallback } from "react";
import { View } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";


import TetrisRenderer from "./TetrisRenderer";
import {
  movePiece,
  rotatePiece,
  dropPiece,
  hardDrop,
} from "../game/tetrisEngine";
import { runOnJS } from "react-native-worklets";

export default function TetrisGestureWrapper() {
  const dispatch = useDispatch();

  /* ───────── JS callbacks (stable references) ───────── */

  const moveLeft = useCallback(() => {
    dispatch(movePiece("left"));
  }, [dispatch]);

  const moveRight = useCallback(() => {
    dispatch(movePiece("right"));
  }, [dispatch]);

  const softDrop = useCallback(() => {
    dispatch(dropPiece());
  }, [dispatch]);

  const rotate = useCallback(() => {
    dispatch(rotatePiece());
  }, [dispatch]);

  const doHardDrop = useCallback(() => {
    dispatch(hardDrop());
  }, [dispatch]);

  /* ───────── Pan gesture (ONE action per swipe) ───────── */

const panGesture = Gesture.Pan()
  .minDistance(20)
  .onEnd((e) => {
    "worklet";

    const absX = Math.abs(e.translationX);
    const absY = Math.abs(e.translationY);

    if (absX > absY) {
      if (e.translationX < 0) {
        runOnJS(moveLeft)();
      } else {
        runOnJS(moveRight)();
      }
    } else {
      if (e.translationY > 0) {
        runOnJS(softDrop)();
      }
    }
  });

const tapGesture = Gesture.Tap()
  .numberOfTaps(1)
  .maxDistance(10)        // 🔑 critical

  .onEnd(() => {
    "worklet";
    runOnJS(rotate)();
  });

const doubleTapGesture = Gesture.Tap()
  .numberOfTaps(2)
  .maxDistance(10)
  .onEnd(() => {
    "worklet";
    runOnJS(doHardDrop)();
  });

const gesture = Gesture.Exclusive(
  doubleTapGesture,
  Gesture.Simultaneous(panGesture, tapGesture)
);

  return (
    <GestureDetector gesture={gesture}>
      <View style={{ flex: 1 }}>
        <TetrisRenderer />
      </View>
    </GestureDetector>
  );
}
