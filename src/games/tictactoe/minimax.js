/**
 * minimax.js
 * Minimax algorithm with alpha-beta pruning for NxN Tic-Tac-Toe.
 */

import { checkWinner, getAvailableMoves } from './checkWinner';

/**
 * Minimax with alpha-beta pruning.
 * @param {Array} board - Current board state
 * @param {number} depth - Current depth
 * @param {boolean} isMaximizing - Whether it's the AI's turn
 * @param {string} aiPlayer - AI marker ('X' or 'O')
 * @param {string} humanPlayer - Human marker
 * @param {number} alpha - Alpha cutoff
 * @param {number} beta - Beta cutoff
 * @param {number} maxDepth - Maximum search depth (Infinity for full search)
 * @param {number} boardSize - Board dimension (3, 4, or 5)
 * @returns {number} Best score
 */
const minimax = (
    board,
    depth,
    isMaximizing,
    aiPlayer,
    humanPlayer,
    alpha = -Infinity,
    beta = Infinity,
    maxDepth = Infinity,
    boardSize = 3,
) => {
    const { winner, isDraw } = checkWinner(board, boardSize);

    if (winner === aiPlayer) return 10 - depth;
    if (winner === humanPlayer) return depth - 10;
    if (isDraw) return 0;
    if (depth >= maxDepth) return 0;

    const availableMoves = getAvailableMoves(board);

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (const move of availableMoves) {
            board[move] = aiPlayer;
            const score = minimax(
                board, depth + 1, false, aiPlayer, humanPlayer, alpha, beta, maxDepth, boardSize,
            );
            board[move] = null;
            bestScore = Math.max(bestScore, score);
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (const move of availableMoves) {
            board[move] = humanPlayer;
            const score = minimax(
                board, depth + 1, true, aiPlayer, humanPlayer, alpha, beta, maxDepth, boardSize,
            );
            board[move] = null;
            bestScore = Math.min(bestScore, score);
            beta = Math.min(beta, score);
            if (beta <= alpha) break;
        }
        return bestScore;
    }
};

/**
 * Find the best move using minimax.
 * @param {Array} board - Current board state
 * @param {string} aiPlayer - AI marker
 * @param {string} humanPlayer - Human marker
 * @param {number} maxDepth - Depth limit (use Infinity for full search)
 * @param {number} boardSize - Board dimension (3, 4, or 5)
 * @returns {number} Best cell index
 */
export const findBestMove = (board, aiPlayer = 'O', humanPlayer = 'X', maxDepth = Infinity, boardSize = 3) => {
    let bestScore = -Infinity;
    let bestMove = -1;
    const availableMoves = getAvailableMoves(board);

    for (const move of availableMoves) {
        board[move] = aiPlayer;
        const score = minimax(board, 0, false, aiPlayer, humanPlayer, -Infinity, Infinity, maxDepth, boardSize);
        board[move] = null;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
};

export default findBestMove;
