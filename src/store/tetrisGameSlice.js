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

const createRunState = () => ({
  status: "idle",
  score: 0,
  level: 1,
  linesCleared: 0,
  dropInterval: INITIAL_DROP_INTERVAL,
  board: createEmptyBoard(),
  currentPiece: null,
  nextPiece: null,
  startedAt: null,
  pausedAt: null,
});

const normalizeTetrisState = (state) => {
  if (!state.board) state.board = createEmptyBoard();
  if (typeof state.score !== "number") state.score = 0;
  if (typeof state.level !== "number" || state.level < 1) state.level = 1;
  if (typeof state.linesCleared !== "number") state.linesCleared = 0;
  if (typeof state.dropInterval !== "number") state.dropInterval = INITIAL_DROP_INTERVAL;
  if (typeof state.auraEarned !== "number") state.auraEarned = 0;
  if (!state.status) state.status = "idle";
};

/**
 * Initial State
 */
const initialState = {
  ...createRunState(),
  auraEarned: 0,
};

const tetrisGameSlice = createSlice({
  name: "tetrisGame",
  initialState,
  reducers: {
    /**
     * Game lifecycle
     */
    initGame(state) {
      const auraEarned = state.auraEarned ?? 0;

      Object.assign(state, createRunState(), {
        auraEarned,
      });
    },

    startGame(state) {
      const auraEarned = state.auraEarned ?? 0;

      Object.assign(state, createRunState(), {
        status: "playing",
        startedAt: Date.now(),
        auraEarned,
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
      normalizeTetrisState(state);
      state.board = action.payload;
    },

    setCurrentPiece(state, action) {
      normalizeTetrisState(state);
      state.currentPiece = action.payload;
    },

    setNextPiece(state, action) {
      normalizeTetrisState(state);
      state.nextPiece = action.payload;
    },

    /**
     * Scoring & progression
     */
    clearLines(state, action) {
      normalizeTetrisState(state);
      const lines = action.payload; // 1..4
      if (!SCORE_TABLE[lines]) return;

      const points = SCORE_TABLE[lines];
      state.score += points;
      state.auraEarned += points;
      state.linesCleared += lines;

      // Level update
      state.level = calculateLevel(state.linesCleared);
      state.dropInterval = calculateDropInterval(state.level);
    },
    claimAuraReward(state) {
      normalizeTetrisState(state);
      state.auraEarned = 0;
    },
    resetScore(state) {
      normalizeTetrisState(state);
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
  claimAuraReward,
  resetScore,
} = tetrisGameSlice.actions;

export default tetrisGameSlice.reducer;
