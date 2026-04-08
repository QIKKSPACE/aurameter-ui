import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game2048State, Direction, GameStatus } from './Game2048Types';
import {
  createInitialState,
  spawnTile,
  moveTiles,
  checkGameOver,
  checkWin,
  clearMergedAndNewFlags,
} from './Game2048Engine';

export function useGame2048() {
  const [gameState, setGameState] = useState<Game2048State>(createInitialState());

  useEffect(() => {
    const loadBestScore = async () => {
      try {
        const best = await AsyncStorage.getItem('@aurameter/2048-best-score');
        if (best) {
          setGameState((prev) => ({
            ...prev,
            bestScore: parseInt(best, 10),
          }));
        }
      } catch {}
    };

    loadBestScore();
  }, []);

  const saveBestScore = useCallback(async (score: number) => {
    try {
      await AsyncStorage.setItem('@aurameter/2048-best-score', String(score));
    } catch {}
  }, []);

  const handleSwipe = useCallback(
    (direction: Direction) => {
      setGameState((prev) => {
        if (prev.status === 'lost') return prev;
        if (prev.status === 'won') return prev;

        const clearedTiles = clearMergedAndNewFlags(prev.tiles);
        const moveResult = moveTiles(clearedTiles, direction);

        if (!moveResult.moved) {
          return prev;
        }

        let newTiles = spawnTile(moveResult.tiles);
        let newScore = prev.score + moveResult.scoreDelta;
        let newStatus: GameStatus = prev.status;

        const isGameOver = checkGameOver(newTiles);
        const isWon = checkWin(newTiles);

        if (isWon && prev.status === 'playing') {
          newStatus = 'won';
        }

        if (isGameOver && prev.status === 'playing') {
          newStatus = 'lost';
        }

        if (newScore > prev.bestScore) {
          saveBestScore(newScore);
        }

        return {
          ...prev,
          tiles: newTiles,
          score: newScore,
          bestScore: Math.max(prev.bestScore, newScore),
          status: newStatus,
          moveCount: prev.moveCount + 1,
        };
      });
    },
    [saveBestScore]
  );

  const handleNewGame = useCallback(() => {
    const newState = createInitialState();
    setGameState((prev) => ({
      ...newState,
      bestScore: prev.bestScore,
    }));
  }, []);

  const handleKeepGoing = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: 'continuing',
    }));
  }, []);

  return {
    gameState,
    handleSwipe,
    handleNewGame,
    handleKeepGoing,
  };
}
