import ReactNativeHapticFeedback from "react-native-haptic-feedback";

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const Haptics = {
  light: () => ReactNativeHapticFeedback.trigger("impactLight", options),
  medium: () => ReactNativeHapticFeedback.trigger("impactMedium", options),
  heavy: () => ReactNativeHapticFeedback.trigger("impactHeavy", options),
  success: () => ReactNativeHapticFeedback.trigger("notificationSuccess", options),
  error: () => ReactNativeHapticFeedback.trigger("notificationError", options),
  warning: () => ReactNativeHapticFeedback.trigger("notificationWarning", options),
  selection: () => ReactNativeHapticFeedback.trigger("selection", options),
};

// Game specific mappings
export const GameHaptics = {
  selectTube: Haptics.light,
  dropBall: Haptics.medium,
  invalidMove: Haptics.error,
  levelWin: Haptics.success,
  buttonPress: Haptics.selection,
  tetrisMove: Haptics.selection,
  tetrisRotate: Haptics.light,
  tetrisSoftDrop: Haptics.selection,
  tetrisHardDrop: Haptics.medium,
  tetrisLineClear: Haptics.success,
  tetrisTetrisClear: Haptics.heavy,
  tetrisGameOver: Haptics.error,
  numberPuzzleTap: Haptics.selection,
  numberPuzzleWrong: Haptics.warning,
  numberPuzzleCorrect: Haptics.light,
  numberPuzzleComplete: Haptics.success,
};

// Backward compatibility for other games (KenKen, Snake)
const triggerHapticFeedback = {
  impact: Haptics.medium,
  success: Haptics.success,
  error: Haptics.error,
};

export default triggerHapticFeedback;
