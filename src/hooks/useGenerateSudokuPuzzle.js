// sudokuGenerator.js

// Function to generate a solved Sudoku board using backtracking
const generateSudokuSolution = () => {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  
  // Solve the board using backtracking
  solve(board);
  return board;
};

// Backtracking solver function
const solve = (board) => {
  const emptySpot = findEmpty(board);
  if (!emptySpot) return true; // No empty spots, puzzle is solved
  
  const [row, col] = emptySpot;
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]); // Randomize the number order
  
  for (const num of nums) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      if (solve(board)) return true;
      board[row][col] = 0; // Backtrack
    }
  }
  return false;
};

// Find an empty spot (represented by 0)
const findEmpty = (board) => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return [r, c];
    }
  }
  return null;
};

// Check if placing a number in a given row/col is valid
const isValid = (board, row, col, num) => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }
  
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[startRow + r][startCol + c] === num) return false;
    }
  }
  
  return true;
};

// Randomize an array (used for shuffling numbers)
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap
  }
  return array;
};

// Function to remove numbers and create a puzzle from the solution
const generatePuzzleFromSolution = (solution) => {
  const puzzle = JSON.parse(JSON.stringify(solution)); // Deep copy the solution
  let attempts = 0;
  const maxAttempts = 40; // Remove 40 cells
  
  while (attempts < maxAttempts) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    
    // Only remove the cell if it's not already empty
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      attempts++;
    }
  }
  
  return puzzle;
};

// Main function to generate a puzzle with solution
const generateSudokuPuzzle = () => {
  const solution = generateSudokuSolution();
  const puzzle = generatePuzzleFromSolution(solution);
  return { puzzle, solution };
};

export { generateSudokuPuzzle };
