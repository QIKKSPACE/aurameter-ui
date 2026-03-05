import { useRef } from "react";
import {
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

export const useBallAnimation = ({ ballSize }) => {
  const isAnimating = useRef(false);

  const lift = useSharedValue(0);
  const left = useSharedValue(0);
  const top = useSharedValue(0);

  const reset = () => {
    lift.value = 0;
    left.value = 0;
    top.value = 0;
    isAnimating.current = false;
  };

  return {
    isAnimating,
    lift,
    left,
    top,
    reset,
    withTiming,
    withSpring,
    runOnJS,
  };
};
