export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type DifficultyTier = "Beginner" | "Intermediate" | "Advanced" | "Extreme";

export type Point = {
  x: number;
  y: number;
};

export type SnakeSegment = Point;

export type FoodKind = "normal" | "golden" | "speed" | "shield" | "red_apple";

export type Food = {
  id: string;
  kind: FoodKind;
  position: Point;
};

export type CollisionType = "wall" | "self";

export type CollisionResult = {
  collided: boolean;
  type?: CollisionType;
};

export type Obstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "wall";
};

export type SnakeGameState = {
  snake: SnakeSegment[];
  food: Food;
  direction: Direction;
  score: number;
  multiplier: number;
  streak: number;
  shieldCharges: number;
  speedBoostMoves: number;
  normalApplesEaten: number;  // Track normal apples eaten for red apple spawn gate
  gameOver: boolean;
  obstacles: Obstacle[];      // Progressive difficulty obstacles
  currentTier: "Beginner" | "Intermediate" | "Advanced" | "Extreme";
};

import { GAME_CONFIG } from "./GameConfig";

export const GRID_SIZE = GAME_CONFIG.GRID_SIZE;
export const INITIAL_DIRECTION: Direction = GAME_CONFIG.INITIAL_DIRECTION;
export const COUNTDOWN_STEPS = GAME_CONFIG.COUNTDOWN_STEPS;
export const SPEED_STEP_SCORE = GAME_CONFIG.SPEED_STEP_SCORE;
export const COMBO_WINDOW_MS = GAME_CONFIG.COMBO_WINDOW_MS;
export const SNAKE_STORAGE_KEY = GAME_CONFIG.STORAGE_KEY_HIGH_SCORE;

export const FOOD_POINTS: Record<FoodKind, number> = GAME_CONFIG.FOOD_POINTS;

export const FOOD_LABELS: Record<FoodKind, string> = {
  normal: GAME_CONFIG.FOOD_COLORS.normal.name,
  golden: GAME_CONFIG.FOOD_COLORS.golden.name,
  speed: GAME_CONFIG.FOOD_COLORS.speed.name,
  shield: GAME_CONFIG.FOOD_COLORS.shield.name,
  red_apple: GAME_CONFIG.FOOD_COLORS.red_apple.name,
};

export const snakeChallenge = {
  id: GAME_CONFIG.CHALLENGE_ID,
  title: GAME_CONFIG.CHALLENGE_TITLE,
  description: GAME_CONFIG.CHALLENGE_DESCRIPTION,
  reward: GAME_CONFIG.CHALLENGE_REWARD,
} as const;
