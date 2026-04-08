/**
 * Zip Challenge Game - Index
 * Exports all game components and utilities
 */

import ZipGameScreen from "./ZipGameScreen";
export { zipChallenge } from "./ZipGameScreen";
export { ZipGameScreen };
export type { Level, Node, Obstacle, Point, Theme, ZipGameState } from "./ZipTypes";
export { LEVELS, getLevelById, getTotalLevels } from "./LevelConfig";
export { LEVEL_THEMES, getThemeForLevel } from "./ThemeConfig";
export { getDifficultyForLevel, DIFFICULTY_CONFIGS } from "./DifficultyConfig";
export * from "./ZipEngine";
