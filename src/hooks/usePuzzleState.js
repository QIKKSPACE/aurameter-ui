import { useDispatch, useSelector } from "react-redux";
import { updateCellValue } from "../store/puzzleSlice";

export function usePuzzleState() {
  const dispatch = useDispatch();

  // Get puzzle from Redux
  const puzzle = useSelector((state) => state.mathPuzzle.puzzle);

  // Update a single cell safely
  const setCellValue = (cellId, value) => {
    if (!puzzle || !puzzle.cells[cellId]) return;

    const cell = puzzle.cells[cellId];
    // Prevent editing non-editable cells (clues)
    if (!cell.editable) return;

    if (value === null || value === "") {
      dispatch(updateCellValue({ cellId, value: null }));
      return;
    }

    // Clamp value within puzzle digitRange
    const min = puzzle?.level
      ? puzzle.digitRange?.min ?? 0
      : 0;
    const max = puzzle?.level
      ? puzzle.digitRange?.max ?? 9999
      : 9999;

    const safeValue = Math.min(Math.max(Number(value) || 0, min), max);

    dispatch(updateCellValue({ cellId, value: safeValue }));
  };

  return {
    puzzle,
    setCellValue,
  };
}
