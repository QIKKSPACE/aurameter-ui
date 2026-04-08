/**
 * checkWinner.js
 * Dynamic win detection for NxN boards.
 * Supports 3×3, 4×4, and 5×5 with configurable win length.
 */

/**
 * Generate all winning combinations for a board of given size and win length.
 * @param {number} boardSize - Size of the board (3, 4, or 5)
 * @param {number} winLength - Number in a row needed to win (usually === boardSize)
 * @returns {number[][]} Array of winning combinations
 */
export const generateWinningCombos = (boardSize, winLength) => {
    const combos = [];

    // Rows
    for (let row = 0; row < boardSize; row++) {
        for (let startCol = 0; startCol <= boardSize - winLength; startCol++) {
            const combo = [];
            for (let i = 0; i < winLength; i++) {
                combo.push(row * boardSize + startCol + i);
            }
            combos.push(combo);
        }
    }

    // Columns
    for (let col = 0; col < boardSize; col++) {
        for (let startRow = 0; startRow <= boardSize - winLength; startRow++) {
            const combo = [];
            for (let i = 0; i < winLength; i++) {
                combo.push((startRow + i) * boardSize + col);
            }
            combos.push(combo);
        }
    }

    // Diagonals (top-left to bottom-right)
    for (let startRow = 0; startRow <= boardSize - winLength; startRow++) {
        for (let startCol = 0; startCol <= boardSize - winLength; startCol++) {
            const combo = [];
            for (let i = 0; i < winLength; i++) {
                combo.push((startRow + i) * boardSize + (startCol + i));
            }
            combos.push(combo);
        }
    }

    // Anti-diagonals (top-right to bottom-left)
    for (let startRow = 0; startRow <= boardSize - winLength; startRow++) {
        for (let startCol = winLength - 1; startCol < boardSize; startCol++) {
            const combo = [];
            for (let i = 0; i < winLength; i++) {
                combo.push((startRow + i) * boardSize + (startCol - i));
            }
            combos.push(combo);
        }
    }

    return combos;
};

// Cache for generated combos to avoid recomputation
const comboCache = {};

const getCombos = (boardSize, winLength) => {
    const key = `${boardSize}_${winLength}`;
    if (!comboCache[key]) {
        comboCache[key] = generateWinningCombos(boardSize, winLength);
    }
    return comboCache[key];
};

// Pre-generate the classic 3×3 combos for backward compatibility
export const WINNING_COMBOS = generateWinningCombos(3, 3);

/**
 * Check for a winner on the board.
 * @param {Array} board - Array of N*N cells ('X', 'O', or null)
 * @param {number} boardSize - Size of the board (default 3)
 * @param {number} winLength - Win length (default === boardSize)
 * @returns {{ winner: string|null, line: number[]|null, isDraw: boolean }}
 */
export const checkWinner = (board, boardSize = 3, winLength) => {
    const wl = winLength || boardSize;
    const combos = getCombos(boardSize, wl);

    for (const combo of combos) {
        const first = board[combo[0]];
        if (first && combo.every((idx) => board[idx] === first)) {
            return { winner: first, line: combo, isDraw: false };
        }
    }

    const isDraw = board.every((cell) => cell !== null);
    return { winner: null, line: null, isDraw };
};

/**
 * Get all available (empty) cell indices.
 * @param {Array} board
 * @returns {number[]}
 */
export const getAvailableMoves = (board) => {
    return board.reduce((moves, cell, index) => {
        if (cell === null) moves.push(index);
        return moves;
    }, []);
};

export default checkWinner;
