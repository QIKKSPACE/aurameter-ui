import {
  COMBO_WINDOW_MS,
  FOOD_POINTS,
  GRID_SIZE,
  INITIAL_DIRECTION,
  SPEED_STEP_SCORE,
  type CollisionResult,
  type Direction,
  type Food,
  type FoodKind,
  type Obstacle,
  type Point,
  type SnakeGameState,
  type SnakeSegment,
} from "./SnakeTypes";
import { GAME_CONFIG } from "./GameConfig";
import { getDifficultyTier } from "./DifficultyConfig";

const DIRECTION_VECTORS: Record<Direction, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case "UP":
      return "DOWN";
    case "DOWN":
      return "UP";
    case "LEFT":
      return "RIGHT";
    case "RIGHT":
    default:
      return "LEFT";
  }
};

export const isSamePoint = (left: Point, right: Point) =>
  left.x === right.x && left.y === right.y;

export const nextHeadPosition = (
  head: Point,
  direction: Direction,
): Point => {
  const vector = DIRECTION_VECTORS[direction];
  return {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };
};

export const initializeSnake = (
  gridSize = GRID_SIZE,
): SnakeSegment[] => {
  const center = Math.floor(gridSize / 2);
  return [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];
};

const chooseFoodKind = (
  score: number,
  randomValue: number,
): FoodKind => {
  const { shield, golden, speed } = GAME_CONFIG.FOOD_SPAWN_THRESHOLDS;

  if (score >= shield.minScore && randomValue > shield.probability) {
    return "shield";
  }

  if (score >= golden.minScore && randomValue > golden.probability) {
    return "golden";
  }

  if (score >= speed.minScore && randomValue > speed.probability) {
    return "speed";
  }

  return "normal";
};

export const spawnFood = (
  snake: SnakeSegment[],
  gridSize = GRID_SIZE,
  score = 0,
  random = Math.random,
): Food => {
  const head = snake[0];
  const occupied = new Set(snake.map(segment => `${segment.x}:${segment.y}`));
  const candidates: Point[] = [];
  const fairCandidates: Point[] = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x}:${y}`;
      if (occupied.has(key)) {
        continue;
      }

      const point = { x, y };
      candidates.push(point);

      const distance =
        Math.abs(head.x - point.x) + Math.abs(head.y - point.y);
      if (distance >= GAME_CONFIG.FOOD_MIN_SPAWN_DISTANCE) {
        fairCandidates.push(point);
      }
    }
  }

  const pool =
    fairCandidates.length > Math.max(8, Math.floor(candidates.length / GAME_CONFIG.FOOD_FAIR_CANDIDATE_THRESHOLD))
      ? fairCandidates
      : candidates;

  // CRITICAL FIX: Ensure pool is not empty. This protects against impossible game states.
  if (pool.length === 0) {
    // This should rarely happen - only if grid is nearly full
    // Return a default position that's guaranteed safe (won't break game on next tick)
    // Return head position as last resort - engine will handle collision detection gracefully
    return {
      id: `${Date.now()}-${Math.round(random() * GAME_CONFIG.FOOD_ID_RANDOMIZER)}`,
      kind: "normal",
      position: head,
    };
  }

  const position = pool[Math.floor(random() * pool.length)];
  const foodKind = chooseFoodKind(score, random());

  return {
    id: `${Date.now()}-${Math.round(random() * GAME_CONFIG.FOOD_ID_RANDOMIZER)}`,
    kind: foodKind,
    position,
  };
};

export const initializeGame = (
  gridSize = GRID_SIZE,
  random = Math.random,
): SnakeGameState => {
  const snake = initializeSnake(gridSize);

  return {
    snake,
    food: spawnFood(snake, gridSize, 0, random),
    direction: INITIAL_DIRECTION,
    score: 0,
    multiplier: 1,
    streak: 0,
    shieldCharges: 0,
    speedBoostMoves: 0,
    normalApplesEaten: 0,
    gameOver: false,
    obstacles: [],
    currentTier: "Beginner",
  };
};

export const moveSnake = (
  snake: SnakeSegment[],
  direction: Direction,
  growBy = 0,
  gridSize = GRID_SIZE,
): SnakeSegment[] => {
  const nextHeadRaw = nextHeadPosition(snake[0], direction);
  // Wrap head position to handle edge wrapping
  const nextHead = {
    x: ((nextHeadRaw.x % gridSize) + gridSize) % gridSize,
    y: ((nextHeadRaw.y % gridSize) + gridSize) % gridSize,
  };
  const nextSnake = [nextHead, ...snake];

  if (growBy > 0) {
    return nextSnake;
  }

  return nextSnake.slice(0, snake.length);
};

export const growSnake = (
  snake: SnakeSegment[],
  tail: SnakeSegment,
): SnakeSegment[] => [...snake, tail];

export const detectCollision = (
  head: Point,
  snake: SnakeSegment[],
  gridSize = GRID_SIZE,
): CollisionResult => {
  // Check only self collision - no wall collision (snake wraps around)
  const hitSelf = snake.some(segment => isSamePoint(segment, head));
  if (hitSelf) {
    return { collided: true, type: "self" };
  }

  return { collided: false };
};

/**
 * Check if a point is within an obstacle
 */
export const isPointInObstacle = (
  point: Point,
  obstacles: Obstacle[],
): boolean => {
  return obstacles.some(obstacle => {
    return (
      point.x >= obstacle.x &&
      point.x < obstacle.x + obstacle.width &&
      point.y >= obstacle.y &&
      point.y < obstacle.y + obstacle.height
    );
  });
};

/**
 * Check collision with obstacles
 */
export const detectObstacleCollision = (
  head: Point,
  obstacles: Obstacle[],
): boolean => {
  return isPointInObstacle(head, obstacles);
};

/**
 * Generate random obstacles for the current difficulty tier
 */
export const spawnObstacles = (
  score: number,
  snake: SnakeSegment[],
  gridSize = GRID_SIZE,
  existingObstacles: Obstacle[] = [],
  random = Math.random,
): Obstacle[] => {
  const { getDifficultyConfig } = require("./DifficultyConfig");
  const config = getDifficultyConfig(score);

  // Don't spawn obstacles until threshold is met
  if (score < config.obstacleSpawnThreshold) {
    return [];
  }

  // Check if we should spawn a new obstacle
  if (
    existingObstacles.length >= config.maxObstacles ||
    random() > config.obstacleSpawnChance
  ) {
    return existingObstacles;
  }

  const occupied = new Set<string>();
  snake.forEach(segment => occupied.add(`${segment.x}:${segment.y}`));
  existingObstacles.forEach(obs => {
    for (let y = obs.y; y < obs.y + obs.height; y++) {
      for (let x = obs.x; x < obs.x + obs.width; x++) {
        occupied.add(`${x}:${y}`);
      }
    }
  });

  // Try to find a valid position for the new obstacle
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const size = Math.floor(
      random() * (config.maxObstacleSize - config.minObstacleSize + 1) + config.minObstacleSize
    );

    const x = Math.floor(random() * (gridSize - size));
    const y = Math.floor(random() * (gridSize - size));

    // Check if position is valid (not overlapping)
    let isValid = true;
    for (let dy = 0; dy < size && isValid; dy++) {
      for (let dx = 0; dx < size && isValid; dx++) {
        if (occupied.has(`${x + dx}:${y + dy}`)) {
          isValid = false;
        }
      }
    }

    if (isValid) {
      return [
        ...existingObstacles,
        {
          x,
          y,
          width: size,
          height: size,
          type: "wall",
        },
      ];
    }

    attempts++;
  }

  // Couldn't find space, return existing obstacles
  return existingObstacles;
};

export const updateScore = (
  currentScore: number,
  multiplier: number,
  foodKind: FoodKind,
) => currentScore + FOOD_POINTS[foodKind] * multiplier;

export const getMultiplierFromStreak = (streak: number) =>
  Math.min(GAME_CONFIG.MAX_MULTIPLIER, 1 + Math.floor(streak / 2));

export const isComboActive = (
  lastFoodTimestamp: number | null,
  now = Date.now(),
) =>
  typeof lastFoodTimestamp === "number" &&
  now - lastFoodTimestamp <= COMBO_WINDOW_MS;

export const getTickSpeed = (
  score: number,
  speedBoostMoves = 0,
): number => {
  const step = Math.floor(score / SPEED_STEP_SCORE);
  const baseSpeed = Math.max(
    GAME_CONFIG.MIN_TICK_SPEED,
    GAME_CONFIG.BASE_TICK_SPEED - step * GAME_CONFIG.TICK_SPEED_REDUCTION_PER_STEP,
  );
  return speedBoostMoves > 0
    ? Math.max(GAME_CONFIG.MIN_TICK_SPEED, baseSpeed - GAME_CONFIG.SPEED_BOOST_REDUCTION)
    : baseSpeed;
};

export const sanitizeDirection = (
  currentDirection: Direction,
  requestedDirection: Direction,
) =>
  requestedDirection === getOppositeDirection(currentDirection)
    ? currentDirection
    : requestedDirection;
