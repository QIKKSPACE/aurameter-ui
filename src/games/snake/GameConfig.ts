/**
 * Centralized configuration for Snake Game
 * All magic numbers, colors, durations, and game constants are defined here
 * for easy tuning and maintenance
 */

export const GAME_CONFIG = {
  // ============================================
  // BOARD & GRID CONFIGURATION
  // ============================================
  GRID_SIZE: 20,
  BOARD_PADDING: 10,
  BOARD_BORDER_RADIUS: 26,
  BOARD_FRAME_BORDER_RADIUS: 20,
  BOARD_SHELL_SHADOW_RADIUS: 18,
  BOARD_SHELL_SHADOW_OFFSET_Y: 10,
  BOARD_SHELL_ELEVATION: 12,
  BOARD_SHELL_SHADOW_OPACITY: 0.25,
  GRID_LINE_OPACITY: 0.04,
  BOARD_BACKGROUND_FALLBACK: "#0D0D0D",

  // ============================================
  // GAME MECHANICS - SCORING & PROGRESSION
  // ============================================
  FOOD_POINTS: {
    normal: 1,
    golden: 4,
    speed: 2,
    shield: 3,
    red_apple: 5,
  },
  
  // Food spawn thresholds (probability-based)
  FOOD_SPAWN_THRESHOLDS: {
    shield: { minScore: 20, probability: 0.985 },    // very rare
    golden: { minScore: 12, probability: 0.96 },     // rare
    speed: { minScore: 6, probability: 0.9 },        // occasional
  },

  // Food spawning configuration
  FOOD_MIN_SPAWN_DISTANCE: 3,                         // Manhattan distance from snake head
  FOOD_FAIR_CANDIDATE_THRESHOLD: 3,                   // 1/3 threshold for fair spawn position
  FOOD_ID_RANDOMIZER: 100000,                         // For unique food IDs

  // Speed progression
  SPEED_STEP_SCORE: 4,                                // Number of foods eaten before speed increases
  BASE_TICK_SPEED: 400,                               // Base game loop interval (ms) - SLOWED DOWN
  MIN_TICK_SPEED: 150,                                // Minimum game loop interval (ms) - SLOWED DOWN
  TICK_SPEED_REDUCTION_PER_STEP: 8,                   // ms reduction per score step
  SPEED_BOOST_REDUCTION: 35,                          // ms reduction when speed boosted
  SPEED_BOOST_DURATION: 18,                           // Number of moves with speed boost active
  SPEED_PRESETS: [
    { id: "slow", label: "Slow", tickSpeed: 520 },
    { id: "normal", label: "Normal", tickSpeed: 400 },
    { id: "fast", label: "Fast", tickSpeed: 300 },
    { id: "insane", label: "Insane", tickSpeed: 220 },
  ] as const,
  DEFAULT_SPEED_PRESET: "normal" as const,

  // Red Apple (timer-based special food)
  RED_APPLE_SPAWN_INTERVAL: 8000,                     // Spawn a red apple every 8 seconds
  RED_APPLE_LIFETIME: 5000,                           // Red apple visible for 5 seconds then despawns
  RED_APPLE_SPAWN_GATE: 7,                            // Only spawn red apples after eating 7 normal apples
  HOLD_SPEED_BOOST_REDUCTION: 30,                     // ms reduction while holding button (separate from tap boost)

  // Multiplier & Combo
  MAX_MULTIPLIER: 4,                                  // Maximum score multiplier (1 + streak/2, capped)
  COMBO_WINDOW_MS: 4500,                              // Window for consecutive food to maintain combo

  // Direction & Controls
  INITIAL_DIRECTION: 'UP' as const,
  SWIPE_THRESHOLD: 18,                                // pixels moved to trigger direction change
  SWIPE_GESTURE_ENABLED: true,

  // Shield mechanics
  SHIELD_ABILITY: {
    enabled: true,
    cost: 1,                                           // Consumes 1 shield charge per collision
  },

  // ============================================
  // ANIMATIONS & VISUAL EFFECTS (in milliseconds)
  // ============================================
  
  // Segment movement animation
  SEGMENT_ANIMATION_DURATION: 0,                      // Instant movement (no trailing)
  SEGMENT_ANIMATION_EASING: 'linear',

  // Snake head/body visual differences
  SNAKE_HEAD_BORDER_RADIUS_MULTIPLIER: 0.32,
  SNAKE_BODY_BORDER_RADIUS_MULTIPLIER: 0.28,
  SNAKE_HEAD_SHADOW_OPACITY: 0.75,
  SNAKE_BODY_SHADOW_OPACITY: 0.45,
  SNAKE_HEAD_SHADOW_RADIUS: 8,
  SNAKE_BODY_SHADOW_RADIUS: 4,

  // Food pulsing animation
  FOOD_PULSE_ANIMATION: {
    scaleUp: 1.1,
    scaleDown: 0.95,
    duration: 500,                                     // Total pulse cycle duration
    repeatCount: 4,                                    // Number of pulse cycles
  },

  // Food visual sizing
  FOOD_OFFSET_MULTIPLIER: 0.14,                       // Center offset for positioning
  FOOD_SIZE_MULTIPLIER: 0.7,                          // Size relative to cell
  FOOD_BORDER_RADIUS_MULTIPLIER: 0.35,                // Circular shape
  FOOD_SHADOW_RADIUS: 12,
  FOOD_SHADOW_OPACITY: 0.85,

  // Pulse feedback (when food eaten)
  PULSE_FEEDBACK_SCALE: 2.4,
  PULSE_FEEDBACK_DURATION: 380,

  // Board glow animation
  BOARD_GLOW_CYCLE_DURATION: 1800,                    // Complete glow cycle (ms)
  BOARD_GLOW_MAX: 0.34,
  BOARD_GLOW_MIN: 0.16,

  // Collision shake effect
  SHAKE_AMPLITUDE: 8,                                 // pixels
  SHAKE_SEQUENCE: [
    { offset: -8, duration: 40 },
    { offset: 8, duration: 70 },
    { offset: -4, duration: 55 },
    { offset: 0, duration: 40 },
  ],

  // Countdown animation
  COUNTDOWN_STEP_DURATION: 1000,                       // Duration between countdown frames - SLOWER
  COUNTDOWN_STEPS: ["3", "2", "1", "Start"] as const,

  // ============================================
  // UI LAYOUT & SPACING
  // ============================================
  
  // Container padding
  CONTAINER_PADDING_HORIZONTAL: 16,
  CONTAINER_PADDING_TOP: 8,
  CONTAINER_PADDING_BOTTOM: 20,

  // Header styling
  HEADER_MARGIN_BOTTOM: 18,
  CLOSE_BUTTON_WIDTH: 42,
  CLOSE_BUTTON_HEIGHT: 42,
  CLOSE_BUTTON_BORDER_RADIUS: 21,

  // Score card styling
  SCORE_CARD_BORDER_RADIUS: 22,
  SCORE_CARD_PADDING: 16,
  SCORE_CARD_MARGIN_BOTTOM: 16,
  SCORE_CARD_TITLE_MARGIN_BOTTOM: 12,

  // Progress bar styling
  PROGRESS_BAR_HEIGHT: 8,
  PROGRESS_BAR_BORDER_RADIUS: 999,
  PROGRESS_BAR_MARGIN_TOP: 12,

  // Chip buttons
  CHIP_BORDER_RADIUS: 14,
  CHIP_PADDING_VERTICAL: 10,
  CHIP_MARGIN_HORIZONTAL: 4,
  CHIP_MARGIN_TOP: 14,

  // Controls styling
  CONTROLS_WRAP_MARGIN_TOP: 18,
  CONTROLS_WRAP_BORDER_RADIUS: 22,
  CONTROLS_WRAP_PADDING: 16,
  CONTROLS_HINT_MARGIN_TOP: 10,
  CONTROLS_HINT_OPACITY: 0.8,

  // Control pad dimensions
  CONTROL_PAD_WIDTH: 180,
  CONTROL_PAD_HEIGHT: 180,
  CONTROL_PAD_BORDER_RADIUS: 90,
  CONTROL_PAD_CENTER_INDICATOR_WIDTH: 74,
  CONTROL_PAD_CENTER_INDICATOR_HEIGHT: 74,
  CONTROL_PAD_CENTER_INDICATOR_BORDER_RADIUS: 37,
  CONTROL_PAD_LABEL_OFFSET: 18,

  // Modal styling
  MODAL_BACKDROP_OPACITY: 0.72,
  MODAL_CARD_BORDER_RADIUS: 24,
  MODAL_CARD_PADDING: 22,
  MODAL_CARD_BUTTON_HEIGHT: 48,
  MODAL_CARD_BUTTON_BORDER_RADIUS: 16,
  MODAL_BUTTON_MARGIN_TOP: 18,
  MODAL_BUTTON_HORIZONTAL_MARGIN: 6,
  MODAL_BUTTONS_MARGIN_TOP: 18,

  // Score display
  SCORE_DISPLAY_LINE_HEIGHT: 34,

  // Paused badge
  PAUSED_BADGE_PADDING_HORIZONTAL: 12,
  PAUSED_BADGE_PADDING_VERTICAL: 6,
  PAUSED_BADGE_BORDER_RADIUS: 999,
  PAUSED_BADGE_BACKGROUND: "rgba(0,0,0,0.45)",

  // ============================================
  // COLORS & THEME
  // ============================================
  
  FOOD_COLORS: {
    normal: { name: "Apple", fallback: "#FF6961" },   // Uses theme.text.accent as primary
    golden: { name: "Golden", color: "#F4C542" },
    speed: { name: "Boost", color: "#FF7A59" },
    shield: { name: "Shield", color: "#7CF29A" },
    red_apple: { name: "Red Apple", color: "#E63946" },  // Deep red color for timer-based apple
  },

  // Snake glow/shadow colors use theme.text.accent

  // ============================================
  // STORAGE & PERSISTENCE
  // ============================================
  
  STORAGE_KEY_HIGH_SCORE: "@aurameter/snake-high-score",
  STORAGE_KEY_GAME_STATE: "@aurameter/snake-state",
  STORAGE_KEY_SPEED_PRESET: "@aurameter/snake-speed-preset",

  // ============================================
  // CHALLENGE METADATA
  // ============================================
  
  CHALLENGE_ID: "snake",
  CHALLENGE_TITLE: "Snake Master",
  CHALLENGE_DESCRIPTION: "Eat as many apples as possible.",
  CHALLENGE_REWARD: 30,

  // ============================================
  // UI STRINGS (Localizable)
  // ============================================
  
  STRINGS: {
    TITLE: "Snake Master",
    DESCRIPTION: "Eat as many apples as possible.",
    COMBO_HINT: "Keep the combo alive",
    PAUSED_TEXT: "Paused",
    GAME_OVER_TITLE: "Game Over",
    GAME_OVER_RESTART_BUTTON: "Restart",
    GAME_OVER_EXIT_BUTTON: "Exit",
    SCORE_LABEL: "Score",
    HIGH_SCORE_LABEL: "High Score",
    MULTIPLIER_LABEL: "Multiplier",
    SHIELD_LABEL: "Shield",
    COMBO_LABEL: "Combo",
    PACE_LABEL: "Pace",
    PACE_STEADY: "Steady",
    PACE_RISING: "Rising",
    PACE_FAST: "Fast",
    SPEED_LABEL: "Speed",
    SPEED_SELECT_LABEL: "Select speed",
    SWIPE_HINT: "Swipe anywhere in the pad to steer. Reverse turns are blocked.",
    CONTROL_UP: "UP",
    CONTROL_DOWN: "DOWN",
    CONTROL_LEFT: "LEFT",
    CONTROL_RIGHT: "RIGHT",
    CONTROL_CENTER: "Swipe",
    REWARD_PREFIX: "Reward: +",
    REWARD_SUFFIX: " Aura",
  },

  // ============================================
  // PACE THRESHOLDS
  // ============================================
  
  PACE_THRESHOLDS: {
    FAST: 0.99,
    RISING: 0.5,
    STEADY: 0.0,
  },

  // ============================================
  // VALIDATION & CONSTRAINTS
  // ============================================
  
  MIN_GRID_SIZE: 10,
  MAX_GRID_SIZE: 50,
  MIN_SCORE: 0,
  MAX_SCORE: 9999,

  // ============================================
  // DEBUGGING & LOGGING
  // ============================================
  
  DEBUG_MODE: false,
  LOG_GAME_EVENTS: false,
  LOG_COLLISIONS: false,
  LOG_FOOD_SPAWN: false,
} as const;

// Type for strict config access
export type GameConfigType = typeof GAME_CONFIG;

// Helper to safely access config values with type inference
export const getConfig = <T extends keyof typeof GAME_CONFIG>(key: T): (typeof GAME_CONFIG)[T] => {
  return GAME_CONFIG[key];
};
