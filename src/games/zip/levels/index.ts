import type { Level } from "../ZipTypes";
import { LEVELS_EASY } from "./levelsEasy";
import { LEVELS_MEDIUM } from "./levelsMedium";
import { LEVELS_HARD1 } from "./levelsHard1";
import { LEVELS_HARD2 } from "./levelsHard2";

export const LEVELS: Level[] = [
  ...LEVELS_EASY,
  ...LEVELS_MEDIUM,
  ...LEVELS_HARD1,
  ...LEVELS_HARD2,
];

export const getLevelById = (id: number): Level | undefined => {
  return LEVELS.find((level) => level.id === id);
};

export const getTotalLevels = (): number => LEVELS.length;
