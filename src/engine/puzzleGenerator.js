import { PUZZLE_SETTINGS } from "./difficulty";

/* ===================== MAIN ===================== */

export function generatePuzzle() {
  const cells = {};
  const equations = [];
  const operators = [];
  const grid = new Map(); // "x,y" → cellId

  let cellId = 0;
  let eqId = 0;

  const equationCount = rand(
    PUZZLE_SETTINGS.equationCountRange[0],
    PUZZLE_SETTINGS.equationCountRange[1]
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
      cellIdRef: () => `c${cellId++}`,
      eqIdRef: () => `eq${eqId++}`,
    });
  }
applyVisibilityRules(cells);

  return { cells, equations, operators };
}

function placeEquationSafe({
  x,
  y,
  direction,
  cells,
  equations,
  operators,
  grid,
  cellIdRef,
  eqIdRef,
  crossingCell = null,
}) {
  const eq = createValidEquation();
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
    cellIdRef,
    eqIdRef,
    crossingCell: anchor,
  });
}
function createValidEquation() {
  const op =
    PUZZLE_SETTINGS.allowedOperators[
      rand(0, PUZZLE_SETTINGS.allowedOperators.length - 1)
    ];

  if (op === "+") {
    const a = rand(1, 50);
    const b = rand(1, 50);
    return { values: [a, b], result: a + b, operator: "+" };
  }

  if (op === "-") {
    const a = rand(1, 50);
    const b = rand(1, a);
    return { values: [a, b], result: a - b, operator: "-" };
  }

  if (op === "*") {
    const a = rand(1, 12);
    const b = rand(1, 12);
    return { values: [a, b], result: a * b, operator: "*" };
  }

  const b = rand(1, 12);
  const c = rand(1, 12);
  return { values: [b * c, b], result: c, operator: "/" };
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function applyVisibilityRules(cells) {
  const editableCells = Object.values(cells).filter(c => c.editable);

  editableCells.forEach(cell => {
    if (cell.equations.length === 2) {
      cell.value = Math.random() < 0.15 ? cell.solution : null;
    } else {
      cell.value = Math.random() < 0.35 ? cell.solution : null;
    }
  });

  // 🔒 Ensure at least one masked cell
  if (editableCells.every(c => c.value !== null)) {
    const hideOne = editableCells[rand(0, editableCells.length - 1)];
    hideOne.value = null;
  }

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

