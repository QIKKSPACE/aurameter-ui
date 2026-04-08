import type { Node, Obstacle, PathSegment } from "../ZipTypes";
import { pointsEqual } from "./pathValidation";
import { getPathCells } from "./pathBuilder";

export const detectCompletion = (
  path: PathSegment[],
  nodes: Node[],
  gridSize: number,
  obstacles: Obstacle[]
): boolean => {
  if (!path.length) return false;

  if (path.length < nodes.length - 1) {
    return false;
  }

  const lastNode = nodes[nodes.length - 1];
  const pathEndpoint = path[path.length - 1].to;
  
  if (!pointsEqual(pathEndpoint, lastNode.position)) {
    return false;
  }

  const totalCells = gridSize * gridSize;
  const obstacleCells = obstacles.length;
  const requiredCells = totalCells - obstacleCells;
  
  const pathCells = getPathCells(path, gridSize);
  
  if (pathCells.size < requiredCells) {
    return false;
  }

  return true;
};

export const validateSolution = (
  path: PathSegment[],
  nodes: Node[],
  gridSize: number,
  obstacles: Obstacle[]
): boolean => {
  if (!detectCompletion(path, nodes, gridSize, obstacles)) {
    return false;
  }

  let currentPoint = path[0].from;
  let nodeIndex = 0;

  for (const segment of path) {
    if (nodeIndex < nodes.length) {
      const node = nodes[nodeIndex];
      if (pointsEqual(currentPoint, node.position)) {
        nodeIndex++;
      }
    }
    currentPoint = segment.to;
  }

  return nodeIndex === nodes.length;
};

export const getNextNode = (currentNodeIndex: number, nodes: Node[]): Node | null => {
  if (currentNodeIndex + 1 < nodes.length) {
    return nodes[currentNodeIndex + 1];
  }
  return null;
};
