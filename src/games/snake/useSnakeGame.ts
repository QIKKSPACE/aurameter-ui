import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import haptics from "../../utils/haptics";
import {
  detectCollision,
  detectObstacleCollision,
  getMultiplierFromStreak,
  getOppositeDirection,
  getTickSpeed,
  initializeGame,
  isComboActive,
  isSamePoint,
  moveSnake,
  nextHeadPosition,
  spawnFood,
  spawnObstacles,
  updateScore,
} from "./SnakeEngine";
import {
  COMBO_WINDOW_MS,
  COUNTDOWN_STEPS,
  GRID_SIZE,
  SNAKE_STORAGE_KEY,
  SPEED_STEP_SCORE,
  type Direction,
  type Point,
  type SnakeGameState,
} from "./SnakeTypes";
import { GAME_CONFIG } from "./GameConfig";
import { getDifficultyTier } from "./DifficultyConfig";

// Safe haptic trigger with error boundary - prevents game crash if haptics unavailable
const triggerHaptic = (type: 'impact' | 'success' | 'error') => {
  try {
    if (type === 'impact' && haptics.impact) haptics.impact();
    else if (type === 'success' && haptics.success) haptics.success();
    else if (type === 'error' && haptics.error) haptics.error();
  } catch (error) {
    console.warn(`Haptic feedback unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const submitSnakeScore = async (score: number) => {
  return Promise.resolve({
    score,
    synced: false,
    message: "Snake score submission is ready for backend integration.",
  });
};

const createInitialState = () => {
  const state = initializeGame(GRID_SIZE);
  return {
    ...state,
    normalApplesEaten: 0,
  };
};

export const useSnakeGame = () => {
  const [gameState, setGameState] = useState<SnakeGameState>(() => createInitialState());
  const [isGameReady, setIsGameReady] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [countdownText, setCountdownText] = useState<string | null>("3");
  const [isPaused, setIsPaused] = useState(false);
  const [foodPulseToken, setFoodPulseToken] = useState(0);
  const [collisionToken, setCollisionToken] = useState(0);
  const [lastEatenPosition, setLastEatenPosition] = useState<Point | null>(null);
  const [tapSpeedBoost, setTapSpeedBoost] = useState(0); // Speed boost from single tap (ms reduction)
  const [doubleTapSpeedBoost, setDoubleTapSpeedBoost] = useState(0); // 2x speed boost from double-tap (ms reduction)
  const holdSpeedBoostRef = useRef(0); // Use ref for button hold boost to avoid excessive re-renders
  const pendingDirectionRef = useRef<Direction | null>(null);
  const mountTimeRef = useRef(Date.now());
  const tickCountRef = useRef(0);
  const tapBoostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const redAppleSpawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const redAppleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRedAppleSpawnTimeRef = useRef(0);
  const currentRedAppleSpawnTimeRef = useRef<number | null>(null);

  const lastFoodTimestampRef = useRef<number | null>(null);
  const submittedScoreRef = useRef<number | null>(null);
  const submissionStateRef = useRef<'idle' | 'pending' | 'success'>('idle');
  const countdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeCountdownTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearCountdownTimer = useCallback(() => {
    // Clear all tracked countdown timeouts - prevents memory leaks on unmount
    activeCountdownTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    activeCountdownTimeoutsRef.current = [];
    
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }
  }, []);

  const beginCountdown = useCallback(() => {
    clearCountdownTimer();

    let stepIndex = 0;

    const scheduleNextStep = () => {
      if (stepIndex >= COUNTDOWN_STEPS.length) {
        setCountdownText(null);
        activeCountdownTimeoutsRef.current = [];
        return;
      }

      const step = COUNTDOWN_STEPS[stepIndex];
      setCountdownText(step ?? null);
      stepIndex += 1;

      // Create timeout and track it for cleanup
      const timeout = setTimeout(() => {
        scheduleNextStep();
      }, GAME_CONFIG.COUNTDOWN_STEP_DURATION);

      activeCountdownTimeoutsRef.current.push(timeout);
    };

    scheduleNextStep();
  }, [clearCountdownTimer]);

  useEffect(() => {
    AsyncStorage.getItem(SNAKE_STORAGE_KEY)
      .then(value => {
        if (!value) {
          return;
        }

        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          setHighScore(parsed);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    beginCountdown();
    setIsGameReady(true);

    return () => {
      clearCountdownTimer();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      if (state !== "active") {
        setIsPaused(true);
      }
    });

    return () => subscription.remove();
  }, []);

  // Cleanup tap boost timer on unmount
  useEffect(() => {
    return () => {
      if (tapBoostTimerRef.current) {
        clearTimeout(tapBoostTimerRef.current);
      }
    };
  }, []);

  // Handle speed boost from double-tap on BOOST button
  const handleMultipleTaps = useCallback(() => {
    // Apply 100ms speed boost (2x speed - double the reduction)
    setDoubleTapSpeedBoost(100);

    // Clear existing timer
    if (tapBoostTimerRef.current) {
      clearTimeout(tapBoostTimerRef.current);
    }

    // Remove boost after 2 seconds
    tapBoostTimerRef.current = setTimeout(() => {
      setDoubleTapSpeedBoost(0);
    }, 2000);
  }, []);

  const tickSpeed = useMemo(
    () => {
      const baseSpeed = getTickSpeed(gameState.score, gameState.speedBoostMoves);
      // Apply tap boost, double-tap boost, and hold boost (reduce tick speed = faster game)
      const totalBoost = tapSpeedBoost + doubleTapSpeedBoost + holdSpeedBoostRef.current;
      return Math.max(GAME_CONFIG.MIN_TICK_SPEED, baseSpeed - totalBoost);
    },
    [gameState.score, gameState.speedBoostMoves, tapSpeedBoost, doubleTapSpeedBoost],
  );

  useEffect(() => {
    if (!isGameReady || countdownText || isPaused || gameState.gameOver) {
      return;
    }
    const interval = setInterval(() => {
      setGameState(currentState => {
        // Safety: if game already over, don't process
        if (currentState.gameOver) return currentState;

        // Count successful ticks for false game-over detection
        tickCountRef.current += 1;

        // Read pending direction from ref (always fresh, no stale closure)
        const pending = pendingDirectionRef.current;
        let requestedDirection = pending ?? currentState.direction;
        
        if (requestedDirection === getOppositeDirection(currentState.direction)) {
          requestedDirection = currentState.direction;
        }

        const currentHead = currentState.snake[0];
        const nextHeadRaw = nextHeadPosition(currentHead, requestedDirection);
        // Wrap position so snake appears on other side of board
        const nextHead = {
          x: ((nextHeadRaw.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
          y: ((nextHeadRaw.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
        };
        const snakeBodyForCollision = currentState.snake.slice(0, -1);
        const collision = detectCollision(
          nextHead,
          snakeBodyForCollision,
          GRID_SIZE,
        );

        // Check for obstacle collision
        const hitObstacle = detectObstacleCollision(nextHead, currentState.obstacles);

        if (collision.collided || hitObstacle) {
          if (currentState.shieldCharges > 0) {
            setCollisionToken(value => value + 1);
            triggerHaptic('impact');
            return {
              ...currentState,
              direction: requestedDirection,
              shieldCharges: currentState.shieldCharges - 1,
            };
          }

          setCollisionToken(value => value + 1);
          triggerHaptic('error');

          return {
            ...currentState,
            direction: requestedDirection,
            gameOver: true,
          };
        }

        const ateFood = isSamePoint(nextHead, currentState.food.position);
        const movedSnake = moveSnake(
          currentState.snake,
          requestedDirection,
          ateFood ? 1 : 0,
          GRID_SIZE,
        );
        const now = Date.now();

        if (!ateFood) {
          if (
            lastFoodTimestampRef.current &&
            now - lastFoodTimestampRef.current > COMBO_WINDOW_MS
          ) {
            lastFoodTimestampRef.current = null;
          }

          // Update tier and manage obstacles even when not eating
          const nextTier = getDifficultyTier(currentState.score);

          return {
            ...currentState,
            snake: movedSnake,
            direction: requestedDirection,
            streak: isComboActive(lastFoodTimestampRef.current, now)
              ? currentState.streak
              : 0,
            multiplier: isComboActive(lastFoodTimestampRef.current, now)
              ? currentState.multiplier
              : 1,
            speedBoostMoves: Math.max(0, currentState.speedBoostMoves - 1),
            currentTier: nextTier,
          };
        }

        const comboContinues = isComboActive(lastFoodTimestampRef.current, now);
        const nextStreak = comboContinues ? currentState.streak + 1 : 1;
        const nextMultiplier = getMultiplierFromStreak(nextStreak);
        
        // Special handling for red apple - award 5 points flat (no multiplier)
        const nextScore = currentState.food.kind === "red_apple" 
          ? currentState.score + 5
          : updateScore(
              currentState.score,
              nextMultiplier,
              currentState.food.kind,
            );
        
        const nextShield =
          currentState.food.kind === "shield"
            ? currentState.shieldCharges + 1
            : currentState.shieldCharges;
        const nextSpeedBoost =
          currentState.food.kind === "speed"
            ? GAME_CONFIG.SPEED_BOOST_DURATION
            : Math.max(0, currentState.speedBoostMoves - 1);
        
        const nextFood = spawnFood(movedSnake, GRID_SIZE, nextScore);

        lastFoodTimestampRef.current = now;
        currentRedAppleSpawnTimeRef.current = null; // Clear red apple timer since we're spawning new food
        setFoodPulseToken(value => value + 1);
        setLastEatenPosition(currentState.food.position);
        triggerHaptic('success');

        // Track normal apples eaten for red apple spawn gate
        const normalApplesEatenIncrement = currentState.food.kind === "normal" ? 1 : 0;

        // Calculate new tier and spawn obstacles if needed
        const nextTier = getDifficultyTier(nextScore);
        let nextObstacles = currentState.obstacles;

        // Spawn obstacles as score increases
        nextObstacles = spawnObstacles(
          nextScore,
          movedSnake,
          GRID_SIZE,
          currentState.obstacles,
        );

        return {
          ...currentState,
          snake: movedSnake,
          food: nextFood,
          direction: requestedDirection,
          score: nextScore,
          multiplier: nextMultiplier,
          streak: nextStreak,
          shieldCharges: nextShield,
          speedBoostMoves: nextSpeedBoost,
          normalApplesEaten: currentState.normalApplesEaten + normalApplesEatenIncrement,
          currentTier: nextTier,
          obstacles: nextObstacles,
        };
      });

      pendingDirectionRef.current = null;
    }, tickSpeed);

    return () => clearInterval(interval);
  }, [isGameReady, countdownText, gameState.gameOver, isPaused, tickSpeed]);

  useEffect(() => {
    if (!gameState.gameOver) {
      submittedScoreRef.current = null;
      submissionStateRef.current = 'idle';
      return;
    }

    // CRITICAL: Detect and suppress false game-overs from React 19 Strict Mode
    // A real game-over requires: at least 5 seconds since mount AND at least 1 game tick
    const timeSinceMount = Date.now() - mountTimeRef.current;
    const realGameplay = tickCountRef.current > 0 && timeSinceMount > 5000;
    
    if (!realGameplay) {
      setGameState(prev => ({ ...prev, gameOver: false }));
      return;
    }
    if (submissionStateRef.current === 'success') {
      return;
    }

    if (submissionStateRef.current === 'pending') {
      return;
    }

    // Mark submission as pending and track score
    submissionStateRef.current = 'pending';
    submittedScoreRef.current = gameState.score;

    // Submit score with proper error handling
    submitSnakeScore(gameState.score)
      .then(() => {
        submissionStateRef.current = 'success';
        // Persist high score if new record
        if (gameState.score > highScore) {
          setHighScore(gameState.score);
          AsyncStorage.setItem(SNAKE_STORAGE_KEY, String(gameState.score)).catch(
            (err) => console.warn("Failed to persist high score:", err),
          );
        }
      })
      .catch((error) => {
        console.warn('Score submission failed:', error);
        // Reset to idle to allow retry on next effect run
        submissionStateRef.current = 'idle';
      });
  }, [gameState.gameOver, gameState.score, highScore]);

  const setDirection = useCallback(
    (direction: Direction) => {
      const baseDirection = pendingDirectionRef.current ?? gameState.direction;
      if (direction === getOppositeDirection(baseDirection)) {
        return;
      }
      pendingDirectionRef.current = direction;
    },
    [gameState.direction],
  );

  const restartGame = useCallback(() => {
    lastFoodTimestampRef.current = null;
    lastRedAppleSpawnTimeRef.current = 0;  // Reset red apple spawn timer
    submittedScoreRef.current = null;
    submissionStateRef.current = 'idle';
    mountTimeRef.current = Date.now();
    tickCountRef.current = 0;
    clearCountdownTimer();
    setGameState(createInitialState());
    pendingDirectionRef.current = null;
    setLastEatenPosition(null);
    setFoodPulseToken(0);
    setCollisionToken(0);
    setIsPaused(false);
    beginCountdown();
  }, [beginCountdown, clearCountdownTimer]);

  const togglePause = useCallback(() => {
    if (gameState.gameOver) {
      return;
    }

    setIsPaused(value => !value);
  }, [gameState.gameOver]);

  const resumeGame = useCallback(() => {
    if (!isPaused || gameState.gameOver) {
      return;
    }

    setIsPaused(false);
  }, [gameState.gameOver, isPaused]);

  // Handle red apple spawning - spawn only after 7 normal apples eaten, on interval
  useEffect(() => {
    if (gameState.gameOver || isPaused || countdownText) {
      return;
    }

    // Only spawn red apples after eating 7+ normal apples
    const canSpawnRedApple = gameState.normalApplesEaten >= GAME_CONFIG.RED_APPLE_SPAWN_GATE;
    if (!canSpawnRedApple) {
      return;
    }

    // Skip if current food is already a red apple or spawn is pending
    if (gameState.food.kind === "red_apple" || currentRedAppleSpawnTimeRef.current) {
      return;
    }

    const now = Date.now();
    
    // Check if it's time to spawn a red apple (every 8 seconds)
    if (now - lastRedAppleSpawnTimeRef.current <= GAME_CONFIG.RED_APPLE_SPAWN_INTERVAL) {
      return;
    }

    // Time to spawn a red apple
    currentRedAppleSpawnTimeRef.current = now;
    lastRedAppleSpawnTimeRef.current = now;
    
    // Generate a red apple at a random position
    const newRedApple = spawnFood(gameState.snake, GRID_SIZE, gameState.score);
    
    setGameState(prev => ({
      ...prev,
      food: {
        ...newRedApple,
        kind: "red_apple" as const,
      },
    }));

    // Set a timer to replace red apple with regular food if not eaten in 5 seconds
    if (redAppleTimerRef.current) {
      clearTimeout(redAppleTimerRef.current);
    }

    redAppleTimerRef.current = setTimeout(() => {
      setGameState(prev => {
        // Only replace if food is still a red apple (hasn't been eaten)
        if (prev.food.kind === "red_apple") {
          const newFood = spawnFood(prev.snake, GRID_SIZE, prev.score);
          return {
            ...prev,
            food: newFood,
          };
        }
        return prev;
      });
      currentRedAppleSpawnTimeRef.current = null;
    }, GAME_CONFIG.RED_APPLE_LIFETIME);

    return () => {
      if (redAppleTimerRef.current) {
        clearTimeout(redAppleTimerRef.current);
        redAppleTimerRef.current = null;
      }
    };
  }, [gameState.gameOver, gameState.normalApplesEaten, isPaused, countdownText]);

  return {
    gridSize: GRID_SIZE,
    snake: gameState.snake,
    food: gameState.food,
    direction: gameState.direction,
    score: gameState.score,
    multiplier: gameState.multiplier,
    streak: gameState.streak,
    shieldCharges: gameState.shieldCharges,
    normalApplesEaten: gameState.normalApplesEaten,
    gameOver: gameState.gameOver,
    highScore,
    isPaused,
    countdownText,
    foodPulseToken,
    collisionToken,
    lastEatenPosition,
    progressToNextSpeed:
      (gameState.score % SPEED_STEP_SCORE) / SPEED_STEP_SCORE,
    tickSpeed,
    speedMultiplier: parseFloat((400 / tickSpeed).toFixed(2)), // Calculate speed multiplier (base speed 400ms)
    obstacles: gameState.obstacles,
    currentTier: gameState.currentTier,
    setDirection,
    restartGame,
    togglePause,
    resumeGame,
    handleMultipleTaps,
  };
};
