import { useMemo } from "react";
import { useSelector } from "react-redux";

export function usePuzzleValidation(validatePressed = false) {
  const puzzle = useSelector((state) => state.mathPuzzle.puzzle);

  return useMemo(() => {
    if (!puzzle) {
      return {
        equationStatus: {},
        cellStatus: {},
        allSolved: false,
      };
    }

    const equationStatus = {};
    const cellStatus = {};
    let solvedCount = 0;

    puzzle.equations.forEach((eq) => {
      const values = eq.cells.map((id) => {
        const cell = puzzle.cells[id];
        return typeof cell?.value === "number" ? cell.value : null;
      });

      if (values.some(v => v === null)) {
        equationStatus[eq.id] = "incomplete";
        return;
      }

      const correct =
        applyOperator(values, eq.operator) === eq.result;

      equationStatus[eq.id] = correct ? "correct" : "wrong";
      if (correct) solvedCount++;

      // Mark involved cells
      if (validatePressed) {
        eq.cells.forEach((id) => {
          cellStatus[id] = correct ? "correct" : "wrong";
        });
      }
    });

    return {
      equationStatus,
      cellStatus,
      allSolved: solvedCount === puzzle.equations.length,
    };
  }, [puzzle, validatePressed]);
}



function applyOperator(values, operator) {
  switch (operator) {
    case "+":
      return values.reduce((a, b) => a + b);

    case "-":
      return values.reduce((a, b) => a - b);

    case "*":
      return values.reduce((a, b) => a * b);

    case "/":
      return values.reduce((a, b) => a / b);

    default:
      return values[0];
  }
}
