/**
 * aiEngine.js
 * Multiple AI strategies for different difficulty levels and board sizes.
 */

import { checkWinner, getAvailableMoves } from './checkWinner';
import { findBestMove } from './minimax';

/**
 * Find an immediate winning move for `player`, otherwise -1.
 */
const findImmediateWinningMove = (board, player, boardSize = 3) => {
    const available = getAvailableMoves(board);
    for (const move of available) {
        board[move] = player;
        const { winner } = checkWinner(board, boardSize);
        board[move] = null;
        if (winner === player) {
            return move;
        }
    }
    return -1;
};

/**
 * Level 1: Random move — still takes forced tactical moves first.
 * Priority: win > block > random.
 */
export const randomMove = (board, aiPlayer = 'O', humanPlayer = 'X', boardSize = 3) => {
    const available = getAvailableMoves(board);
    if (available.length === 0) return -1;

    const winMove = findImmediateWinningMove(board, aiPlayer, boardSize);
    if (winMove !== -1) return winMove;

    const blockMove = findImmediateWinningMove(board, humanPlayer, boardSize);
    if (blockMove !== -1) return blockMove;

    return available[Math.floor(Math.random() * available.length)];
};

/**
 * Level 2: Defensive AI — blocks the player's winning move,
 * otherwise plays randomly.
 */
export const defensiveMove = (board, aiPlayer = 'O', humanPlayer = 'X', boardSize = 3) => {
    const available = getAvailableMoves(board);
    if (available.length === 0) return -1;

    // 1. Check if AI can win immediately
    const winMove = findImmediateWinningMove(board, aiPlayer, boardSize);
    if (winMove !== -1) return winMove;

    // 2. Block human winning move
    const blockMove = findImmediateWinningMove(board, humanPlayer, boardSize);
    if (blockMove !== -1) return blockMove;

    // 3. Otherwise random
    return available[Math.floor(Math.random() * available.length)];
};

/**
 * Level 3: Strategic AI — prioritises center, corners, then blocks.
 */
export const strategicMove = (board, aiPlayer = 'O', humanPlayer = 'X', boardSize = 3) => {
    const available = getAvailableMoves(board);
    if (available.length === 0) return -1;

    // 1. Win if possible
    const winMove = findImmediateWinningMove(board, aiPlayer, boardSize);
    if (winMove !== -1) return winMove;

    // 2. Block human
    const blockMove = findImmediateWinningMove(board, humanPlayer, boardSize);
    if (blockMove !== -1) return blockMove;

    // 3. Take center
    const center = Math.floor(boardSize * boardSize / 2);
    if (board[center] === null) return center;

    // 4. Take a corner
    const corners = [];
    corners.push(0);                              // top-left
    corners.push(boardSize - 1);                   // top-right
    corners.push((boardSize - 1) * boardSize);     // bottom-left
    corners.push(boardSize * boardSize - 1);       // bottom-right
    const freeCorners = corners.filter((i) => board[i] === null);
    if (freeCorners.length > 0) {
        return freeCorners[Math.floor(Math.random() * freeCorners.length)];
    }

    // 5. Take any edge
    return available[Math.floor(Math.random() * available.length)];
};

/**
 * Level 4: Limited-depth minimax on 4×4 board (depth 4).
 */
export const limitedMinimaxMove = (board, aiPlayer = 'O', humanPlayer = 'X', boardSize = 4) => {
    const winMove = findImmediateWinningMove(board, aiPlayer, boardSize);
    if (winMove !== -1) return winMove;

    const blockMove = findImmediateWinningMove(board, humanPlayer, boardSize);
    if (blockMove !== -1) return blockMove;

    // Use depth 4 for 4×4 boards, depth 3 for anything larger
    const depth = boardSize <= 4 ? 4 : 3;
    return findBestMove(board, aiPlayer, humanPlayer, depth, boardSize);
};

/**
 * Level 5: Best possible AI for 5×5 board.
 * Uses depth-limited minimax with strategic opening.
 */
export const fullMinimaxMove = (board, aiPlayer = 'O', humanPlayer = 'X', boardSize = 5) => {
    const available = getAvailableMoves(board);

    const winMove = findImmediateWinningMove(board, aiPlayer, boardSize);
    if (winMove !== -1) return winMove;

    const blockMove = findImmediateWinningMove(board, humanPlayer, boardSize);
    if (blockMove !== -1) return blockMove;

    if (boardSize <= 3) {
        // Full minimax for 3×3
        return findBestMove(board, aiPlayer, humanPlayer, Infinity, boardSize);
    }

    // For larger boards, use strategic center/corner + depth-limited minimax
    const totalCells = boardSize * boardSize;
    const filledCells = totalCells - available.length;

    // Strategic opening: take center if available
    const center = Math.floor(totalCells / 2);
    if (filledCells < 3 && board[center] === null) {
        return center;
    }

    // As the board fills up, increase depth since there are fewer moves
    let depth;
    if (available.length <= 8) {
        depth = 6; // Can go deeper when fewer empty cells
    } else if (available.length <= 12) {
        depth = 5;
    } else if (available.length <= 16) {
        depth = 4;
    } else {
        depth = 3;
    }

    return findBestMove(board, aiPlayer, humanPlayer, depth, boardSize);
};

/**
 * Get the AI move function for a given level.
 * @param {number} level - 1 to 5
 * @returns {Function}
 */
export const getAIMoveForLevel = (level) => {
    switch (level) {
        case 1:
            return randomMove;
        case 2:
            return defensiveMove;
        case 3:
            return strategicMove;
        case 4:
            return limitedMinimaxMove;
        case 5:
            return fullMinimaxMove;
        default:
            return randomMove;
    }
};

export default getAIMoveForLevel;
