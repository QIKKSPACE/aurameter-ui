/**
 * Difficulty Configuration for Zip Challenge
 */

export type DifficultyTier = "EASY" | "MEDIUM" | "HARD";

export interface DifficultyConfig {
  tier: DifficultyTier;
  levelRange: [number, number];
  description: string;
  hintsPerLevel: number;
  timeLimit?: number;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyTier, DifficultyConfig> = {
  EASY: {
    tier: "EASY",
    levelRange: [1, 10],
    description: "Learn the basics",
    hintsPerLevel: 3,
  },
  MEDIUM: {
    tier: "MEDIUM",
    levelRange: [11, 20],
    description: "Test your skills",
    hintsPerLevel: 2,
  },
  HARD: {
    tier: "HARD",
    levelRange: [21, 30],
    description: "Master the challenge",
    hintsPerLevel: 1,
  },
};

export const getDifficultyForLevel = (levelId: number): DifficultyTier => {
  if (levelId <= 10) return "EASY";
  if (levelId <= 20) return "MEDIUM";
  return "HARD";
};
