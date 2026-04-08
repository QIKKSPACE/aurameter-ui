export const KENKEN_COLORS = {
  BACKGROUND_SCREEN: '#0D0D0D',
  BACKGROUND_CELL: '#181818',
  BACKGROUND_CELL_SELECTED: '#EDE89A',
  BACKGROUND_CELL_ERROR: 'rgba(239,68,68,0.25)',

  CAGE_BORDER_COLOR: '#8B8FE8',
  INNER_BORDER_COLOR: 'rgba(139,143,232,0.25)',
  OUTER_GRID_BORDER: '#8B8FE8',

  CAGE_LABEL_COLOR: '#FFFFFF',
  DIGIT_COLOR: '#8B8FE8',
  DIGIT_COLOR_ERROR: '#EF4444',

  NUMBER_PAD_BUTTON_BG: '#7B7FC4',
  NUMBER_PAD_DIGIT_COLOR: '#FFFFFF',

  TIMER_BACKGROUND: '#00BCD4',
  TIMER_TEXT_COLOR: '#FFFFFF',
  TIMER_ICON_COLOR: '#FFFFFF',

  ACTION_BUTTON_BG: '#2A2A2A',
  ACTION_BUTTON_ICON: '#FFFFFF',
  CLEAR_BUTTON_BG: '#2A2A2A',
  CLEAR_BUTTON_TEXT: '#FFFFFF',

  SCORE_BADGE_BG: '#2A2A2A',
  SCORE_TEXT: '#FFFFFF',

  VICTORY_TITLE_COLOR_START: '#00E5CC',
  VICTORY_TITLE_COLOR_END: '#A8FF78',
  VICTORY_NEW_GAME_BORDER: '#39FF14',
  VICTORY_CARD_BG: '#1E1E1E',
};

export const KENKEN_TYPOGRAPHY = {
  CAGE_LABEL_FONT_SIZE: 10,
  CAGE_LABEL_FONT_WEIGHT: '400' as const,
  DIGIT_FONT_SIZE_4x4: 28,
  DIGIT_FONT_SIZE_6x6: 22,
  DIGIT_FONT_SIZE_8x8: 16,
  DIGIT_FONT_SIZE_9x9: 14,
  DIGIT_FONT_WEIGHT: '600' as const,
  NUMBER_PAD_FONT_SIZE: 22,
  NUMBER_PAD_FONT_WEIGHT: '700' as const,
  TIMER_FONT_SIZE: 18,
  TIMER_FONT_WEIGHT: '600' as const,
};

export const KENKEN_SIZING = {
  OUTER_GRID_BORDER: 2,
  CAGE_BOUNDARY_BORDER: 2,
  INNER_SAME_CAGE_BORDER: 0.5,
  GRID_PADDING: 20,
  GRID_BORDER_RADIUS: 4,
  ACTION_BAR_BUTTON_SIZE: 48,
  ACTION_BAR_SPACING: 8,
  ACTION_BAR_MARGIN_BOTTOM: 12,
  NUMBER_PAD_BUTTON_BASE_SIZE: 64,
  NUMBER_PAD_BUTTON_6x6_SIZE: 56,
  NUMBER_PAD_BUTTON_7plus_SIZE: 48,
  NUMBER_PAD_SPACING: 12,
  NUMBER_PAD_PADDING_BOTTOM: 24,
};

export const getDigitFontSize = (gridSize: number): number => {
  if (gridSize <= 4) return KENKEN_TYPOGRAPHY.DIGIT_FONT_SIZE_4x4;
  if (gridSize <= 6) return KENKEN_TYPOGRAPHY.DIGIT_FONT_SIZE_6x6;
  if (gridSize <= 8) return KENKEN_TYPOGRAPHY.DIGIT_FONT_SIZE_8x8;
  return KENKEN_TYPOGRAPHY.DIGIT_FONT_SIZE_9x9;
};

export const getNumberPadButtonSize = (gridSize: number): number => {
  if (gridSize <= 4) return KENKEN_SIZING.NUMBER_PAD_BUTTON_BASE_SIZE;
  if (gridSize <= 6) return KENKEN_SIZING.NUMBER_PAD_BUTTON_6x6_SIZE;
  return KENKEN_SIZING.NUMBER_PAD_BUTTON_7plus_SIZE;
};

export const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard' | 'expert') => {
  switch (difficulty) {
    case 'easy':
      return { bg: 'rgba(74,222,128,0.2)', text: '#4ADE80' };
    case 'medium':
      return { bg: 'rgba(250,204,21,0.2)', text: '#FACC15' };
    case 'hard':
      return { bg: 'rgba(249,115,22,0.2)', text: '#F97316' };
    case 'expert':
      return { bg: 'rgba(239,68,68,0.2)', text: '#EF4444' };
    default:
      return { bg: 'rgba(74,222,128,0.2)', text: '#4ADE80' };
  }
};
