/**
 * Zip Challenge Game Configuration
 * Global game settings and constants
 */

export const GAME_CONFIG = {
  // UI
  CONTAINER_PADDING_HORIZONTAL: 16,
  BOARD_BORDER_RADIUS: 12,
  BOARD_BORDER_WIDTH: 2,

  // Game
  MIN_GRID_SIZE: 5,
  MAX_GRID_SIZE: 9,
  MIN_NODES: 3,
  MAX_NODES: 10,
  MAX_OBSTACLES: 20,

  // Timer
  TIMER_INTERVAL_MS: 1000,
  MAX_TIME_LIMIT_MS: 3600000, // 1 hour

  // Hints
  MAX_HINTS_EASY: 3,
  MAX_HINTS_MEDIUM: 2,
  MAX_HINTS_HARD: 1,

  // Animations
  NODE_PULSE_DURATION_MS: 1500,
  PATH_DRAW_DURATION_MS: 300,
  COMPLETION_ANIMATION_MS: 800,

  // Storage
  STORAGE_KEY: "ZIP_GAME_PROGRESS",

  // Difficulty
  EASY_LEVEL_COUNT: 10,
  MEDIUM_LEVEL_COUNT: 20,
  MAX_LEVELS: 30,

  // Gesture
  TAP_THRESHOLD_MS: 200,
  GESTURE_SENSITIVITY: 0.95,

  // Debug
  DEBUG_MODE: false,
  LOG_GAME_STATE: false,
} as const;

/**
 * Difficulty colors used in UI
 */
export const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "#4CAF50",
  MEDIUM: "#FFA500",
  HARD: "#FF6B6B",
} as const;

/**
 * Get hint limit for difficulty
 */
export const getHintLimit = (difficulty: "EASY" | "MEDIUM" | "HARD"): number => {
  switch (difficulty) {
    case "EASY":
      return GAME_CONFIG.MAX_HINTS_EASY;
    case "MEDIUM":
      return GAME_CONFIG.MAX_HINTS_MEDIUM;
    case "HARD":
      return GAME_CONFIG.MAX_HINTS_HARD;
    default:
      return GAME_CONFIG.MAX_HINTS_MEDIUM;
  }
};

/**
 * Get difficulty for level
 */
export const getDifficultyForLevelId = (levelId: number): "EASY" | "MEDIUM" | "HARD" => {
  if (levelId <= GAME_CONFIG.EASY_LEVEL_COUNT) {
    return "EASY";
  }
  if (levelId <= GAME_CONFIG.MEDIUM_LEVEL_COUNT) {
    return "MEDIUM";
  }
  return "HARD";
};

/**
 * Calculate score based on time and hints
 */
export const calculateScore = (
  timeSeconds: number,
  hintsUsed: number,
  gridSize: number,
  nodeCount: number
): number => {
  const baseScore = 100;
  const sizeBonus = (gridSize - 4) * 10;
  const nodeBonus = (nodeCount - 2) * 5;

  // Time penalty: lose 1 point per 5 seconds
  const timePenalty = Math.floor(timeSeconds / 5);

  // Hint penalty: lose 10 points per hint
  const hintPenalty = hintsUsed * 10;

  const finalScore = Math.max(
    0,
    baseScore + sizeBonus + nodeBonus - timePenalty - hintPenalty
  );

  return Math.round(finalScore);
};
