// src/engine/ballSortEngine.js
import { deepClone } from "../utils/clone";

export const getValidMoves = (tubes, capacity) => {
  const moves = [];
  for (let f = 0; f < tubes.length; f++) {
    if (tubes[f].length === 0) continue;
    for (let t = 0; t < tubes.length; t++) {
      if (f === t) continue;
      
      const fromTop = tubes[f][tubes[f].length - 1];
      const toTube = tubes[t];
      
      // Target tube is empty, or has space AND top matches
      if (
        toTube.length < capacity &&
        (toTube.length === 0 || toTube[toTube.length - 1] === fromTop)
      ) {
        moves.push([f, t]);
      }
    }
  }
  return moves;
};

// Check if a move is valid
export const canMove = (from, to, tubes, capacity) => {
  if (from === to) return false;
  const fromTube = tubes[from];
  const toTube = tubes[to];
  
  if (fromTube.length === 0) return false;
  if (toTube.length >= capacity) return false;
  
  if (toTube.length === 0) return true;
  
  const fromTop = fromTube[fromTube.length - 1];
  const toTop = toTube[toTube.length - 1];
  
  return fromTop === toTop;
};

export const isWin = (tubes, capacity) => {
  return tubes.every(
    (tube) =>
      tube.length === 0 ||
      (tube.length === capacity && tube.every((ball) => ball === tube[0]))
  );
};

export const isTubeComplete = (tube, capacity) => {
  return tube.length === capacity && tube.every((ball) => ball === tube[0]);
};

// Reverse-solve generation:
// 1. Create a fully solved state.
// 2. Un-solve it by moving top balls to empty tubes or tubes with matching top ball,
//    or ANY empty space (since reverse-move means we are pulling a ball from anywhere to build).
// Actually, a reverse move is: Move a ball from tube A to tube B, provided tube B isn't full. 
// In reverse, we don't care about matching colors! We just pull balls off and scatter them.
export const generateTubes = (numColors, numTubes, capacity, colors, shuffleDepth = 100) => {
  const selectedColors = colors.slice(0, numColors);
  let state = [];
  
  // 1. Solved state
  for (let i = 0; i < numColors; i++) {
    state.push(Array(capacity).fill(selectedColors[i]));
  }
  for (let i = numColors; i < numTubes; i++) {
    state.push([]);
  }

  // 2. Reverse Shuffle
  // A valid reverse move is taking the top ball of any tube and placing it into any non-full tube.
  // Wait, if we reverse a game, we are doing standard moves but without color restrictions.
  // But to avoid trivial puzzles, we should ensure the shuffle is thorough.
  for (let s = 0; s < shuffleDepth; s++) {
    // Pick a random non-empty tube
    const nonEmpty = state
      .map((t, idx) => ({ t, idx }))
      .filter((obj) => obj.t.length > 0);
      
    if (nonEmpty.length === 0) break;
    
    const fromIdx = nonEmpty[Math.floor(Math.random() * nonEmpty.length)].idx;
    
    // Pick a random non-full tube
    const nonFull = state
      .map((t, idx) => ({ t, idx }))
      .filter((obj) => obj.t.length < capacity && obj.idx !== fromIdx);
      
    if (nonFull.length === 0) continue;
    
    const toIdx = nonFull[Math.floor(Math.random() * nonFull.length)].idx;
    
    // Move ball
    const ball = state[fromIdx].pop();
    state[toIdx].push(ball);
  }

  // Ensure it's not solved initially (which might happen if shuffleDepth is too low or unlucky)
  if (isWin(state, capacity)) {
     return generateTubes(numColors, numTubes, capacity, colors, shuffleDepth + 20);
  }

  return state;
};
