export const GAME_2048_COLORS = {
  SCREEN_BG: '#FAF8EF',
  GRID_BG: '#BBADA0',
  CELL_EMPTY_BG: '#CDC1B4',
  HEADER_BG: '#FAF8EF',
  SCORE_BG: '#BBADA0',
  SCORE_TEXT: '#FFFFFF',
  SCORE_LABEL: '#EEE4DA',
  TITLE_COLOR: '#776E65',

  TILE_COLORS: {
    2: { bg: '#EEE4DA', text: '#776E65' },
    4: { bg: '#EDE0C8', text: '#776E65' },
    8: { bg: '#F2B179', text: '#FFFFFF' },
    16: { bg: '#F59563', text: '#FFFFFF' },
    32: { bg: '#F67C5F', text: '#FFFFFF' },
    64: { bg: '#F65E3B', text: '#FFFFFF' },
    128: { bg: '#EDCF72', text: '#FFFFFF' },
    256: { bg: '#EDCC61', text: '#FFFFFF' },
    512: { bg: '#EDC850', text: '#FFFFFF' },
    1024: { bg: '#EDC53F', text: '#FFFFFF' },
    2048: { bg: '#EDC22E', text: '#FFFFFF' },
    4096: { bg: '#3C3A32', text: '#FFFFFF' },
    8192: { bg: '#3C3A32', text: '#FFFFFF' },
  } as Record<number, { bg: string; text: string }>,

  BUTTON_BG: '#8F7A66',
  BUTTON_TEXT: '#FFFFFF',
};

export const getTileColor = (value: number): { bg: string; text: string } => {
  const colors = GAME_2048_COLORS.TILE_COLORS;
  if (value in colors) {
    return colors[value as keyof typeof colors];
  }
  return colors[4096] || { bg: '#3C3A32', text: '#FFFFFF' };
};

export const getTileFontSize = (value: number, cellSize: number): number => {
  if (value <= 64) return Math.floor(cellSize * 0.45);
  if (value <= 512) return Math.floor(cellSize * 0.38);
  if (value <= 2048) return Math.floor(cellSize * 0.32);
  return Math.floor(cellSize * 0.26);
};
