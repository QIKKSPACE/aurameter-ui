import type { PathSegment, Point } from "../ZipTypes";
import { pointsEqual, isAdjacent } from "./pathValidation";

export const buildSafeSegment = (from: Point, to: Point): PathSegment[] => {
  if (pointsEqual(from, to)) {
    return [];
  }

  const segments: PathSegment[] = [];
  let currentPos = { ...from };

  const dx = to.x - from.x;
  const sx = dx === 0 ? 0 : dx > 0 ? 1 : -1;

  while (currentPos.x !== to.x) {
    const nextPos: Point = {
      x: currentPos.x + sx,
      y: currentPos.y,
    };

    const segmentDx = Math.abs(nextPos.x - currentPos.x);
    const segmentDy = Math.abs(nextPos.y - currentPos.y);
    if (segmentDx + segmentDy !== 1) {
      throw new Error(
        `🚨 CRITICAL: Generated invalid segment [${currentPos.x},${currentPos.y}]→[${nextPos.x},${nextPos.y}]`
      );
    }

    segments.push({ from: currentPos, to: nextPos });
    currentPos = nextPos;
  }

  const dy = to.y - from.y;
  const sy = dy === 0 ? 0 : dy > 0 ? 1 : -1;

  while (currentPos.y !== to.y) {
    const nextPos: Point = {
      x: currentPos.x,
      y: currentPos.y + sy,
    };

    const segmentDx = Math.abs(nextPos.x - currentPos.x);
    const segmentDy = Math.abs(nextPos.y - currentPos.y);
    if (segmentDx + segmentDy !== 1) {
      throw new Error(
        `🚨 CRITICAL: Generated invalid segment [${currentPos.x},${currentPos.y}]→[${nextPos.x},${nextPos.y}]`
      );
    }

    segments.push({ from: currentPos, to: nextPos });
    currentPos = nextPos;
  }

  if (!pointsEqual(currentPos, to)) {
    throw new Error(`🚨 CRITICAL: Failed to reach target [${to.x},${to.y}]`);
  }

  return segments;
};

export const getPathCells = (path: PathSegment[], gridSize: number): Set<string> => {
  const cells = new Set<string>();
  
  for (const segment of path) {
    if (pointsEqual(segment.from, segment.to)) {
      cells.add(`${segment.from.x},${segment.from.y}`);
      continue;
    }
    
    const { from, to } = segment;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    let x = from.x;
    let y = from.y;
    cells.add(`${x},${y}`);
    
    if (dx !== 0) {
      const sx = dx > 0 ? 1 : -1;
      for (let i = 0; i < Math.abs(dx); i++) {
        x += sx;
        cells.add(`${x},${y}`);
      }
    }
    
    if (dy !== 0) {
      const sy = dy > 0 ? 1 : -1;
      for (let i = 0; i < Math.abs(dy); i++) {
        y += sy;
        cells.add(`${x},${y}`);
      }
    }
  }
  
  return cells;
};

export const isCellVisited = (cell: Point, path: PathSegment[], gridSize: number): boolean => {
  const visitedCells = getPathCells(path, gridSize);
  return visitedCells.has(`${cell.x},${cell.y}`);
};

export const normalizePath = (path: PathSegment[]): PathSegment[] => {
  if (path.length === 0) return path;

  const normalizedSegments: PathSegment[] = [];

  for (const segment of path) {
    const { from, to } = segment;

    if (pointsEqual(from, to)) {
      continue;
    }

    if (isAdjacent(from, to)) {
      normalizedSegments.push(segment);
      continue;
    }

    const safeSegments = buildSafeSegment(from, to);
    normalizedSegments.push(...safeSegments);
  }

  for (const seg of normalizedSegments) {
    const dx = Math.abs(seg.to.x - seg.from.x);
    const dy = Math.abs(seg.to.y - seg.from.y);
    if (dx + dy !== 1) {
      throw new Error(
        `🚨 NORMALIZATION FAILED: Segment [${seg.from.x},${seg.from.y}]→[${seg.to.x},${seg.to.y}] is not 4-directional`
      );
    }
  }

  return normalizedSegments;
};

export const extendPath = (
  from: Point,
  to: Point,
  path: PathSegment[]
): PathSegment[] => {
  if (path.length === 0) return path;

  const lastSegment = path[path.length - 1];
  const currentEndPoint = lastSegment.to;
  
  if (pointsEqual(to, currentEndPoint)) return path;

  if (path.length > 1 && pointsEqual(to, path[path.length - 2].from)) {
    return path.slice(0, -1);
  }

  const visitedCells = getPathCells(path, path[0].from.x * 10);
  const destinationKey = `${to.x},${to.y}`;
  
  if (visitedCells.has(destinationKey)) {
    for (let i = path.length - 1; i >= 0; i--) {
      const segment = path[i];
      const dx = Math.abs(segment.to.x - segment.from.x);
      const dy = Math.abs(segment.to.y - segment.from.y);
      const sx = segment.from.x < segment.to.x ? 1 : -1;
      const sy = segment.from.y < segment.to.y ? 1 : -1;
      
      let x = segment.from.x;
      let y = segment.from.y;
      
      if (pointsEqual(to, segment.from)) {
        return path.slice(0, i);
      }
      
      if (dx > 0) {
        for (let j = 0; j <= dx; j++) {
          if (x === to.x && y === to.y && j < dx) {
            return path.slice(0, i);
          }
          x += sx;
        }
      } else if (dy > 0) {
        for (let j = 0; j <= dy; j++) {
          if (x === to.x && y === to.y && j < dy) {
            return path.slice(0, i);
          }
          y += sy;
        }
      }
    }
  }

  try {
    const safeSegments = buildSafeSegment(from, to);
    return [...path, ...safeSegments];
  } catch (error) {
    console.error("❌ Error in extendPath - buildSafeSegment failed:", error);
    return path;
  }
};
