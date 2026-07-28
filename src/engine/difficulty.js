import { getNumberGameConfig } from "../utils/numberGameProgression";

export const getPuzzleSettings = (level = 1) => {
  const config = getNumberGameConfig(level);
  const maxNumber = config.numberRange[1];

  return {
    equationCountRange: config.equationCountRange,
    maxCrossingsPerCell: level <= 15 ? 1 : 2,
    allowedOperators: config.allowedOperators,
    maxTerms: config.maxTerms,
    numberRange: config.numberRange,
    multiplyRange: config.multiplyRange || [2, Math.max(4, Math.floor(maxNumber / 2))],
    divisionRange: config.divisionRange || [2, Math.max(4, Math.floor(maxNumber / 2))],
    revealChance: config.revealChance,
    crossingRevealChance: config.crossingRevealChance,
    hints: 1,
  };
};

export const PUZZLE_SETTINGS = getPuzzleSettings(1);
