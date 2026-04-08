import { StyleSheet, useWindowDimensions } from 'react-native';
import { MINESWEEPER_COLORS } from './MinesweeperColors';
import { Difficulty, DIFFICULTY_CONFIGS } from './MinesweeperTypes';

export function createMinesweeperStyles(difficulty: Difficulty) {
  const { width } = useWindowDimensions();
  const config = DIFFICULTY_CONFIGS[difficulty];

  let cellSize = config.cellSize;

  if (cellSize === 0) {
    cellSize = (width - 32) / config.cols;
  }

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: MINESWEEPER_COLORS.SCREEN_BG,
      paddingHorizontal: 16,
    },
    safeArea: {
      flex: 1,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: MINESWEEPER_COLORS.HEADER_BG,
      borderRadius: 8,
      marginBottom: 16,
    },
    counterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: MINESWEEPER_COLORS.MINE_COUNTER_BG,
      borderRadius: 16,
      minWidth: 80,
    },
    counterText: {
      fontSize: 22,
      fontWeight: '700',
      color: MINESWEEPER_COLORS.TEXT_COLOR,
      fontFamily: 'monospace',
      marginLeft: 6,
    },
    restartButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: MINESWEEPER_COLORS.MINE_COUNTER_BG,
    },
    restartText: {
      fontSize: 24,
    },
    difficultyContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 12,
      paddingHorizontal: 8,
      backgroundColor: MINESWEEPER_COLORS.HEADER_BG,
      borderRadius: 8,
      marginBottom: 16,
    },
    difficultyButton: {
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    difficultyButtonActive: {
      borderBottomWidth: 2,
      borderBottomColor: MINESWEEPER_COLORS.DIFFICULTY_ACTIVE,
    },
    difficultyText: {
      fontSize: 13,
      fontWeight: '600',
      color: MINESWEEPER_COLORS.DIFFICULTY_INACTIVE,
    },
    difficultyTextActive: {
      color: MINESWEEPER_COLORS.DIFFICULTY_ACTIVE,
    },
    boardContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    boardWrapper: {
      backgroundColor: MINESWEEPER_COLORS.CELL_REVEALED,
      borderRadius: 8,
      overflow: 'hidden',
      padding: 4,
    },
    boardGrid: {
      width: config.cols * cellSize,
      height: config.rows * cellSize,
    },
    boardRow: {
      flexDirection: 'row',
      height: cellSize,
    },
    cell: {
      width: cellSize,
      height: cellSize,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: MINESWEEPER_COLORS.CELL_UNREVEALED,
      borderWidth: 1,
      borderColor: MINESWEEPER_COLORS.CELL_BORDER,
      borderRadius: 3,
      margin: 2,
    },
    cellRevealed: {
      backgroundColor: MINESWEEPER_COLORS.CELL_REVEALED,
      borderWidth: 0,
    },
    cellFlagged: {
      backgroundColor: MINESWEEPER_COLORS.CELL_UNREVEALED,
      borderWidth: 1,
      borderColor: MINESWEEPER_COLORS.CELL_BORDER,
    },
    cellMineHit: {
      backgroundColor: MINESWEEPER_COLORS.CELL_MINE_HIT,
    },
    cellText: {
      fontSize: 14,
      fontWeight: '700',
    },
    overlayContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    overlayCard: {
      backgroundColor: '#2A2A2A',
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      minWidth: '70%',
    },
    overlayTitle: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 16,
    },
    overlayText: {
      fontSize: 16,
      color: MINESWEEPER_COLORS.TEXT_COLOR,
      marginBottom: 8,
    },
    overlayButtonsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
      width: '100%',
    },
    overlayButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlayButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: MINESWEEPER_COLORS.TEXT_COLOR,
    },
  });
}
