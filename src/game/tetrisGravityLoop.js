/**
 * Tetris Gravity Loop
 * -------------------
 * Handles automatic falling of the current piece based on dropInterval.
 */

import { dropPiece } from "./tetrisEngine";

/**
 * Start the gravity loop
 * @param {function} dispatch - Redux dispatch
 * @param {object} store - Redux store (has getState & subscribe)
 * @returns {function} stopGravity - call to stop the loop
 */
export function startGravityLoop(dispatch, store) {
  let intervalId = null;

  const startInterval = () => {
    const { status, dropInterval } = store.getState().tetrisGame;

    if (status !== "playing") return;

    // Clear previous interval
    if (intervalId) clearInterval(intervalId);

    intervalId = setInterval(() => {
      const { status } = store.getState().tetrisGame;
      if (status === "playing") {
        dispatch(dropPiece());
      }
    }, dropInterval);
  };

  // Start immediately
  startInterval();

  // Subscribe to store changes to adjust speed dynamically
  const unsubscribe = store.subscribe(() => {
    const { status, dropInterval } = store.getState().tetrisGame;
    // Reset interval if speed changed
    if (status === "playing") {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        dispatch(dropPiece());
      }, dropInterval);
    }
  });

  const stopGravity = () => {
    if (intervalId) clearInterval(intervalId);
    unsubscribe();
  };

  return stopGravity;
}
