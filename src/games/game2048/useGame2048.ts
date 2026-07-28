import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Game2048State, Direction } from './Game2048Types';
import {
  spawnTile,
  moveTiles,
  checkGameOver,
  checkWin,
  clearMergedAndNewFlags,
} from './Game2048Engine';
import {
  applyMove,
  collectReward as collectGameReward,
  keepGoing as keepGoingAction,
  startNewGame,
} from '../../store/game2048Slice';

type RootState = {
  game2048: Game2048State;
};

const getHighestTileValue = (tiles: Game2048State['tiles']) =>
  tiles.reduce((highest, tile) => Math.max(highest, tile.value), 0);

export function useGame2048() {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game2048);

  const handleSwipe = useCallback(
    (direction: Direction) => {
      if (gameState.status === 'lost') return;
      if (gameState.status === 'won') return;

      const clearedTiles = clearMergedAndNewFlags(gameState.tiles);
      const moveResult = moveTiles(clearedTiles, direction);

      if (!moveResult.moved) {
        return;
      }

      const newTiles = spawnTile(moveResult.tiles);
      const isGameOver = checkGameOver(newTiles);
      const isWon = checkWin(newTiles);
      const highestTile = getHighestTileValue(newTiles);

      dispatch(
        applyMove({
          tiles: newTiles,
          isWon,
          isGameOver,
          highestTile,
        })
      );
    },
    [dispatch, gameState.status, gameState.tiles]
  );

  const handleNewGame = useCallback(() => {
    dispatch(startNewGame());
  }, [dispatch]);

  const handleKeepGoing = useCallback(() => {
    dispatch(keepGoingAction());
  }, [dispatch]);

  const handleCollectReward = useCallback(() => {
    dispatch(collectGameReward());
  }, [dispatch]);

  return {
    gameState,
    handleSwipe,
    handleNewGame,
    handleKeepGoing,
    handleCollectReward,
  };
}
