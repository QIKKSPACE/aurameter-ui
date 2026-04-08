/**
 * Zip Challenge Game Types
 */

export type Point = {
  x: number;
  y: number;
};

export type Node = {
  number: number;
  position: Point;
};

export type Obstacle = {
  x: number;
  y: number;
};

export type PathSegment = {
  from: Point;
  to: Point;
};

export type Level = {
  id: number;
  gridSize: number;
  nodes: Node[];
  obstacles: Obstacle[];
  themeId: number;
  solution?: Point[];
};

export type ZipGameState = {
  currentLevel: number;
  gridSize: number;
  nodes: Node[];
  obstacles: Obstacle[];
  path: PathSegment[];
  currentNodeIndex: number;
  selectedStartNode: Node | null;
  gameOver: boolean;
  completed: boolean;
  timerStartTime: number | null;
  elapsedTime: number;
  hintsRemaining: number;
  undoStack: ZipGameState[];
};

export type Theme = {
  id: number;
  primary: string;
  secondary: string;
  accent: string;
  gradient: [string, string];
};

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export const zipChallenge = {
  id: "zip",
  title: "Zip Challenge",
  description: "Connect all nodes and fill the grid.",
  reward: 40,
};

export const ZIP_STORAGE_KEY = "ZIP_GAME_PROGRESS";
