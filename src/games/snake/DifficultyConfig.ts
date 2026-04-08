/**
 * Progressive Difficulty Configuration
 * Defines skill tiers and their characteristics
 */

export type DifficultyTier = "Beginner" | "Intermediate" | "Advanced" | "Extreme";

export type ObstacleType = "wall";

export type Obstacle = {
  x: number;
  y: number;
  width: number;  // number of cells
  height: number; // number of cells
  type: ObstacleType;
};

export interface DifficultyConfig {
  tier: DifficultyTier;
  minScore: number;
  maxScore: number;
  description: string;
  color: string;
  foodSpawnRateMs: number;        // Lower = faster spawn
  obstacleSpawnThreshold: number; // Score threshold to start spawning obstacles
  maxObstacles: number;
  minObstacleSize: number;
  maxObstacleSize: number;
  obstacleSpawnChance: number;    // 0-1 probability when spawning food
  timeLimit?: number;             // ms, for Extreme mode
  bossMode?: boolean;
}

export const DIFFICULTY_TIERS: Record<DifficultyTier, DifficultyConfig> = {
  Beginner: {
    tier: "Beginner",
    minScore: 0,
    maxScore: 50,
    description: "Relaxed, learn mechanics",
    color: "#4CAF50", // Green
    foodSpawnRateMs: 3500, // Slower food spawn, plenty of time
    obstacleSpawnThreshold: Infinity, // No obstacles
    maxObstacles: 0,
    minObstacleSize: 1,
    maxObstacleSize: 2,
    obstacleSpawnChance: 0,
  },

  Intermediate: {
    tier: "Intermediate",
    minScore: 50,
    maxScore: 200,
    description: "Faster food spawn, walls appear",
    color: "#2196F3", // Blue
    foodSpawnRateMs: 3000, // Moderate food spawn
    obstacleSpawnThreshold: 60, // Start spawning obstacles after score 60
    maxObstacles: 3,
    minObstacleSize: 1,
    maxObstacleSize: 2,
    obstacleSpawnChance: 0.3, // 30% chance when conditions met
  },

  Advanced: {
    tier: "Advanced",
    minScore: 200,
    maxScore: 500,
    description: "Multiple obstacles, increased complexity",
    color: "#FF9800", // Orange
    foodSpawnRateMs: 2500, // Faster food spawn
    obstacleSpawnThreshold: 210, // More obstacles earlier
    maxObstacles: 6,
    minObstacleSize: 1,
    maxObstacleSize: 3,
    obstacleSpawnChance: 0.5, // 50% chance
  },

  Extreme: {
    tier: "Extreme",
    minScore: 500,
    maxScore: Infinity,
    description: "Boss battles, time pressure, chaos",
    color: "#F44336", // Red
    foodSpawnRateMs: 2000, // Very fast food spawn
    obstacleSpawnThreshold: 520,
    maxObstacles: 10,
    minObstacleSize: 2,
    maxObstacleSize: 4,
    obstacleSpawnChance: 0.7, // 70% chance - chaos mode!
    timeLimit: 300000, // 5 minute time limit to reach final boss encounter
    bossMode: true,
  },
};

/**
 * Get difficulty tier based on current score
 */
export const getDifficultyTier = (score: number): DifficultyTier => {
  if (score < 50) return "Beginner";
  if (score < 200) return "Intermediate";
  if (score < 500) return "Advanced";
  return "Extreme";
};

/**
 * Get difficulty config for a score
 */
export const getDifficultyConfig = (score: number): DifficultyConfig => {
  const tier = getDifficultyTier(score);
  return DIFFICULTY_TIERS[tier];
};

/**
 * Calculate obstacle spawn score threshold for current tier
 */
export const getObstacleSpawnThreshold = (currentTier: DifficultyTier): number => {
  return DIFFICULTY_TIERS[currentTier].obstacleSpawnThreshold;
};
