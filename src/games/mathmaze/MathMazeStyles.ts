import { StyleSheet } from 'react-native'
import { MathMazeColors } from './MathMazeColors'

export const createMathMazeStyles = (screenWidth: number, screenHeight: number, gridSize: number) => {
  const cellSize = (screenWidth - 80) / gridSize
  const gap = 8

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: MathMazeColors.SCREEN_BG,
    },
    container: {
      flex: 1,
      backgroundColor: MathMazeColors.SCREEN_BG,
    },
    headerContainer: {
      backgroundColor: MathMazeColors.HEADER_BG,
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    playerBlock: {
      alignItems: 'center',
    },
    playerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: MathMazeColors.PLAYER_AVATAR_BG,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
      fontWeight: '700',
      fontSize: 16,
      color: MathMazeColors.PLAYER_NAME_COLOR,
    },
    playerAvatarRight: {
      borderRadius: 20,
      borderWidth: 2,
      borderColor: '#7B7FC4',
    },
    playerName: {
      color: MathMazeColors.PLAYER_NAME_COLOR,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 2,
    },
    playerScore: {
      color: MathMazeColors.PLAYER_SCORE_COLOR,
      fontSize: 13,
      fontWeight: '500',
    },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
    },
    scoreBadge: {
      backgroundColor: MathMazeColors.SCORE_BADGE_BG,
      borderRadius: 10,
      width: 52,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreBadgeText: {
      color: MathMazeColors.SCORE_BADGE_TEXT,
      fontSize: 20,
      fontWeight: '700',
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: MathMazeColors.TIMER_BG,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    timerText: {
      color: MathMazeColors.TIMER_TEXT,
      fontSize: 14,
      fontWeight: '700',
      marginLeft: 6,
    },
    targetContainer: {
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
    },
    targetLabel: {
      color: MathMazeColors.TARGET_LABEL,
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 1,
      marginBottom: 4,
    },
    targetValue: {
      fontSize: 72,
      fontWeight: '700',
      color: MathMazeColors.TARGET_VALUE,
    },
    targetWrongValue: {
      color: MathMazeColors.TARGET_WRONG_COLOR,
    },
    boardContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    boardWrapper: {
      width: screenWidth - 48,
      height: (cellSize + gap) * gridSize - gap,
    },
    board: {
      width: '100%',
      height: '100%',
    },
    cellGrid: {
      flexDirection: 'column',
      gap: gap,
    },
    cellRow: {
      flexDirection: 'row',
      gap: gap,
    },
    cell: {
      width: cellSize,
      height: cellSize,
      borderRadius: cellSize * 0.25,
      backgroundColor: MathMazeColors.CELL_DEFAULT_BG,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellSelected: {
      backgroundColor: MathMazeColors.CELL_SELECTED_BG,
    },
    cellWrong: {
      backgroundColor: MathMazeColors.CELL_WRONG_BG,
    },
    cellText: {
      fontSize: cellSize * 0.4,
      fontWeight: '700',
      color: MathMazeColors.CELL_DEFAULT_TEXT,
    },
    cellTextSelected: {
      color: MathMazeColors.CELL_SELECTED_TEXT,
    },
    cellTextWrong: {
      color: MathMazeColors.CELL_WRONG_TEXT,
    },
    pathConnector: {
      position: 'absolute',
      backgroundColor: MathMazeColors.PATH_LINE_COLOR,
      opacity: 0.85,
    },
    startLabel: {
      position: 'absolute',
      backgroundColor: MathMazeColors.START_LABEL_BG,
      borderWidth: 1.5,
      borderColor: MathMazeColors.START_LABEL_BORDER,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      top: -35,
      left: cellSize / 2 - 20,
    },
    startLabelText: {
      color: MathMazeColors.START_LABEL_TEXT,
      fontSize: 11,
      fontWeight: '700',
    },
    endLabel: {
      position: 'absolute',
      backgroundColor: MathMazeColors.END_LABEL_BG,
      borderWidth: 1.5,
      borderColor: MathMazeColors.END_LABEL_BORDER,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      bottom: -35,
      right: cellSize / 2 - 20,
    },
    endLabelText: {
      color: MathMazeColors.END_LABEL_TEXT,
      fontSize: 11,
      fontWeight: '700',
    },
    actionBar: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingVertical: 12,
      paddingBottom: 20,
      gap: 8,
      alignItems: 'center',
    },
    actionButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: MathMazeColors.ACTION_BUTTON_BG,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      backgroundColor: MathMazeColors.ACTION_BUTTON_BG,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    clearButtonText: {
      color: MathMazeColors.ACTION_BUTTON_TEXT,
      fontSize: 14,
      fontWeight: '700',
    },
    actionButtonIcon: {
      color: MathMazeColors.ACTION_BUTTON_TEXT,
      fontSize: 20,
    },
  })
}
