import React, { useCallback } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Game2048State } from './Game2048Types';
import Game2048Tile from './Game2048Tile';
import { GAME_2048_COLORS } from './Game2048Colors';

type Props = {
  gameState: Game2048State;
  onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => void;
};

type PanEvent = {
  nativeEvent: {
    state: number;
    translationX: number;
    translationY: number;
  };
};

export default function Game2048Board({ gameState, onSwipe }: Props) {
  const { width: screenWidth } = useWindowDimensions();

  // ═══════════════════════════════════════════════
  // SINGLE SOURCE OF TRUTH — All sizing in one place
  // ═══════════════════════════════════════════════
  const OUTER_PADDING = 16;
  const GRID_PADDING = 8;
  const GAP = 8;
  const NUM_CELLS = 4;

  const GRID_WIDTH = screenWidth - OUTER_PADDING * 2;
  const CELL_SIZE = Math.floor(
    (GRID_WIDTH - GRID_PADDING * 2 - GAP * (NUM_CELLS - 1)) / NUM_CELLS
  );
  const GRID_HEIGHT =
    CELL_SIZE * NUM_CELLS +
    GAP * (NUM_CELLS - 1) +
    GRID_PADDING * 2;

  const handlePanStateChange = useCallback((event: PanEvent) => {
    if (event.nativeEvent.state === State.END) {
      const translationX = event.nativeEvent.translationX ?? 0;
      const translationY = event.nativeEvent.translationY ?? 0;
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);
      const threshold = 20;

      if (absX < threshold && absY < threshold) {
        return;
      }

      if (absX > absY) {
        if (translationX > 0) {
          onSwipe('right');
        } else {
          onSwipe('left');
        }
      } else {
        if (translationY > 0) {
          onSwipe('down');
        } else {
          onSwipe('up');
        }
      }
    }
  }, [onSwipe]);

  return (
    <View style={{ alignItems: 'center' }}>
      <PanGestureHandler onHandlerStateChange={handlePanStateChange}>
        <View
          style={{
            width: GRID_WIDTH,
            height: GRID_HEIGHT,
            backgroundColor: GAME_2048_COLORS.GRID_BG,
            borderRadius: 6,
            padding: GRID_PADDING,
            alignSelf: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Empty cell background grid */}
          {[0, 1, 2, 3].map((rowIndex) => (
            <View
              key={`row-${rowIndex}`}
              style={{
                flexDirection: 'row',
                marginBottom: rowIndex < 3 ? GAP : 0,
              }}
            >
              {[0, 1, 2, 3].map((colIndex) => (
                <View
                  key={`cell-${rowIndex}-${colIndex}`}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: GAME_2048_COLORS.CELL_EMPTY_BG,
                    borderRadius: 4,
                    marginRight: colIndex < 3 ? GAP : 0,
                  }}
                />
              ))}
            </View>
          ))}

          {/* Tiles container */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: GRID_WIDTH,
              height: GRID_HEIGHT,
            }}
          >
            {gameState.tiles.map((tile) => (
              <Game2048Tile
                key={tile.id}
                tile={tile}
                cellSize={CELL_SIZE}
                gap={GAP}
                gridPadding={GRID_PADDING}
              />
            ))}
          </View>
        </View>
      </PanGestureHandler>
    </View>
  );
}
