export const generateTubes = (
  numColors,
  numTubes,
  capacity,
  colors
) => {
  const selected = colors.slice(0, numColors);

  // 1️⃣ Create all balls
  const balls = [];
  for (let c = 0; c < numColors; c++) {
    for (let i = 0; i < capacity; i++) {
      balls.push(selected[c]);
    }
  }

  // 2️⃣ Shuffle balls
  for (let i = balls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [balls[i], balls[j]] = [balls[j], balls[i]];
  }

  // 3️⃣ Fill ALL tubes randomly
  const tubes = Array.from({ length: numTubes }, () => []);

  let index = 0;
  while (index < balls.length) {
    const t = Math.floor(Math.random() * numTubes);
    if (tubes[t].length < capacity) {
      tubes[t].push(balls[index++]);
    }
  }

  // 4️⃣ Force exactly 2 empty tubes
  let emptied = 0;
  for (let i = 0; i < tubes.length && emptied < 2; i++) {
    if (tubes[i].length === 0) continue;

    while (tubes[i].length) {
      // move balls to other tubes
      for (let j = 0; j < tubes.length; j++) {
        if (i !== j && tubes[j].length < capacity) {
          tubes[j].push(tubes[i].pop());
          break;
        }
      }
    }
    emptied++;
  }

  // 5️⃣ Difficulty guards (anti-easy)
  const hasMixed = tubes.some(
    (t) => new Set(t).size > 1
  );

  const solvedTubeCount = tubes.filter(
    (t) =>
      t.length === capacity &&
      t.every((b) => b === t[0])
  ).length;

  if (!hasMixed || solvedTubeCount > 1) {
    return generateTubes(
      numColors,
      numTubes,
      capacity,
      colors
    );
  }

  return tubes;
};
