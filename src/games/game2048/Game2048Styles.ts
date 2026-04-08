import { StyleSheet } from 'react-native';
import { GAME_2048_COLORS } from './Game2048Colors';

export function createGame2048Styles(width: number) {
  const OUTER_PADDING = 16;
  const GRID_PADDING = 8;
  const GAP = 8;
  const GRID_WIDTH = width - OUTER_PADDING * 2;
  const cellSize = Math.floor((GRID_WIDTH - GRID_PADDING * 2 - GAP * 3) / 4);
  const gridSize = cellSize * 4 + GAP * 3 + GRID_PADDING * 2;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: GAME_2048_COLORS.SCREEN_BG,
      paddingHorizontal: OUTER_PADDING,
    },
    safeArea: {
      flex: 1,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 20,
      paddingHorizontal: 12,
    },
    title: {
      fontSize: 48,
      fontWeight: '800',
      color: GAME_2048_COLORS.TITLE_COLOR,
    },
    scoreSection: {
      flexDirection: 'column',
      gap: 12,
      alignItems: 'flex-end',
    },
    scoreBoxRow: {
      flexDirection: 'row',
      gap: 12,
    },
    scoreBox: {
      backgroundColor: GAME_2048_COLORS.SCORE_BG,
      borderRadius: 4,
      paddingHorizontal: 16,
      paddingVertical: 8,
      alignItems: 'center',
      minWidth: 80,
    },
    scoreLabel: {
      fontSize: 10,
      color: GAME_2048_COLORS.SCORE_LABEL,
      fontWeight: '600',
    },
    scoreValue: {
      fontSize: 24,
      fontWeight: '700',
      color: GAME_2048_COLORS.SCORE_TEXT,
      marginTop: 4,
    },
    newGameButton: {
      backgroundColor: GAME_2048_COLORS.BUTTON_BG,
      borderRadius: 4,
      paddingHorizontal: 14,
      paddingVertical: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    newGameButtonText: {
      color: GAME_2048_COLORS.BUTTON_TEXT,
      fontSize: 12,
      fontWeight: '600',
    },
    gridContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    grid: {
      width: gridSize,
      height: gridSize,
      backgroundColor: GAME_2048_COLORS.GRID_BG,
      borderRadius: 6,
      padding: GRID_PADDING,
      position: 'relative',
    },
    cellGrid: {
      width: '100%',
      height: '100%',
    },
    cellRow: {
      flexDirection: 'row',
      height: cellSize,
      marginBottom: GAP,
      gap: GAP,
    },
    cellRowLast: {
      marginBottom: 0,
    },
    emptyCell: {
      width: cellSize,
      height: cellSize,
      backgroundColor: GAME_2048_COLORS.CELL_EMPTY_BG,
      borderRadius: 4,
    },
    tilesContainer: {
      position: 'absolute',
      top: GRID_PADDING,
      left: GRID_PADDING,
      width: cellSize * 4 + GAP * 3,
      height: cellSize * 4 + GAP * 3,
    },
    overlayContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(238, 228, 218, 0.73)',
    },
    overlayText: {
      fontSize: 40,
      fontWeight: '700',
      color: GAME_2048_COLORS.TITLE_COLOR,
      marginBottom: 20,
    },
    overlayWinText: {
      color: '#FFFFFF',
    },
    overlayButton: {
      backgroundColor: GAME_2048_COLORS.BUTTON_BG,
      borderRadius: 4,
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginVertical: 8,
      gap: 12,
    },
    overlayButtonText: {
      color: GAME_2048_COLORS.BUTTON_TEXT,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return { styles, cellSize, gap: GAP };
}
