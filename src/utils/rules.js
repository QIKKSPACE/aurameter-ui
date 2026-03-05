export const isWin = (tubes, capacity) =>
  tubes.every(
    (tube) =>
      tube.length === 0 ||
      (tube.length === capacity &&
        tube.every((ball) => ball === tube[0]))
  );

export const isTubeComplete = (tube, capacity) =>
  tube.length === capacity && tube.every((ball) => ball === tube[0]);
