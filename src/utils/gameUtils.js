// gameUtils.js

export function canMoveBall(from, to, tubeHeight) {
  if (from.balls.length === 0) return false;
  if (to.balls.length >= tubeHeight) return false;

  const ball = from.balls[from.balls.length - 1];
  const topTo = to.balls[to.balls.length - 1];

  return !topTo || topTo === ball;
}

export function moveBall(state, fromIndex, toIndex, tubeHeight) {
  const from = state.tubes[fromIndex];
  const to = state.tubes[toIndex];

  if (!canMoveBall(from, to, tubeHeight)) return state;

  const ball = from.balls.pop();
  to.balls.push(ball);

  return {
    ...state,
    tubes: [...state.tubes],
    moves: state.moves + 1,
  };
}

export function isLevelComplete(state, tubeHeight) {
  return state.tubes.every(
    (tube) =>
      tube.balls.length === 0 ||
      (tube.balls.length === tubeHeight &&
        tube.balls.every((c) => c === tube.balls[0]))
  );
}
