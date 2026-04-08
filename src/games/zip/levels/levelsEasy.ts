import type { Level } from "../ZipTypes";

export const LEVELS_EASY: Level[] = [
  {
    id: 1,
    gridSize: 5,
    nodes: [
      { number: 1, position: { x: 1, y: 1 } },
      { number: 2, position: { x: 3, y: 1 } },
      { number: 3, position: { x: 3, y: 3 } },
    ],
    obstacles: [],
    themeId: 1,
  },
  {
    id: 2,
    gridSize: 5,
    nodes: [
      { number: 1, position: { x: 0, y: 0 } },
      { number: 2, position: { x: 4, y: 0 } },
      { number: 3, position: { x: 4, y: 4 } },
      { number: 4, position: { x: 0, y: 4 } },
    ],
    obstacles: [],
    themeId: 2,
  },
  {
    id: 3,
    gridSize: 5,
    nodes: [
      { number: 1, position: { x: 2, y: 0 } },
      { number: 2, position: { x: 0, y: 2 } },
      { number: 3, position: { x: 2, y: 4 } },
      { number: 4, position: { x: 4, y: 2 } },
    ],
    obstacles: [],
    themeId: 3,
  },
  {
    id: 4,
    gridSize: 5,
    nodes: [
      { number: 1, position: { x: 1, y: 1 } },
      { number: 2, position: { x: 1, y: 3 } },
      { number: 3, position: { x: 3, y: 3 } },
      { number: 4, position: { x: 3, y: 1 } },
    ],
    obstacles: [],
    themeId: 4,
  },
  {
    id: 5,
    gridSize: 5,
    nodes: [
      { number: 1, position: { x: 0, y: 2 } },
      { number: 2, position: { x: 2, y: 0 } },
      { number: 3, position: { x: 2, y: 4 } },
      { number: 4, position: { x: 4, y: 2 } },
    ],
    obstacles: [],
    themeId: 5,
  },
  {
    id: 6,
    gridSize: 6,
    nodes: [
      { number: 1, position: { x: 1, y: 1 } },
      { number: 2, position: { x: 4, y: 1 } },
      { number: 3, position: { x: 4, y: 4 } },
      { number: 4, position: { x: 1, y: 4 } },
      { number: 5, position: { x: 5, y: 5 } },
    ],
    obstacles: [],
    themeId: 6,
  },
  {
    id: 7,
    gridSize: 6,
    nodes: [
      { number: 1, position: { x: 0, y: 0 } },
      { number: 2, position: { x: 5, y: 0 } },
      { number: 3, position: { x: 5, y: 5 } },
      { number: 4, position: { x: 0, y: 5 } },
      { number: 5, position: { x: 2, y: 2 } },
    ],
    obstacles: [{ x: 3, y: 3 }],
    themeId: 7,
  },
  {
    id: 8,
    gridSize: 6,
    nodes: [
      { number: 1, position: { x: 1, y: 0 } },
      { number: 2, position: { x: 4, y: 0 } },
      { number: 3, position: { x: 4, y: 2 } },
      { number: 4, position: { x: 1, y: 2 } },
      { number: 5, position: { x: 2, y: 4 } },
    ],
    obstacles: [
      { x: 0, y: 4 },
      { x: 5, y: 4 },
    ],
    themeId: 8,
  },
  {
    id: 9,
    gridSize: 6,
    nodes: [
      { number: 1, position: { x: 2, y: 1 } },
      { number: 2, position: { x: 4, y: 1 } },
      { number: 3, position: { x: 4, y: 4 } },
      { number: 4, position: { x: 1, y: 4 } },
      { number: 5, position: { x: 1, y: 2 } },
    ],
    obstacles: [
      { x: 3, y: 2 },
      { x: 2, y: 3 },
    ],
    themeId: 9,
  },
  {
    id: 10,
    gridSize: 6,
    nodes: [
      { number: 1, position: { x: 0, y: 1 } },
      { number: 2, position: { x: 2, y: 0 } },
      { number: 3, position: { x: 4, y: 1 } },
      { number: 4, position: { x: 5, y: 3 } },
      { number: 5, position: { x: 3, y: 5 } },
    ],
    obstacles: [
      { x: 1, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
    ],
    themeId: 10,
  },
];
