import { createSlice } from "@reduxjs/toolkit";

/**
 * Constants
 */
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const INITIAL_DROP_INTERVAL = 400; // ms
const MIN_DROP_INTERVAL = 120;
const LEVEL_SPEED_STEP = 60;

const SCORE_TABLE = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
};

/**
 * Helpers
 */
const createEmptyBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(0)
  );

const calculateLevel = (linesCleared) =>
  Math.floor(linesCleared / 10) + 1;

const calculateDropInterval = (level) =>
  Math.max(
    MIN_DROP_INTERVAL,
    INITIAL_DROP_INTERVAL - (level - 1) * LEVEL_SPEED_STEP
  );

/**
 * Initial State
 */
const initialState = {
  // Lifecycle
  status: "idle", // idle | playing | paused | gameover

  // Progress
  score: 0,
  level: 1,
  linesCleared: 0,

  // Speed
  dropInterval: INITIAL_DROP_INTERVAL,

  // Aura
  auraEarned: 0,
  lastAuraCheckpoint: 0,

  // Persistence
  board: createEmptyBoard(),
  currentPiece: null,
  nextPiece: null,

  // Meta
  startedAt: null,
  pausedAt: null,
};

const tetrisGameSlice = createSlice({
  name: "tetrisGame",
  initialState,
  reducers: {
    /**
     * Game lifecycle
     */
    initGame(state) {
      Object.assign(state, initialState);
    },

    startGame(state) {
      Object.assign(state, {
        ...initialState,
        status: "playing",
        startedAt: Date.now(),
      });
    },

    pauseGame(state) {
      if (state.status !== "playing") return;
      state.status = "paused";
      state.pausedAt = Date.now();
    },

    resumeGame(state) {
      if (state.status !== "paused") return;
      state.status = "playing";
      state.pausedAt = null;
    },

    gameOver(state) {
      state.status = "gameover";
    },

    /**
     * Engine sync
     */
    setBoard(state, action) {
      state.board = action.payload;
    },

    setCurrentPiece(state, action) {
      state.currentPiece = action.payload;
    },

    setNextPiece(state, action) {
      state.nextPiece = action.payload;
    },

    /**
     * Scoring & progression
     */
    clearLines(state, action) {
      const lines = action.payload; // 1..4
      if (!SCORE_TABLE[lines]) return;

      state.score += SCORE_TABLE[lines];
      state.linesCleared += lines;

      // Level update
      state.level = calculateLevel(state.linesCleared);
      state.dropInterval = calculateDropInterval(state.level);

      // Aura rewards (checkpoint based)
      while (state.score - state.lastAuraCheckpoint >= 25) {
        state.auraEarned += 1;
        state.lastAuraCheckpoint += 25;
      }
    },
       resetScore(state) {
      state.score = 0;
     
    },

  },
});

export const {
  initGame,
  startGame,
  pauseGame,
  resumeGame,
  gameOver,
  setBoard,
  setCurrentPiece,
  setNextPiece,
  clearLines,
  resetScore
} = tetrisGameSlice.actions;

export default tetrisGameSlice.reducer;
