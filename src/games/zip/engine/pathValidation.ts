import type { Node, Obstacle, PathSegment, Point } from "../ZipTypes";
import { getPathCells } from "./pathBuilder";

export const pointsEqual = (p1: Point, p2: Point): boolean => {
  return p1.x === p2.x && p1.y === p2.y;
};

export const isAdjacent = (p1: Point, p2: Point): boolean => {
  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

export const is4DirectionalSegment = (from: Point, to: Point): boolean => {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const is4Dir = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  
  return is4Dir;
};

export const assertStrictlyValid4DirectionalPath = (segments: PathSegment[], label: string = "path"): void => {
  if (!segments || segments.length === 0) return;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const dx = Math.abs(seg.to.x - seg.from.x);
    const dy = Math.abs(seg.to.y - seg.from.y);

    if (dx + dy !== 1) {
      throw new Error(
        `🚨 ASSERTION FAILED in ${label}:\n` +
        `  Segment ${i}: [${seg.from.x},${seg.from.y}] → [${seg.to.x},${seg.to.y}]\n` +
        `  Distance: dx=${dx}, dy=${dy} (INVALID: expected dx+dy=1)`
      );
    }

    if (pointsEqual(seg.from, seg.to)) {
      throw new Error(
        `🚨 ASSERTION FAILED in ${label}:\n` +
        `  Segment ${i} is zero-length: [${seg.from.x},${seg.from.y}] → [${seg.to.x},${seg.to.y}]`
      );
    }
  }
};

export const isValidPath = (segments: PathSegment[], label: string = "path"): boolean => {
  try {
    assertStrictlyValid4DirectionalPath(segments, label);
    return true;
  } catch (error) {
    return false;
  }
};

export const isObstacle = (point: Point, obstacles: Obstacle[]): boolean => {
  return obstacles.some((obs) => pointsEqual(point, obs));
};

export const isWithinBounds = (point: Point, gridSize: number): boolean => {
  return point.x >= 0 && point.x < gridSize && point.y >= 0 && point.y < gridSize;
};

export const connectToNode = (
  position: Point,
  targetNode: { position: Point },
  path: PathSegment[]
): boolean => {
  if (!path.length) return false;
  const lastSegment = path[path.length - 1];
  const endPoint = lastSegment.to;
  return isAdjacent(endPoint, targetNode.position);
};

export const validateMove = (
  from: Point,
  to: Point,
  gridSize: number,
  obstacles: Obstacle[],
  path: PathSegment[],
  currentNodeIndex: number,
  nodes: Node[]
): boolean => {
  if (!isWithinBounds(to, gridSize)) return false;
  if (isObstacle(to, obstacles)) return false;
  if (!isAdjacent(from, to)) return false;

  const visitedCells = getPathCells(path, gridSize);
  const cellKey = `${to.x},${to.y}`;
  
  if (path.length > 1) {
    const previousSegment = path[path.length - 2];
    if (pointsEqual(to, previousSegment.from)) return true;
  }
  
  if (visitedCells.has(cellKey)) return false;

  const destinationNode = nodes.find(n => pointsEqual(n.position, to));
  if (destinationNode) {
    if (destinationNode.number !== nodes[currentNodeIndex + 1]?.number) return false;
  }

  return true;
};
