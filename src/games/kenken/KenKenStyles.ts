import { StyleSheet } from 'react-native';
import { KENKEN_COLORS, KENKEN_SIZING, KENKEN_TYPOGRAPHY, getDigitFontSize } from './KenKenColors';

export const createKenKenStyles = (gridSize: number, screenWidth: number) => {
  const GRID_WIDTH = screenWidth - KENKEN_SIZING.GRID_PADDING * 2;
  const cellSize = GRID_WIDTH / gridSize;
  const digitFontSize = getDigitFontSize(gridSize);

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: KENKEN_COLORS.BACKGROUND_SCREEN,
    },
    container: {
      flex: 1,
      backgroundColor: KENKEN_COLORS.BACKGROUND_SCREEN,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(139,143,232,0.1)',
    },
    headerBackButton: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: KENKEN_COLORS.ACTION_BUTTON_BG,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
      flex: 1,
      textAlign: 'center',
    },
    timerPill: {
      backgroundColor: KENKEN_COLORS.TIMER_BACKGROUND,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    timerText: {
      fontSize: KENKEN_TYPOGRAPHY.TIMER_FONT_SIZE,
      fontWeight: KENKEN_TYPOGRAPHY.TIMER_FONT_WEIGHT,
      color: KENKEN_COLORS.TIMER_TEXT_COLOR,
    },
    difficultBadgeContainer: {
      alignSelf: 'center',
      marginTop: 8,
      marginBottom: 8,
    },
    difficultyBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: 'transparent',
    },
    difficultyText: {
      fontSize: 11,
      fontWeight: '600',
    },
    scrollContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 16,
    },
    gridContainer: {
      width: GRID_WIDTH,
      height: GRID_WIDTH,
      borderWidth: KENKEN_SIZING.OUTER_GRID_BORDER,
      borderColor: KENKEN_COLORS.OUTER_GRID_BORDER,
      borderRadius: KENKEN_SIZING.GRID_BORDER_RADIUS,
      backgroundColor: KENKEN_COLORS.BACKGROUND_SCREEN,
      overflow: 'hidden',
    },
    gridRow: {
      flexDirection: 'row',
      flex: 1,
    },
    cell: {
      width: cellSize,
      height: cellSize,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: KENKEN_COLORS.BACKGROUND_CELL,
      padding: 4,
    },
    cellSelected: {
      backgroundColor: KENKEN_COLORS.BACKGROUND_CELL_SELECTED,
    },
    cellError: {
      backgroundColor: KENKEN_COLORS.BACKGROUND_CELL_ERROR,
    },
    cellLabel: {
      position: 'absolute',
      top: 2,
      left: 3,
      fontSize: KENKEN_TYPOGRAPHY.CAGE_LABEL_FONT_SIZE,
      fontWeight: KENKEN_TYPOGRAPHY.CAGE_LABEL_FONT_WEIGHT,
      color: KENKEN_COLORS.CAGE_LABEL_COLOR,
    },
    cellDigit: {
      fontSize: digitFontSize,
      fontWeight: KENKEN_TYPOGRAPHY.DIGIT_FONT_WEIGHT,
      color: KENKEN_COLORS.DIGIT_COLOR,
    },
    cellDigitError: {
      color: KENKEN_COLORS.DIGIT_COLOR_ERROR,
    },
    cellNotesContainer: {
      width: '100%',
      height: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 2,
    },
    cellNote: {
      fontSize: 8,
      fontWeight: '400',
      color: 'rgba(139,143,232,0.6)',
      width: '33.33%',
      textAlign: 'center',
    },
    actionBar: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: KENKEN_SIZING.ACTION_BAR_SPACING,
      marginBottom: KENKEN_SIZING.ACTION_BAR_MARGIN_BOTTOM,
      backgroundColor: KENKEN_COLORS.BACKGROUND_SCREEN,
    },
    actionButton: {
      width: KENKEN_SIZING.ACTION_BAR_BUTTON_SIZE,
      height: KENKEN_SIZING.ACTION_BAR_BUTTON_SIZE,
      borderRadius: 12,
      backgroundColor: KENKEN_COLORS.ACTION_BUTTON_BG,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtonActive: {
      backgroundColor: '#3A3A4A',
    },
    clearButton: {
      flex: 1,
      height: KENKEN_SIZING.ACTION_BAR_BUTTON_SIZE,
      borderRadius: 12,
      backgroundColor: KENKEN_COLORS.CLEAR_BUTTON_BG,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
    },
    clearButtonText: {
      color: KENKEN_COLORS.CLEAR_BUTTON_TEXT,
      fontWeight: '600',
      fontSize: 15,
    },
    numberPad: {
      paddingHorizontal: 16,
      paddingBottom: KENKEN_SIZING.NUMBER_PAD_PADDING_BOTTOM,
      backgroundColor: KENKEN_COLORS.BACKGROUND_SCREEN,
    },
    numberPadRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: KENKEN_SIZING.NUMBER_PAD_SPACING,
      marginBottom: KENKEN_SIZING.NUMBER_PAD_SPACING,
    },
    numberPadButton: {
      backgroundColor: KENKEN_COLORS.NUMBER_PAD_BUTTON_BG,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    numberPadButtonText: {
      color: KENKEN_COLORS.NUMBER_PAD_DIGIT_COLOR,
      fontWeight: KENKEN_TYPOGRAPHY.NUMBER_PAD_FONT_WEIGHT,
      fontSize: KENKEN_TYPOGRAPHY.NUMBER_PAD_FONT_SIZE,
    },
    victoryOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    victoryCard: {
      width: '80%',
      backgroundColor: KENKEN_COLORS.VICTORY_CARD_BG,
      borderRadius: 16,
      padding: 24,
      maxWidth: 350,
    },
    victoryCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    victoryCardButton: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: KENKEN_COLORS.ACTION_BUTTON_BG,
      justifyContent: 'center',
      alignItems: 'center',
    },
    victoryTitle: {
      fontSize: 36,
      fontWeight: '800',
      textAlign: 'center',
      marginVertical: 16,
    },
    victoryStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
      gap: 8,
    },
    victoryStat: {
      backgroundColor: KENKEN_COLORS.SCORE_BADGE_BG,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
      flex: 1,
    },
    victoryStatLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.6)',
      marginBottom: 4,
    },
    victoryStatValue: {
      fontSize: 16,
      fontWeight: '700',
      color: KENKEN_COLORS.SCORE_TEXT,
    },
    victoryButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    victoryButton: {
      flex: 1,
      height: 52,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: KENKEN_COLORS.ACTION_BUTTON_BG,
    },
    victoryButtonPrimary: {
      borderWidth: 2,
      borderColor: KENKEN_COLORS.VICTORY_NEW_GAME_BORDER,
    },
    victoryButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    victoryButtonTextPrimary: {
      color: KENKEN_COLORS.VICTORY_NEW_GAME_BORDER,
    },
  });
};

export const GRID_WIDTH_VALUE = (screenWidth: number) => screenWidth - KENKEN_SIZING.GRID_PADDING * 2;
