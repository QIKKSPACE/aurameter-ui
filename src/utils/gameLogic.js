
export const DEFAULT_CAPACITY = 4;

export function generateLevel(levelIndex) {
  // Level design: start at 3 colors + 2 empty tubes, then ramp up.
  const colorsCount = Math.min(10, 3 + levelIndex); // cap at 10 unique colors
  const emptyTubes = 2; // always give 2 empties for solvability/quality of life
  const capacity = DEFAULT_CAPACITY;
  const tubesCount = colorsCount + emptyTubes;

  const palette = getPastelPalette();
  const colors = Array.from({ length: colorsCount }, (_, i) => palette[i % palette.length]);

  const tubes = Array.from({ length: tubesCount }, () => []);
  const pool = [];
  colors.forEach((c) => {
    for (let i = 0; i < capacity; i++) pool.push(c);
  });

  // Shuffle the pool and fill the first N tubes fully, keep last two empty
  shuffleInPlace(pool);
  let pi = 0;
  for (let t = 0; t < tubesCount - emptyTubes; t++) {
    for (let k = 0; k < capacity; k++) {
      tubes[t].push(pool[pi++]);
    }
  }

  // Ensure not pre-solved: if a tube ends up uniform, reshuffle lightly
  if (tubes.some(isUniformFull)) {
    return generateLevel(levelIndex); // regenerate (rare in practice)
  }

  return {
    capacity,
    tubes,
  };
}

export function canMove(state, fromIndex, toIndex) {
  if (fromIndex === toIndex) return false;
  const { tubes, capacity } = state;
  const from = tubes[fromIndex];
  const to = tubes[toIndex];
  if (!from || !to) return false;
  if (from.length === 0) return false; // nothing to move
  if (to.length >= capacity) return false; // destination full

  const ball = from[from.length - 1];
  if (to.length === 0) return true; // can move onto empty tube
  const topDest = to[to.length - 1];
  return ball === topDest; // must match color
}

export function applyMove(state, fromIndex, toIndex) {
  if (!canMove(state, fromIndex, toIndex)) return state;
  const next = cloneState(state);
  const ball = next.tubes[fromIndex].pop();
  next.tubes[toIndex].push(ball);
  return next;
}

export function isUniformFull(tube, capacity = DEFAULT_CAPACITY) {
  if (tube.length !== capacity) return false;
  return tube.every((c) => c === tube[0]);
}

export function isSolved(state) {
  const { tubes, capacity } = state;
  return tubes.every((tube) => tube.length === 0 || isUniformFull(tube, capacity));
}

export function getPastelPalette() {
  // Gentle pastels
  return [
    '#F8BBD0', // pink
    '#B3E5FC', // light blue
    '#C8E6C9', // light green
    '#FFE0B2', // peach
    '#D1C4E9', // lavender
    '#FFCCBC', // coral
    '#DCEDC8', // lime
    '#BBDEFB', // baby blue
    '#E1BEE7', // lilac
    '#FFF9C4', // soft yellow
  ];
}

export function cloneState(state) {
  return {
    capacity: state.capacity,
    tubes: state.tubes.map((t) => t.slice()),
  };
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}