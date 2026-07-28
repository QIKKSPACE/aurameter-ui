export const getNumberGameConfig = (level = 1) => {
  if (level <= 15) {
    return {
      equationCountRange: [2, 4],
      maxTerms: 2,
      allowedOperators: ["+", "-"],
      numberRange: [1, 12],
      revealChance: 0.42,
      crossingRevealChance: 0.22,
    };
  }

  if (level <= 50) {
    return {
      equationCountRange: [4, 6],
      maxTerms: 3,
      allowedOperators: ["+", "-"],
      numberRange: [1, 20],
      revealChance: 0.32,
      crossingRevealChance: 0.18,
    };
  }

  if (level <= 120) {
    return {
      equationCountRange: [5, 8],
      maxTerms: 3,
      allowedOperators: ["+", "-", "*"],
      numberRange: [1, 30],
      multiplyRange: [2, 9],
      revealChance: 0.24,
      crossingRevealChance: 0.14,
    };
  }

  if (level <= 250) {
    return {
      equationCountRange: [7, 10],
      maxTerms: 4,
      allowedOperators: ["+", "-", "*", "/"],
      numberRange: [1, 40],
      multiplyRange: [2, 12],
      divisionRange: [2, 12],
      revealChance: 0.18,
      crossingRevealChance: 0.1,
    };
  }

  return {
    equationCountRange: [9, 13],
    maxTerms: 4,
    allowedOperators: ["+", "-", "*", "/"],
    numberRange: [1, 60],
    multiplyRange: [2, 15],
    divisionRange: [2, 15],
    revealChance: 0.12,
    crossingRevealChance: 0.08,
  };
};

export const getRewardMultiplier = (score = 0) => {
  if (score >= 500) return 3;
  if (score >= 100) return 2;
  return 1;
};

export const calculateLevelReward = ({
  score = 0,
  equationCount = 0,
  hintUsed = false,
}) => {
  if (hintUsed) return 1;
  return Math.max(1, equationCount * getRewardMultiplier(score));
};
