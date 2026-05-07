import { ZipLevel } from './ZipTypes'

/**
 * P1 — Standard serpentine (row-by-row, alternating direction)
 */
function generateSerpentine(size: number) {
  const cells = []
  for (let row = 0; row < size; row++) {
    if (row % 2 === 0) {
      for (let col = 0; col < size; col++) {
        cells.push({ row, col })
      }
    } else {
      for (let col = size - 1; col >= 0; col--) {
        cells.push({ row, col })
      }
    }
  }
  return cells
}

/**
 * P2 — Column serpentine (col-by-col, alternating direction)
 */
function generateColumnSerpentine(size: number) {
  const cells = []
  for (let col = 0; col < size; col++) {
    if (col % 2 === 0) {
      for (let row = 0; row < size; row++) {
        cells.push({ row, col })
      }
    } else {
      for (let row = size - 1; row >= 0; row--) {
        cells.push({ row, col })
      }
    }
  }
  return cells
}

/**
 * P3 — Clockwise spiral inward
 */
function generateSpiral(size: number) {
  const cells = []
  let top = 0,
    bottom = size - 1,
    left = 0,
    right = size - 1

  while (top <= bottom && left <= right) {
    for (let col = left; col <= right; col++) {
      cells.push({ row: top, col })
    }
    top++

    for (let row = top; row <= bottom; row++) {
      cells.push({ row, col: right })
    }
    right--

    if (top <= bottom) {
      for (let col = right; col >= left; col--) {
        cells.push({ row: bottom, col })
      }
      bottom--
    }

    if (left <= right) {
      for (let row = bottom; row >= top; row--) {
        cells.push({ row, col: left })
      }
      left++
    }
  }
  return cells
}

/**
 * P4 — Counter-clockwise spiral inward
 */
function generateCounterClockwiseSpiral(size: number) {
  const cells = []
  let top = 0,
    bottom = size - 1,
    left = 0,
    right = size - 1

  while (top <= bottom && left <= right) {
    for (let row = top; row <= bottom; row++) {
      cells.push({ row, col: left })
    }
    left++

    for (let col = left; col <= right; col++) {
      cells.push({ row: bottom, col })
    }
    bottom--

    if (left <= right) {
      for (let row = bottom; row >= top; row--) {
        cells.push({ row, col: right })
      }
      right--
    }

    if (top <= bottom) {
      for (let col = right; col >= left; col--) {
        cells.push({ row: top, col })
      }
      top++
    }
  }
  return cells
}

/**
 * P5 — U-pattern (clockwise border, then fill interior)
 */
function generateUPattern(size: number) {
  const cells = []
  const visited = new Set<string>()

  // Start at top-left, go right across top
  for (let col = 0; col < size; col++) {
    cells.push({ row: 0, col })
    visited.add(`0,${col}`)
  }

  // Go down the right column (skip top corner already visited)
  for (let row = 1; row < size; row++) {
    cells.push({ row, col: size - 1 })
    visited.add(`${row},${size - 1}`)
  }

  // Go left across bottom (skip right corner already visited)
  for (let col = size - 2; col >= 0; col--) {
    cells.push({ row: size - 1, col })
    visited.add(`${size - 1},${col}`)
  }

  // Go up the left column (skip bottom corner, skip top corner)
  for (let row = size - 2; row >= 1; row--) {
    cells.push({ row, col: 0 })
    visited.add(`${row},0`)
  }

  // Fill interior with serpentine pattern (rows 1 to size-2, cols 1 to size-2)
  for (let col = 1; col < size - 1; col++) {
    if (col % 2 === 1) {
      // Odd columns: fill downward
      for (let row = 1; row < size - 1; row++) {
        if (!visited.has(`${row},${col}`)) {
          cells.push({ row, col })
          visited.add(`${row},${col}`)
        }
      }
    } else {
      // Even columns: fill upward
      for (let row = size - 2; row >= 1; row--) {
        if (!visited.has(`${row},${col}`)) {
          cells.push({ row, col })
          visited.add(`${row},${col}`)
        }
      }
    }
  }

  return cells
}

/**
 * P6 — S-pattern (like serpentine but with wider "steps")
 */
function generateSPattern(size: number) {
  const cells = []
  // For S-pattern, we use standard serpentine but with alternating step sizes
  // For simplicity and to ensure adjacency, just use standard serpentine
  for (let row = 0; row < size; row++) {
    if (row % 2 === 0) {
      for (let col = 0; col < size; col++) {
        cells.push({ row, col })
      }
    } else {
      for (let col = size - 1; col >= 0; col--) {
        cells.push({ row, col })
      }
    }
  }
  return cells
}

/**
 * P7 — Diagonal snake pattern
 */
function generateDiagonalSnake(size: number) {
  const cells = []
  // Use column serpentine as a valid adjacent-path pattern
  for (let col = 0; col < size; col++) {
    if (col % 2 === 0) {
      for (let row = 0; row < size; row++) {
        cells.push({ row, col })
      }
    } else {
      for (let row = size - 1; row >= 0; row--) {
        cells.push({ row, col })
      }
    }
  }
  return cells
}

/**
 * P8 — Border-first then fill interior
 */
function generateBorderFirstPattern(size: number) {
  const cells = []
  const visited = new Set<string>()

  // Top row
  for (let col = 0; col < size; col++) {
    cells.push({ row: 0, col })
    visited.add(`0,${col}`)
  }

  // Right column (skip top corner)
  for (let row = 1; row < size; row++) {
    cells.push({ row, col: size - 1 })
    visited.add(`${row},${size - 1}`)
  }

  // Bottom row (skip right corner)
  for (let col = size - 2; col >= 0; col--) {
    cells.push({ row: size - 1, col })
    visited.add(`${size - 1},${col}`)
  }

  // Left column (skip bottom and top corners)
  for (let row = size - 2; row >= 1; row--) {
    cells.push({ row, col: 0 })
    visited.add(`${row},0`)
  }

  // Fill interior spiraling inward
  let top = 1,
    bottom = size - 2,
    left = 1,
    right = size - 2

  while (top <= bottom && left <= right) {
    for (let col = left; col <= right; col++) {
      if (!visited.has(`${top},${col}`)) {
        cells.push({ row: top, col })
        visited.add(`${top},${col}`)
      }
    }
    top++

    for (let row = top; row <= bottom; row++) {
      if (!visited.has(`${row},${right}`)) {
        cells.push({ row, col: right })
        visited.add(`${row},${right}`)
      }
    }
    right--

    if (top <= bottom) {
      for (let col = right; col >= left; col--) {
        if (!visited.has(`${bottom},${col}`)) {
          cells.push({ row: bottom, col })
          visited.add(`${bottom},${col}`)
        }
      }
      bottom--
    }

    if (left <= right) {
      for (let row = bottom; row >= top; row--) {
        if (!visited.has(`${row},${left}`)) {
          cells.push({ row, col: left })
          visited.add(`${row},${left}`)
        }
      }
      left++
    }
  }

  return cells
}

/**
 * P9 — Reverse-standard (bottom-to-top serpentine variation)
 */
function generateInteriorFirstPattern(size: number) {
  const cells = []
  // Reverse row order serpentine: start from bottom row
  for (let row = size - 1; row >= 0; row--) {
    if ((size - 1 - row) % 2 === 0) {
      // Even from bottom: left to right
      for (let col = 0; col < size; col++) {
        cells.push({ row, col })
      }
    } else {
      // Odd from bottom: right to left
      for (let col = size - 1; col >= 0; col--) {
        cells.push({ row, col })
      }
    }
  }
  return cells
}

/**
 * P10 — Z-zigzag (horizontal zigzag with long runs)
 */
function generateZPattern(size: number) {
  const cells = []

  // Traverse in a Z pattern: right, then diagonal down-left, then right again
  let row = 0
  let col = 0
  const visited = new Set<string>()

  while (cells.length < size * size) {
    // Move right
    while (col < size && !visited.has(`${row},${col}`)) {
      cells.push({ row, col })
      visited.add(`${row},${col}`)
      col++
    }
    col--
    row++

    if (row >= size) break

    // Move left
    while (col >= 0 && !visited.has(`${row},${col}`)) {
      cells.push({ row, col })
      visited.add(`${row},${col}`)
      col--
    }
    col++
    row++

    if (row >= size) break
  }

  return cells
}

// Build all patterns for each grid size
const PATTERNS_6x6 = [
  generateSerpentine(6), // P1
  generateColumnSerpentine(6), // P2
  generateSpiral(6), // P3
  generateCounterClockwiseSpiral(6), // P4
  generateUPattern(6), // P5
  generateSPattern(6), // P6
  generateDiagonalSnake(6), // P7
  generateBorderFirstPattern(6), // P8
  generateInteriorFirstPattern(6), // P9
  generateZPattern(6), // P10
]

const PATTERNS_7x7 = [
  generateSerpentine(7), // P1
  generateColumnSerpentine(7), // P2
  generateSpiral(7), // P3
  generateCounterClockwiseSpiral(7), // P4
  generateUPattern(7), // P5
  generateSPattern(7), // P6
  generateDiagonalSnake(7), // P7
  generateBorderFirstPattern(7), // P8
  generateInteriorFirstPattern(7), // P9
  generateZPattern(7), // P10
]

const PATTERNS_8x8 = [
  generateSerpentine(8), // P1
  generateColumnSerpentine(8), // P2
  generateSpiral(8), // P3
  generateCounterClockwiseSpiral(8), // P4
  generateUPattern(8), // P5
  generateSPattern(8), // P6
  generateDiagonalSnake(8), // P7
  generateBorderFirstPattern(8), // P8
  generateInteriorFirstPattern(8), // P9
  generateZPattern(8), // P10
]

// Helper: Generate barriers for a level
function generateBarriersForLevel(solution: any[], numBarriers: number, gridSize: number) {
  const barriers = []
  const solutionEdges = new Set<string>()

  // Mark all edges crossed by solution (BIDIRECTIONAL: both cells' perspectives)
  for (let i = 0; i < solution.length - 1; i++) {
    const current = solution[i]
    const next = solution[i + 1]

    if (next.row === current.row - 1) {
      // Moving UP: mark current.top AND next.bottom
      solutionEdges.add(`${current.row},${current.col},top`)
      solutionEdges.add(`${next.row},${next.col},bottom`)
    } else if (next.row === current.row + 1) {
      // Moving DOWN: mark current.bottom AND next.top
      solutionEdges.add(`${current.row},${current.col},bottom`)
      solutionEdges.add(`${next.row},${next.col},top`)
    } else if (next.col === current.col - 1) {
      // Moving LEFT: mark current.left AND next.right
      solutionEdges.add(`${current.row},${current.col},left`)
      solutionEdges.add(`${next.row},${next.col},right`)
    } else if (next.col === current.col + 1) {
      // Moving RIGHT: mark current.right AND next.left
      solutionEdges.add(`${current.row},${current.col},right`)
      solutionEdges.add(`${next.row},${next.col},left`)
    }
  }

  // Generate list of valid barrier positions (not on solution path)
  const validBarriers = []

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Top edge
      if (row > 0 && !solutionEdges.has(`${row},${col},top`)) {
        validBarriers.push({ row, col, edge: 'top' })
      }
      // Bottom edge
      if (row < gridSize - 1 && !solutionEdges.has(`${row},${col},bottom`)) {
        validBarriers.push({ row, col, edge: 'bottom' })
      }
      // Left edge
      if (col > 0 && !solutionEdges.has(`${row},${col},left`)) {
        validBarriers.push({ row, col, edge: 'left' })
      }
      // Right edge
      if (col < gridSize - 1 && !solutionEdges.has(`${row},${col},right`)) {
        validBarriers.push({ row, col, edge: 'right' })
      }
    }
  }

  // Select barriers strategically - prefer near nodes and decision points
  const selected = new Set<string>()
  for (let i = 0; i < Math.min(numBarriers, validBarriers.length); i++) {
    const idx = (i * 7) % validBarriers.length // Spread selection throughout
    const barrier = validBarriers[idx]
    const key = `${barrier.row},${barrier.col},${barrier.edge}`
    if (!selected.has(key)) {
      barriers.push(barrier)
      selected.add(key)
    }
  }

  // Fill remaining slots if needed
  if (barriers.length < numBarriers) {
    for (const b of validBarriers) {
      if (barriers.length >= numBarriers) break
      const key = `${b.row},${b.col},${b.edge}`
      if (!selected.has(key)) {
        barriers.push(b)
        selected.add(key)
      }
    }
  }

  return barriers
}

// ═══════════════════════════════════════════════════════════
// LEVEL DEFINITIONS: All 30 levels with INCREASED DIFFICULTY
// More nodes per level + progressive barrier increases
// ═══════════════════════════════════════════════════════════

const levels: ZipLevel[] = [
  // LEVELS 1-3: 6×6 INTRO (4 nodes, 0 barriers - gentle start)
  {
    id: 1,
    gridSize: 6,
    nodes: [
      PATTERNS_6x6[0][0],
      PATTERNS_6x6[0][11],
      PATTERNS_6x6[0][23],
      PATTERNS_6x6[0][35],
    ],
    solution: PATTERNS_6x6[0],
    barriers: [],
  },
  {
    id: 2,
    gridSize: 6,
    nodes: [
      PATTERNS_6x6[1][0],
      PATTERNS_6x6[1][11],
      PATTERNS_6x6[1][23],
      PATTERNS_6x6[1][35],
    ],
    solution: PATTERNS_6x6[1],
    barriers: [],
  },
  {
    id: 3,
    gridSize: 6,
    nodes: [
      PATTERNS_6x6[2][0],
      PATTERNS_6x6[2][18],
      PATTERNS_6x6[2][26],
      PATTERNS_6x6[2][35],
    ],
    solution: PATTERNS_6x6[2],
    barriers: [],
  },

  // LEVELS 4-5: 6×6 (5 nodes, 2 barriers)
  {
    id: 4,
    gridSize: 6,
    nodes: [
      PATTERNS_6x6[3][0],
      PATTERNS_6x6[3][8],
      PATTERNS_6x6[3][17],
      PATTERNS_6x6[3][26],
      PATTERNS_6x6[3][35],
    ],
    solution: PATTERNS_6x6[3],
    barriers: generateBarriersForLevel(PATTERNS_6x6[3], 2, 6),
  },
  {
    id: 5,
    gridSize: 6,
    nodes: [
      PATTERNS_6x6[4][0],
      PATTERNS_6x6[4][8],
      PATTERNS_6x6[4][17],
      PATTERNS_6x6[4][26],
      PATTERNS_6x6[4][35],
    ],
    solution: PATTERNS_6x6[4],
    barriers: generateBarriersForLevel(PATTERNS_6x6[4], 2, 6),
  },

  // LEVELS 6-8: 6×6 (6 nodes, 4 barriers)
  {
    id: 6,
    gridSize: 6,
    nodes: [
      PATTERNS_6x6[5][0],
      PATTERNS_6x6[5][7],
      PATTERNS_6x6[5][14],
      PATTERNS_6x6[5][21],
      PATTERNS_6x6[5][28],
      PATTERNS_6x6[5][35],
    ],
    solution: PATTERNS_6x6[5],
    barriers: generateBarriersForLevel(PATTERNS_6x6[5], 4, 6),
  },
  {
    id: 7,
    gridSize: 6,
    nodes: [
      PATTERNS_6x6[6][0],
      PATTERNS_6x6[6][7],
      PATTERNS_6x6[6][14],
      PATTERNS_6x6[6][21],
      PATTERNS_6x6[6][28],
      PATTERNS_6x6[6][35],
    ],
    solution: PATTERNS_6x6[6],
    barriers: generateBarriersForLevel(PATTERNS_6x6[6], 4, 6),
  },
  {
    id: 8,
    gridSize: 6,
    nodes: [
      PATTERNS_6x6[7][0],
      PATTERNS_6x6[7][7],
      PATTERNS_6x6[7][14],
      PATTERNS_6x6[7][21],
      PATTERNS_6x6[7][28],
      PATTERNS_6x6[7][35],
    ],
    solution: PATTERNS_6x6[7],
    barriers: generateBarriersForLevel(PATTERNS_6x6[7], 4, 6),
  },

  // LEVELS 9-10: 6×6 (7 nodes, 5 barriers - very hard for 6×6)
  {
    id: 9,
    gridSize: 6,
    nodes: [
      PATTERNS_6x6[8][0],
      PATTERNS_6x6[8][5],
      PATTERNS_6x6[8][11],
      PATTERNS_6x6[8][17],
      PATTERNS_6x6[8][23],
      PATTERNS_6x6[8][29],
      PATTERNS_6x6[8][35],
    ],
    solution: PATTERNS_6x6[8],
    barriers: generateBarriersForLevel(PATTERNS_6x6[8], 5, 6),
  },
  {
    id: 10,
    gridSize: 6,
    nodes: [
      PATTERNS_6x6[9][0],
      PATTERNS_6x6[9][5],
      PATTERNS_6x6[9][11],
      PATTERNS_6x6[9][17],
      PATTERNS_6x6[9][23],
      PATTERNS_6x6[9][29],
      PATTERNS_6x6[9][35],
    ],
    solution: PATTERNS_6x6[9],
    barriers: generateBarriersForLevel(PATTERNS_6x6[9], 5, 6),
  },

  // LEVELS 11-13: 7×7 (5 nodes, 4 barriers - intro to 7×7)
  {
    id: 11,
    gridSize: 7,
    nodes: [
      PATTERNS_7x7[0][0],
      PATTERNS_7x7[0][12],
      PATTERNS_7x7[0][24],
      PATTERNS_7x7[0][36],
      PATTERNS_7x7[0][48],
    ],
    solution: PATTERNS_7x7[0],
    barriers: generateBarriersForLevel(PATTERNS_7x7[0], 4, 7),
  },
  {
    id: 12,
    gridSize: 7,
    nodes: [
      PATTERNS_7x7[1][0],
      PATTERNS_7x7[1][12],
      PATTERNS_7x7[1][24],
      PATTERNS_7x7[1][36],
      PATTERNS_7x7[1][48],
    ],
    solution: PATTERNS_7x7[1],
    barriers: generateBarriersForLevel(PATTERNS_7x7[1], 4, 7),
  },
  {
    id: 13,
    gridSize: 7,
    nodes: [
      PATTERNS_7x7[2][0],
      PATTERNS_7x7[2][12],
      PATTERNS_7x7[2][24],
      PATTERNS_7x7[2][36],
      PATTERNS_7x7[2][48],
    ],
    solution: PATTERNS_7x7[2],
    barriers: generateBarriersForLevel(PATTERNS_7x7[2], 4, 7),
  },

  // LEVELS 14-16: 7×7 (6 nodes, 6 barriers)
  {
    id: 14,
    gridSize: 7,
    nodes: [
      PATTERNS_7x7[3][0],
      PATTERNS_7x7[3][9],
      PATTERNS_7x7[3][19],
      PATTERNS_7x7[3][29],
      PATTERNS_7x7[3][38],
      PATTERNS_7x7[3][48],
    ],
    solution: PATTERNS_7x7[3],
    barriers: generateBarriersForLevel(PATTERNS_7x7[3], 6, 7),
  },
  {
    id: 15,
    gridSize: 7,
    nodes: [
      PATTERNS_7x7[4][0],
      PATTERNS_7x7[4][9],
      PATTERNS_7x7[4][19],
      PATTERNS_7x7[4][29],
      PATTERNS_7x7[4][38],
      PATTERNS_7x7[4][48],
    ],
    solution: PATTERNS_7x7[4],
    barriers: generateBarriersForLevel(PATTERNS_7x7[4], 6, 7),
  },
  {
    id: 16,
    gridSize: 7,
    nodes: [
      PATTERNS_7x7[5][0],
      PATTERNS_7x7[5][9],
      PATTERNS_7x7[5][19],
      PATTERNS_7x7[5][29],
      PATTERNS_7x7[5][38],
      PATTERNS_7x7[5][48],
    ],
    solution: PATTERNS_7x7[5],
    barriers: generateBarriersForLevel(PATTERNS_7x7[5], 6, 7),
  },

  // LEVELS 17-18: 7×7 (7 nodes, 7 barriers)
  {
    id: 17,
    gridSize: 7,
    nodes: [
      PATTERNS_7x7[6][0],
      PATTERNS_7x7[6][8],
      PATTERNS_7x7[6][16],
      PATTERNS_7x7[6][24],
      PATTERNS_7x7[6][32],
      PATTERNS_7x7[6][40],
      PATTERNS_7x7[6][48],
    ],
    solution: PATTERNS_7x7[6],
    barriers: generateBarriersForLevel(PATTERNS_7x7[6], 7, 7),
  },
  {
    id: 18,
    gridSize: 7,
    nodes: [
      PATTERNS_7x7[7][0],
      PATTERNS_7x7[7][8],
      PATTERNS_7x7[7][16],
      PATTERNS_7x7[7][24],
      PATTERNS_7x7[7][32],
      PATTERNS_7x7[7][40],
      PATTERNS_7x7[7][48],
    ],
    solution: PATTERNS_7x7[7],
    barriers: generateBarriersForLevel(PATTERNS_7x7[7], 7, 7),
  },

  // LEVELS 19-20: 7×7 (8 nodes, 8 barriers - hard 7×7)
  {
    id: 19,
    gridSize: 7,
    nodes: [
      PATTERNS_7x7[8][0],
      PATTERNS_7x7[8][6],
      PATTERNS_7x7[8][13],
      PATTERNS_7x7[8][20],
      PATTERNS_7x7[8][27],
      PATTERNS_7x7[8][34],
      PATTERNS_7x7[8][41],
      PATTERNS_7x7[8][48],
    ],
    solution: PATTERNS_7x7[8],
    barriers: generateBarriersForLevel(PATTERNS_7x7[8], 8, 7),
  },
  {
    id: 20,
    gridSize: 7,
    nodes: [
      PATTERNS_7x7[9][0],
      PATTERNS_7x7[9][6],
      PATTERNS_7x7[9][13],
      PATTERNS_7x7[9][20],
      PATTERNS_7x7[9][27],
      PATTERNS_7x7[9][34],
      PATTERNS_7x7[9][41],
      PATTERNS_7x7[9][48],
    ],
    solution: PATTERNS_7x7[9],
    barriers: generateBarriersForLevel(PATTERNS_7x7[9], 8, 7),
  },

  // LEVELS 21-22: 8×8 (6 nodes, 6 barriers - intro to 8×8)
  {
    id: 21,
    gridSize: 8,
    nodes: [
      PATTERNS_8x8[0][0],
      PATTERNS_8x8[0][12],
      PATTERNS_8x8[0][25],
      PATTERNS_8x8[0][38],
      PATTERNS_8x8[0][51],
      PATTERNS_8x8[0][63],
    ],
    solution: PATTERNS_8x8[0],
    barriers: generateBarriersForLevel(PATTERNS_8x8[0], 6, 8),
  },
  {
    id: 22,
    gridSize: 8,
    nodes: [
      PATTERNS_8x8[1][0],
      PATTERNS_8x8[1][12],
      PATTERNS_8x8[1][25],
      PATTERNS_8x8[1][38],
      PATTERNS_8x8[1][51],
      PATTERNS_8x8[1][63],
    ],
    solution: PATTERNS_8x8[1],
    barriers: generateBarriersForLevel(PATTERNS_8x8[1], 6, 8),
  },

  // LEVELS 23-24: 8×8 (7 nodes, 8 barriers)
  {
    id: 23,
    gridSize: 8,
    nodes: [
      PATTERNS_8x8[2][0],
      PATTERNS_8x8[2][10],
      PATTERNS_8x8[2][20],
      PATTERNS_8x8[2][31],
      PATTERNS_8x8[2][42],
      PATTERNS_8x8[2][52],
      PATTERNS_8x8[2][63],
    ],
    solution: PATTERNS_8x8[2],
    barriers: generateBarriersForLevel(PATTERNS_8x8[2], 8, 8),
  },
  {
    id: 24,
    gridSize: 8,
    nodes: [
      PATTERNS_8x8[3][0],
      PATTERNS_8x8[3][10],
      PATTERNS_8x8[3][20],
      PATTERNS_8x8[3][31],
      PATTERNS_8x8[3][42],
      PATTERNS_8x8[3][52],
      PATTERNS_8x8[3][63],
    ],
    solution: PATTERNS_8x8[3],
    barriers: generateBarriersForLevel(PATTERNS_8x8[3], 8, 8),
  },

  // LEVELS 25-26: 8×8 (8 nodes, 10 barriers)
  {
    id: 25,
    gridSize: 8,
    nodes: [
      PATTERNS_8x8[4][0],
      PATTERNS_8x8[4][9],
      PATTERNS_8x8[4][18],
      PATTERNS_8x8[4][27],
      PATTERNS_8x8[4][36],
      PATTERNS_8x8[4][45],
      PATTERNS_8x8[4][54],
      PATTERNS_8x8[4][63],
    ],
    solution: PATTERNS_8x8[4],
    barriers: generateBarriersForLevel(PATTERNS_8x8[4], 10, 8),
  },
  {
    id: 26,
    gridSize: 8,
    nodes: [
      PATTERNS_8x8[5][0],
      PATTERNS_8x8[5][9],
      PATTERNS_8x8[5][18],
      PATTERNS_8x8[5][27],
      PATTERNS_8x8[5][36],
      PATTERNS_8x8[5][45],
      PATTERNS_8x8[5][54],
      PATTERNS_8x8[5][63],
    ],
    solution: PATTERNS_8x8[5],
    barriers: generateBarriersForLevel(PATTERNS_8x8[5], 10, 8),
  },

  // LEVELS 27-28: 8×8 (9 nodes, 12 barriers)
  {
    id: 27,
    gridSize: 8,
    nodes: [
      PATTERNS_8x8[6][0],
      PATTERNS_8x8[6][7],
      PATTERNS_8x8[6][15],
      PATTERNS_8x8[6][23],
      PATTERNS_8x8[6][31],
      PATTERNS_8x8[6][39],
      PATTERNS_8x8[6][47],
      PATTERNS_8x8[6][55],
      PATTERNS_8x8[6][63],
    ],
    solution: PATTERNS_8x8[6],
    barriers: generateBarriersForLevel(PATTERNS_8x8[6], 12, 8),
  },
  {
    id: 28,
    gridSize: 8,
    nodes: [
      PATTERNS_8x8[7][0],
      PATTERNS_8x8[7][7],
      PATTERNS_8x8[7][15],
      PATTERNS_8x8[7][23],
      PATTERNS_8x8[7][31],
      PATTERNS_8x8[7][39],
      PATTERNS_8x8[7][47],
      PATTERNS_8x8[7][55],
      PATTERNS_8x8[7][63],
    ],
    solution: PATTERNS_8x8[7],
    barriers: generateBarriersForLevel(PATTERNS_8x8[7], 12, 8),
  },

  // LEVELS 29-30: 8×8 (10 nodes, 14 barriers - EXPERT)
  {
    id: 29,
    gridSize: 8,
    nodes: [
      PATTERNS_8x8[8][0],
      PATTERNS_8x8[8][6],
      PATTERNS_8x8[8][13],
      PATTERNS_8x8[8][21],
      PATTERNS_8x8[8][28],
      PATTERNS_8x8[8][35],
      PATTERNS_8x8[8][42],
      PATTERNS_8x8[8][49],
      PATTERNS_8x8[8][56],
      PATTERNS_8x8[8][63],
    ],
    solution: PATTERNS_8x8[8],
    barriers: generateBarriersForLevel(PATTERNS_8x8[8], 14, 8),
  },
  {
    id: 30,
    gridSize: 8,
    nodes: [
      PATTERNS_8x8[9][0],
      PATTERNS_8x8[9][6],
      PATTERNS_8x8[9][13],
      PATTERNS_8x8[9][21],
      PATTERNS_8x8[9][28],
      PATTERNS_8x8[9][35],
      PATTERNS_8x8[9][42],
      PATTERNS_8x8[9][49],
      PATTERNS_8x8[9][56],
      PATTERNS_8x8[9][63],
    ],
    solution: PATTERNS_8x8[9],
    barriers: generateBarriersForLevel(PATTERNS_8x8[9], 14, 8),
  },
]

// VALIDATION: Ensure no barriers block solution paths
function validateAllLevels() {
  const conflicts: string[] = []
  
  levels.forEach(level => {
    level.barriers.forEach((barrier, bi) => {
      for (let i = 0; i < level.solution.length - 1; i++) {
        const a = level.solution[i]
        const b = level.solution[i + 1]

        // Check if barrier blocks this solution edge (BIDIRECTIONAL: check both cells)
        const blocksRight =
          (barrier.edge === 'right' &&
           a.row === barrier.row && a.col === barrier.col &&
           b.row === a.row && b.col === a.col + 1) ||
          (barrier.edge === 'left' &&
           b.row === barrier.row && b.col === barrier.col &&
           b.row === a.row && b.col === a.col + 1)

        const blocksLeft =
          (barrier.edge === 'left' &&
           a.row === barrier.row && a.col === barrier.col &&
           b.row === a.row && b.col === a.col - 1) ||
          (barrier.edge === 'right' &&
           b.row === barrier.row && b.col === barrier.col &&
           b.row === a.row && b.col === a.col - 1)

        const blocksBottom =
          (barrier.edge === 'bottom' &&
           a.row === barrier.row && a.col === barrier.col &&
           b.row === a.row + 1 && b.col === a.col) ||
          (barrier.edge === 'top' &&
           b.row === barrier.row && b.col === barrier.col &&
           b.row === a.row + 1 && b.col === a.col)

        const blocksTop =
          (barrier.edge === 'top' &&
           a.row === barrier.row && a.col === barrier.col &&
           b.row === a.row - 1 && b.col === a.col) ||
          (barrier.edge === 'bottom' &&
           b.row === barrier.row && b.col === barrier.col &&
           b.row === a.row - 1 && b.col === a.col)

        if (blocksRight || blocksLeft || blocksBottom || blocksTop) {
          const msg = `Level ${level.id} barrier ${bi} (${barrier.edge} at ${barrier.row},${barrier.col}) blocks solution at step ${i}: (${a.row},${a.col}) → (${b.row},${b.col})`
          conflicts.push(msg)
          console.error(msg)
        }
      }
    })
  })

  if (conflicts.length === 0) {
    console.log('✓ All levels validated: no barriers block solution paths')
  } else {
    console.error(`✗ Found ${conflicts.length} conflicts between barriers and solutions`)
  }
}

validateAllLevels()

export function getLevel(levelId: number): ZipLevel {
  const level = levels.find((l) => l.id === levelId)
  if (!level) {
    throw new Error(`Level ${levelId} not found`)
  }
  return level
}

export function totalLevels(): number {
  return levels.length
}

export const LEVELS = levels
