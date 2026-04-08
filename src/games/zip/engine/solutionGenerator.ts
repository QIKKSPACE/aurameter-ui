import type { Node, Obstacle, PathSegment, Point } from "../ZipTypes";
import { pointsEqual, isObstacle, isWithinBounds } from "./pathValidation";
import { getPathCells } from "./pathBuilder";

const solutionCache = new Map<number, Point[]>();
const MAX_ITERATIONS = 50000;

export const generateLevelSolution = (
  gridSize: number,
  nodes: Node[],
  obstacles: Obstacle[]
): Point[] | null => {
  if (nodes.length === 0) return null;

  const targetCells = gridSize * gridSize - obstacles.length;
  let iterationCount = 0;

  const nodePathSegments: Set<string>[] = [];
  let currentPos = nodes[0].position;
  nodePathSegments.push(new Set([`${currentPos.x},${currentPos.y}`]));

  for (let n = 1; n < nodes.length; n++) {
    const targetNode = nodes[n];
    const visited = new Set<string>();
    const queue: Array<{ pos: Point; path: Point[] }> = [{ pos: currentPos, path: [currentPos] }];
    let foundPath: Point[] | null = null;

    while (queue.length > 0 && !foundPath) {
      const { pos, path } = queue.shift()!;
      const key = `${pos.x},${pos.y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);

      if (pointsEqual(pos, targetNode.position)) {
        foundPath = path;
        break;
      }

      const dirs = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
      for (const dir of dirs) {
        const nextPos = { x: pos.x + dir.x, y: pos.y + dir.y };
        const nextKey = `${nextPos.x},${nextPos.y}`;

        if (
          isWithinBounds(nextPos, gridSize) &&
          !isObstacle(nextPos, obstacles) &&
          !visited.has(nextKey)
        ) {
          queue.push({ pos: nextPos, path: [...path, nextPos] });
        }
      }
    }

    if (!foundPath) {
      return null;
    }

    for (const cell of foundPath) {
      nodePathSegments[n] = nodePathSegments[n] || new Set();
      nodePathSegments[n].add(`${cell.x},${cell.y}`);
    }

    currentPos = targetNode.position;
  }

  const visited = new Set<string>();
  const solution: Point[] = [];

  const dfs = (currentPos: Point, nodeIndex: number): boolean => {
    iterationCount++;
    
    if (iterationCount > MAX_ITERATIONS) {
      return false;
    }

    const lastNode = nodes[nodes.length - 1];
    if (nodeIndex === nodes.length && visited.size === targetCells && pointsEqual(currentPos, lastNode.position)) {
      return true;
    }

    const directions = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];

    for (const dir of directions) {
      const nextPos = { x: currentPos.x + dir.x, y: currentPos.y + dir.y };
      const key = `${nextPos.x},${nextPos.y}`;

      if (
        isWithinBounds(nextPos, gridSize) &&
        !isObstacle(nextPos, obstacles) &&
        !visited.has(key)
      ) {
        visited.add(key);
        solution.push(nextPos);

        let newNodeIndex = nodeIndex;
        if (nodeIndex < nodes.length && pointsEqual(nextPos, nodes[nodeIndex].position)) {
          newNodeIndex = nodeIndex + 1;
        }

        if (dfs(nextPos, newNodeIndex)) {
          return true;
        }

        visited.delete(key);
        solution.pop();
      }
    }

    return false;
  };

  visited.add(`${nodes[0].position.x},${nodes[0].position.y}`);
  solution.push(nodes[0].position);

  if (dfs(nodes[0].position, 1)) {
    return solution;
  }

  return null;
};

export const getLevelSolution = (
  levelId: number,
  gridSize: number,
  nodes: Node[],
  obstacles: Obstacle[]
): Point[] | null => {
  if (solutionCache.has(levelId)) {
    return solutionCache.get(levelId) || null;
  }

  const solution = generateLevelSolution(gridSize, nodes, obstacles);
  solutionCache.set(levelId, solution || []);
  return solution;
};

export const getSmartHint = (
  currentPath: PathSegment[],
  solution: Point[] | null,
  nodes: Node[]
): PathSegment[] => {
  if (!solution || solution.length < 2) return [];

  const currentPoints: Point[] = [];
  if (currentPath.length > 0) {
    currentPath.forEach((seg) => {
      currentPoints.push(seg.from);
    });
    const lastSeg = currentPath[currentPath.length - 1];
    currentPoints.push(lastSeg.to);
  }

  let divergeIndex = 0;
  for (let i = 0; i < currentPoints.length && i < solution.length; i++) {
    if (!pointsEqual(currentPoints[i], solution[i])) {
      divergeIndex = i;
      break;
    }
    divergeIndex = i + 1;
  }

  const hintLength = Math.min(5, solution.length - divergeIndex);
  if (hintLength <= 0) return [];

  const hintPoints = solution.slice(divergeIndex, divergeIndex + hintLength);
  const hintSegments: PathSegment[] = [];

  for (let i = 0; i < hintPoints.length - 1; i++) {
    hintSegments.push({
      from: hintPoints[i],
      to: hintPoints[i + 1],
    });
  }

  return hintSegments;
};

export const calculateHintPath = (
  currentPos: Point,
  path: PathSegment[],
  nodes: Node[],
  currentNodeIndex: number,
  gridSize: number,
  obstacles: Obstacle[]
): PathSegment[] => {
  const visitedCells = getPathCells(path, gridSize);
  const hintSteps: PathSegment[] = [];
  const MAX_HINT_STEPS = 5;
  
  let currentCell = currentPos;
  
  if (currentNodeIndex + 1 < nodes.length) {
    const targetNode = nodes[currentNodeIndex + 1];
    const targetPos = targetNode.position;
    
    const queue: Array<{ cell: Point; steps: PathSegment[] }> = [
      { cell: currentCell, steps: [] }
    ];
    const visited = new Set<string>();
    visited.add(`${currentCell.x},${currentCell.y}`);
    
    while (queue.length > 0 && hintSteps.length === 0) {
      const { cell, steps } = queue.shift()!;
      
      if (pointsEqual(cell, targetPos)) {
        return steps.slice(0, MAX_HINT_STEPS);
      }
      
      const neighbors = [
        { x: cell.x - 1, y: cell.y },
        { x: cell.x + 1, y: cell.y },
        { x: cell.x, y: cell.y - 1 },
        { x: cell.x, y: cell.y + 1 },
      ];
      
      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        
        if (visited.has(key) || !isWithinBounds(neighbor, gridSize) || isObstacle(neighbor, obstacles)) {
          continue;
        }
        
        if (path.length > 0 && path[path.length - 2] && pointsEqual(neighbor, path[path.length - 2].from)) {
          visited.add(key);
          const newSteps = [...steps, { from: cell, to: neighbor }];
          queue.push({ cell: neighbor, steps: newSteps });
        } else if (!visitedCells.has(key)) {
          visited.add(key);
          const newSteps = [...steps, { from: cell, to: neighbor }];
          queue.push({ cell: neighbor, steps: newSteps });
        }
      }
    }
  } else {
    const directions = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];
    
    for (const dir of directions) {
      const nextCell = { x: currentCell.x + dir.x, y: currentCell.y + dir.y };
      const key = `${nextCell.x},${nextCell.y}`;
      
      if (
        isWithinBounds(nextCell, gridSize) &&
        !isObstacle(nextCell, obstacles) &&
        !visitedCells.has(key)
      ) {
        return [{ from: currentCell, to: nextCell }];
      }
    }
  }
  
  return hintSteps;
};

export const calculateHint = (
  currentPos: Point,
  path: PathSegment[],
  nodes: Node[],
  currentNodeIndex: number,
  gridSize: number,
  obstacles: Obstacle[]
): Point | null => {
  if (!path.length) {
    return nodes[0].position;
  }

  if (currentNodeIndex + 1 < nodes.length) {
    const nextNode = nodes[currentNodeIndex + 1];
    return nextNode.position;
  }

  const pathCells = getPathCells(path, gridSize);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cellKey = `${x},${y}`;
      if (!pathCells.has(cellKey) && !isObstacle({ x, y }, obstacles)) {
        const neighbors = [
          { x: x - 1, y },
          { x: x + 1, y },
          { x, y: y - 1 },
          { x, y: y + 1 },
        ];
        for (const neighbor of neighbors) {
          if (pathCells.has(`${neighbor.x},${neighbor.y}`)) {
            return { x, y };
          }
        }
      }
    }
  }

  return null;
};
