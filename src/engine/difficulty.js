export const getPuzzleSettings = (level = 1) => {
  let mode = "easy";
  if (level >= 6) mode = "medium";
  if (level >= 16) mode = "hard";

  const allowedOperators = ["+", "-"];
  if (mode === "medium") {
    allowedOperators.push("*");
    if (level >= 10) allowedOperators.push("/");
  }
  if (mode === "hard") {
    allowedOperators.push("*", "/");
  }

  const equationMin = mode === "easy" ? 2 : mode === "medium" ? 5 : 9;
  const equationMax = mode === "easy" ? 4 : mode === "medium" ? 8 : 14;

  const numberMax = mode === "easy" ? 20 : mode === "medium" ? 50 : 150;

  return {
    equationCountRange: [equationMin, equationMax],
    maxCrossingsPerCell: 2,
    allowedOperators,
    maxTerms: mode === "hard" ? 3 : 2,
    numberRange: [1, numberMax],
    multiplyRange: mode === "hard" ? [2, 15] : [2, 10],
    divisionRange: mode === "hard" ? [2, 15] : [2, 10],
    revealChance: mode === "easy" ? 0.35 : mode === "medium" ? 0.25 : 0.12,
    crossingRevealChance: mode === "easy" ? 0.20 : mode === "medium" ? 0.15 : 0.08,
    hints: mode === "easy" ? 3 : mode === "medium" ? 2 : 1,
  };
};

export const PUZZLE_SETTINGS = getPuzzleSettings(1);
