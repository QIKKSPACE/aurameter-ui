import { getPuzzleSettings } from "./difficulty";

/* ===================== MAIN ===================== */

export function generatePuzzle(level = 1) {
  const settings = getPuzzleSettings(level);
  const cells = {};
  const equations = [];
  const operators = [];
  const grid = new Map(); // "x,y" → cellId

  let cellId = 0;
  let eqId = 0;

  const equationCount = rand(
    settings.equationCountRange[0],
    settings.equationCountRange[1]
  );

  // first equation
  placeEquationSafe({
    x: 0,
    y: 0,
    direction: "H",
    cells,
    equations,
    operators,
    grid,
    settings,
    cellIdRef: () => `c${cellId++}`,
    eqIdRef: () => `eq${eqId++}`,
  });

  // grow crossword
  let attempts = 0;
  while (equations.length < equationCount && attempts++ < 100) {
    tryAddCrossingEquationSafe({
      cells,
      equations,
      operators,
      grid,
      settings,
      cellIdRef: () => `c${cellId++}`,
      eqIdRef: () => `eq${eqId++}`,
    });
  }
  applyVisibilityRules(cells, settings);

  return {
    level,
    cells,
    equations,
    operators,
    digitRange: {
      min: settings.numberRange[0],
      max: Math.max(settings.numberRange[1] * settings.maxTerms, 999),
    },
    hints: settings.hints,
    difficulty: {
      operators: settings.allowedOperators,
      equationCount: equations.length,
      revealChance: settings.revealChance,
    },
  };
}

function placeEquationSafe({
  x,
  y,
  direction,
  cells,
  equations,
  operators,
  grid,
  settings,
  cellIdRef,
  eqIdRef,
  crossingCell = null,
}) {
  const eq = createValidEquation(settings);
  const eqId = eqIdRef();

  const dx = direction === "H" ? 2 : 0;
  const dy = direction === "V" ? 2 : 0;

  const numberCells = [];

  // validate number cells
  for (let i = 0; i < eq.values.length; i++) {
    const px = x + dx * i;
    const py = y + dy * i;
    const key = `${px},${py}`;

    if (grid.has(key)) {
      const cell = cells[grid.get(key)];

      if (!cell.editable) return false;
      if (cell.solution !== eq.values[i]) return false;
      if (cell.equations.length >= 2) return false;

      numberCells.push(cell);
    } else {
      numberCells.push({
        x: px,
        y: py,
        solution: eq.values[i],
      });
    }
  }

  // validate result cell
  const rx = x + dx * eq.values.length;
  const ry = y + dy * eq.values.length;
  if (grid.has(`${rx},${ry}`)) return false;

  /* ───── COMMIT ───── */

  const ids = [];

  numberCells.forEach(cellData => {
    let cell;

    if (cellData.id) {
      cell = cellData;
    } else {
      const id = cellIdRef();
      cell = {
        id,
        x: cellData.x,
        y: cellData.y,
        value: null,
        editable: true,
        equations: [],
        solution: cellData.solution,
      };
      cells[id] = cell;
      grid.set(`${cell.x},${cell.y}`, id);
    }

    cell.equations.push(eqId);
    ids.push(cell.id);
  });

  const resultId = cellIdRef();
  cells[resultId] = {
  id: resultId,
  x: rx,
  y: ry,
  value: null,          // UI uses value
  solution: eq.result,  // engine uses solution
  editable: false,
  equations: [eqId],
};

  grid.set(`${rx},${ry}`, resultId);

  // operators
  for (let i = 0; i < eq.values.length - 1; i++) {
    operators.push({
      id: `op-${eqId}-${i}`,
      x: x + dx * i + (direction === "H" ? 1 : 0),
      y: y + dy * i + (direction === "V" ? 1 : 0),
      symbol: eq.operator,
    });
  }

  operators.push({
    id: `eq-${eqId}`,
    x: x + dx * eq.values.length - (direction === "H" ? 1 : 0),
    y: y + dy * eq.values.length - (direction === "V" ? 1 : 0),
    symbol: "=",
  });

  equations.push({
    id: eqId,
    cells: ids,
    operator: eq.operator,
    result: eq.result,
    direction,
  });

  return true;
}
function tryAddCrossingEquationSafe({
  cells,
  equations,
  operators,
  grid,
  cellIdRef,
  eqIdRef,
  settings,
}) {
  const candidates = Object.values(cells).filter(
    c => c.editable && c.equations.length < 2
  );

  if (!candidates.length) return false;

  const anchor = candidates[rand(0, candidates.length - 1)];
  const baseEq = equations.find(e => e.id === anchor.equations[0]);

  const direction = baseEq.direction === "H" ? "V" : "H";

  return placeEquationSafe({
    x: anchor.x,
    y: anchor.y,
    direction,
    cells,
    equations,
    operators,
    grid,
    settings,
    cellIdRef,
    eqIdRef,
    crossingCell: anchor,
  });
}
function createValidEquation(settings) {
  const op =
    settings.allowedOperators[
      rand(0, settings.allowedOperators.length - 1)
    ];
  const termCount = pickTermCount(settings.maxTerms);
  const [minNumber, maxNumber] = settings.numberRange;

  if (op === "+") {
    const values = Array.from({ length: termCount }, () => rand(minNumber, maxNumber));
    return { values, result: values.reduce((a, b) => a + b, 0), operator: "+" };
  }

  if (op === "-") {
    return createNonNegativeSubtractionEquation({
      termCount,
      minNumber,
      maxNumber,
    });
  }

  if (op === "*") {
    const [minMul, maxMul] = settings.multiplyRange;
    const values = Array.from({ length: termCount }, () => rand(minMul, maxMul));
    return { values, result: values.reduce((a, b) => a * b, 1), operator: "*" };
  }

  const [minDiv, maxDiv] = settings.divisionRange;
  const divisor = rand(minDiv, maxDiv);
  const result = rand(minDiv, maxDiv);
  return { values: [divisor * result, divisor], result, operator: "/" };
}

function createNonNegativeSubtractionEquation({ termCount, minNumber, maxNumber }) {
  const values = [];
  const tailCount = Math.max(1, termCount - 1);

  const maxResult = Math.max(0, maxNumber - minNumber * tailCount);
  const result = rand(0, Math.max(0, maxResult));
  let remainingBudget = maxNumber - result;

  for (let i = 0; i < tailCount - 1; i++) {
    const remainingTailSlots = tailCount - i - 1;
    const minNeededForRest = minNumber * remainingTailSlots;
    const maxForThis = remainingBudget - minNeededForRest;
    const value = rand(minNumber, Math.max(minNumber, maxForThis));
    values.push(value);
    remainingBudget -= value;
  }

  values.push(rand(minNumber, Math.max(minNumber, remainingBudget)));

  const firstValue = values.reduce((sum, value) => sum + value, result);

  return {
    values: [firstValue, ...values],
    result,
    operator: "-",
  };
}

function pickTermCount(maxTerms) {
  if (maxTerms <= 2) return 2;

  if (maxTerms === 3) {
    return Math.random() < 0.45 ? 3 : 2;
  }

  const roll = Math.random();
  if (roll < 0.2) return 2;
  if (roll < 0.58) return 3;
  return 4;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function applyVisibilityRules(cells, settings) {
  const editableCells = Object.values(cells).filter(c => c.editable);

  editableCells.forEach(cell => {
    if (cell.equations.length === 2) {
      cell.value = Math.random() < settings.crossingRevealChance ? cell.solution : null;
    } else {
      cell.value = Math.random() < settings.revealChance ? cell.solution : null;
    }
  });

  // 🔒 Ensure at least one masked cell
  if (editableCells.every(c => c.value !== null)) {
    const hideOne = editableCells[rand(0, editableCells.length - 1)];
    hideOne.value = null;
  }

  // Any revealed number becomes a locked clue; only blank cells remain editable.
  editableCells.forEach((cell) => {
    cell.editable = cell.value === null;
  });

  // result cells always visible
  Object.values(cells).forEach(cell => {
    if (!cell.editable) cell.value = cell.solution;
  });
}

function isEquationValid(eq, cells) {
  const values = eq.cells.map(id => cells[id].value);
  if (values.some(v => v == null)) return false;

  let result;
  switch (eq.operator) {
    case "+":
      result = values.reduce((a, b) => a + b);
      break;
    case "-":
      result = values.reduce((a, b) => a - b);
      break;
    case "*":
      result = values.reduce((a, b) => a * b);
      break;
    case "/":
      result = values.reduce((a, b) => a / b);
      break;
    default:
      return false;
  }

  return result === eq.result;
}

