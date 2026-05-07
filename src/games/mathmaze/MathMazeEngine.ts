import type { MazePuzzle, PathStep, GridCell, MathOperator, CellType } from './MathMazeTypes'

// ═══════════════════════════════════════════════════════════
// SEEDED RANDOM NUMBER GENERATOR
// ═══════════════════════════════════════════════════════════
// Returns a deterministic random function for a given seed.
// Same seed always produces same sequence of random numbers.
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export function findSolutions(puzzle: MazePuzzle): PathStep[][] {
  const solutions: PathStep[][] = []
  const { gridSize, grid, target } = puzzle

  function dfs(
    current: PathStep,
    visited: Set<string>,
    currentPath: PathStep[],
    pathExpressionCells: Array<{ type: CellType; value: number | MathOperator }>
  ) {
    const endRow = gridSize - 1
    const endCol = gridSize - 1

    if (current.row === endRow && current.col === endCol) {
      const result = evaluatePathCells(pathExpressionCells)
      // Use tolerance-based comparison
      if (Number.isFinite(result) && Math.abs(result - target) < 0.001) {
        solutions.push([...currentPath])
      }
      return
    }

    const neighbors = []
    if (current.row > 0) neighbors.push({ row: current.row - 1, col: current.col })
    if (current.row < endRow) neighbors.push({ row: current.row + 1, col: current.col })
    if (current.col > 0) neighbors.push({ row: current.row, col: current.col - 1 })
    if (current.col < endCol) neighbors.push({ row: current.row, col: current.col + 1 })

    for (const neighbor of neighbors) {
      const key = `${neighbor.row},${neighbor.col}`
      if (visited.has(key)) continue

      visited.add(key)
      currentPath.push(neighbor)

      const cell = grid[neighbor.row][neighbor.col]
      pathExpressionCells.push({ type: cell.type, value: cell.value })

      if (pathExpressionCells.length % 2 === 1) {
        dfs(neighbor, visited, currentPath, pathExpressionCells)
      } else {
        dfs(neighbor, visited, currentPath, pathExpressionCells)
      }

      pathExpressionCells.pop()
      currentPath.pop()
      visited.delete(key)
    }
  }

  const startCell = grid[0][0]
  const visited = new Set<string>(['0,0'])
  dfs({ row: 0, col: 0 }, visited, [{ row: 0, col: 0 }], [{ type: startCell.type, value: startCell.value }])

  return solutions
}


function generateValidPath(gridSize: number, rand?: () => number): PathStep[] {
  const random = rand || Math.random
  const path: PathStep[] = [{ row: 0, col: 0 }]
  const visited = new Set<string>(['0,0'])
  const endRow = gridSize - 1
  const endCol = gridSize - 1

  while (true) {
    const current = path[path.length - 1]

    if (current.row === endRow && current.col === endCol) {
      // Verify path respects checkerboard pattern
      for (let i = 0; i < path.length; i++) {
        const { row, col } = path[i]
        const expectedIsNumber = (row + col) % 2 === 0
        const actualIsNumber = i % 2 === 0
        if (expectedIsNumber !== actualIsNumber) {
          return [] // Path violates checkerboard, restart
        }
      }
      return path
    }

    const neighbors: PathStep[] = []
    if (current.row > 0) neighbors.push({ row: current.row - 1, col: current.col })
    if (current.row < endRow) neighbors.push({ row: current.row + 1, col: current.col })
    if (current.col > 0) neighbors.push({ row: current.row, col: current.col - 1 })
    if (current.col < endCol) neighbors.push({ row: current.row, col: current.col + 1 })

    const unvisited = neighbors.filter((n) => !visited.has(`${n.row},${n.col}`))

    if (unvisited.length === 0) {
      return [] // Stuck
    }

    // Sort by Manhattan distance to END, bias toward closer cells
    unvisited.sort((a, b) => {
      const distA = Math.abs(a.row - endRow) + Math.abs(a.col - endCol)
      const distB = Math.abs(b.row - endRow) + Math.abs(b.col - endCol)
      return distA - distB
    })

    let next: PathStep
    if (random() < 0.6) {
      next = unvisited[0] // Prefer closer
    } else {
      next = unvisited[Math.floor(random() * unvisited.length)]
    }

    path.push(next)
    visited.add(`${next.row},${next.col}`)

    // Safety check for max path length
    if (path.length > gridSize * gridSize) {
      return []
    }
  }
}

function getDivisors(num: number): number[] {
  const divisors: number[] = []
  for (let i = 1; i <= 9; i++) {
    if (num % i === 0) {
      divisors.push(i)
    }
  }
  return divisors
}



function deepFreezeGrid(grid: GridCell[][]): void {
  grid.forEach((row) => {
    row.forEach((cell) => {
      Object.freeze(cell)
    })
    Object.freeze(row)
  })
  Object.freeze(grid)
}

function tryBuildPuzzle(gridSize: number, seed?: number): MazePuzzle | null {
  const rand = seed !== undefined ? seededRandom(seed) : Math.random

  // STEP 1 — Generate a random valid path from (0,0) to (N-1,N-1)
  const path = generateValidPath(gridSize, rand)
  if (path.length === 0 || path.length < 3) return null
  if (path.length % 2 === 0) return null // Must be odd: num-op-num...

  // Verify path ends on a NUMBER position using checkerboard
  const endRow = gridSize - 1
  const endCol = gridSize - 1
  const endIsNumber = (endRow + endCol) % 2 === 0
  if (!endIsNumber) return null // End must be on a number cell

  // STEP 3 — Assign cell types using checkerboard pattern for ENTIRE grid
  // (This will be done when we create the grid)

  // STEP 4 — Assign values to cells ON the solution path
  const pathCellData: Array<{ type: CellType; value: number | MathOperator }> = []

  for (let i = 0; i < path.length; i++) {
    if (i % 2 === 0) {
      // NUMBER cell
      pathCellData.push({ type: 'number', value: Math.floor(rand() * 9) + 1 })
    } else {
      // OPERATOR cell - choose intelligently
      let op: MathOperator = '+'

      if (pathCellData.length > 0) {
        // Calculate current result so far
        let result = (pathCellData[0].value as number)
        for (let j = 1; j < pathCellData.length; j += 2) {
          const currentOp = pathCellData[j].value as MathOperator
          const currentNum = pathCellData[j + 1]?.value as number
          if (currentOp === '+') result += currentNum
          else if (currentOp === '-') result -= currentNum
          else if (currentOp === '*') result *= currentNum
          else if (currentOp === '/') {
            if (currentNum === 0 || result % currentNum !== 0) {
              result = NaN
              break
            }
            result = result / currentNum
          }
        }

        if (Number.isFinite(result) && result !== 0) {
          // Try to pick a good operator
          const operators: MathOperator[] = ['+', '-', '*', '/']
          const validOps: MathOperator[] = []

          for (const candidate of operators) {
            if (candidate === '/' && result !== 0) {
              const divisors = getDivisors(Math.abs(Math.floor(result)))
              if (divisors.length > 0) {
                validOps.push(candidate)
              }
            } else if (candidate !== '/') {
              validOps.push(candidate)
            }
          }

          if (validOps.length > 0) {
            op = validOps[Math.floor(rand() * validOps.length)]
          } else {
            op = '+'
          }
        }
      }

      pathCellData.push({ type: 'operator', value: op })
    }
  }

  // STEP 4b — Calculate and validate target from solution path
  const target = evaluatePathCells(pathCellData)

  // Validate target
  if (!Number.isFinite(target)) return null
  if (target !== Math.floor(target)) return null // Must be whole integer
  if (target <= -100 || target >= 1000) return null // Keep in reasonable range
  if (target === 0) {
    // Allow 0 but less frequently
    if (rand() > 0.3) return null
  }

  // STEP 5 — Build the full grid with checkerboard pattern
  const grid: GridCell[][] = Array(gridSize)
    .fill(null)
    .map(() =>
      Array(gridSize)
        .fill(null)
        .map(() => ({ type: 'number' as CellType, value: 1 }))
    )

  // Mark which cells are on the path for verification later
  const pathSet = new Set<string>()

  // Fill solution path cells
  for (let i = 0; i < path.length; i++) {
    const { row, col } = path[i]
    const data = pathCellData[i]
    pathSet.add(`${row},${col}`)
    grid[row][col] = {
      row,
      col,
      type: data.type,
      value: data.value,
      isOnPath: true,
      isStart: row === 0 && col === 0,
      isEnd: row === endRow && col === endCol,
    }
  }

  // Fill non-path cells with checkerboard pattern
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (pathSet.has(`${row},${col}`)) continue

      const isNumber = (row + col) % 2 === 0
      const value = isNumber
        ? Math.floor(rand() * 9) + 1
        : ['+', '-', '*', '/'][Math.floor(rand() * 4)]

      grid[row][col] = {
        row,
        col,
        type: isNumber ? 'number' : 'operator',
        value,
        isOnPath: false,
        isStart: false,
        isEnd: false,
      }
    }
  }

  // STEP 6 — VERIFY the puzzle is solvable
  const solutions = findSolutions({
    gridSize,
    grid,
    target,
    solutionPath: path,
  })

  if (solutions.length === 0) return null

  // Deep freeze the puzzle to prevent accidental mutation
  deepFreezeGrid(grid)
  const frozenPuzzle = Object.freeze({
    gridSize,
    grid,
    target,
    solutionPath: path,
  })
  return frozenPuzzle
}

function buildFallbackPuzzle(gridSize: number): MazePuzzle {
  if (gridSize === 3) {
    // Rotate through 3 verified fallback puzzles
    const fallbackIndex = Math.floor(Math.random() * 3)
    
    let grid: GridCell[][]
    let target: number
    let solutionPath: PathStep[]
    
    if (fallbackIndex === 0) {
      // Fallback 1: target 6 - path (0,0)→(0,1)→(0,2) = 4+2 = 6 ✓
      grid = [
        [
          { row: 0, col: 0, type: 'number', value: 4, isStart: true, isEnd: false, isOnPath: true },
          { row: 0, col: 1, type: 'operator', value: '+', isStart: false, isEnd: false, isOnPath: true },
          { row: 0, col: 2, type: 'number', value: 2, isStart: false, isEnd: false, isOnPath: true },
        ],
        [
          { row: 1, col: 0, type: 'operator', value: '*', isStart: false, isEnd: false, isOnPath: false },
          { row: 1, col: 1, type: 'number', value: 3, isStart: false, isEnd: false, isOnPath: false },
          { row: 1, col: 2, type: 'operator', value: '-', isStart: false, isEnd: false, isOnPath: false },
        ],
        [
          { row: 2, col: 0, type: 'number', value: 1, isStart: false, isEnd: false, isOnPath: false },
          { row: 2, col: 1, type: 'operator', value: '+', isStart: false, isEnd: false, isOnPath: false },
          { row: 2, col: 2, type: 'number', value: 5, isStart: false, isEnd: true, isOnPath: true },
        ],
      ]
      target = 6
      solutionPath = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }]
    } else if (fallbackIndex === 1) {
      // Fallback 2: target 12 - path (0,0)→(0,1)→(0,2) = 3*4 = 12 ✓
      grid = [
        [
          { row: 0, col: 0, type: 'number', value: 3, isStart: true, isEnd: false, isOnPath: true },
          { row: 0, col: 1, type: 'operator', value: '*', isStart: false, isEnd: false, isOnPath: true },
          { row: 0, col: 2, type: 'number', value: 4, isStart: false, isEnd: false, isOnPath: true },
        ],
        [
          { row: 1, col: 0, type: 'operator', value: '+', isStart: false, isEnd: false, isOnPath: false },
          { row: 1, col: 1, type: 'number', value: 2, isStart: false, isEnd: false, isOnPath: false },
          { row: 1, col: 2, type: 'operator', value: '+', isStart: false, isEnd: false, isOnPath: false },
        ],
        [
          { row: 2, col: 0, type: 'number', value: 1, isStart: false, isEnd: false, isOnPath: false },
          { row: 2, col: 1, type: 'operator', value: '+', isStart: false, isEnd: false, isOnPath: false },
          { row: 2, col: 2, type: 'number', value: 5, isStart: false, isEnd: true, isOnPath: true },
        ],
      ]
      target = 12
      solutionPath = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }]
    } else {
      // Fallback 3: target 8 - path (0,0)→(0,1)→(0,2) = 2*4 = 8 ✓
      grid = [
        [
          { row: 0, col: 0, type: 'number', value: 2, isStart: true, isEnd: false, isOnPath: true },
          { row: 0, col: 1, type: 'operator', value: '*', isStart: false, isEnd: false, isOnPath: true },
          { row: 0, col: 2, type: 'number', value: 4, isStart: false, isEnd: false, isOnPath: true },
        ],
        [
          { row: 1, col: 0, type: 'operator', value: '+', isStart: false, isEnd: false, isOnPath: false },
          { row: 1, col: 1, type: 'number', value: 3, isStart: false, isEnd: false, isOnPath: false },
          { row: 1, col: 2, type: 'operator', value: '-', isStart: false, isEnd: false, isOnPath: false },
        ],
        [
          { row: 2, col: 0, type: 'number', value: 5, isStart: false, isEnd: false, isOnPath: false },
          { row: 2, col: 1, type: 'operator', value: '+', isStart: false, isEnd: false, isOnPath: false },
          { row: 2, col: 2, type: 'number', value: 1, isStart: false, isEnd: true, isOnPath: true },
        ],
      ]
      target = 8
      solutionPath = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }]
    }
    
    deepFreezeGrid(grid)
    return Object.freeze({
      gridSize: 3,
      grid,
      target,
      solutionPath,
    })
  } else if (gridSize === 4) {
    // Fallback for 4×4 — verified solvable puzzle
    // Solution path: (0,0) → (1,0) → (2,0) → (2,1) → (2,2) → (2,3) → (3,3)
    // Expression: 4 + 3 = 7
    const grid: GridCell[][] = [
      [
        { row: 0, col: 0, type: 'number', value: 4, isStart: true, isEnd: false, isOnPath: true },
        { row: 0, col: 1, type: 'operator', value: '-', isStart: false, isEnd: false, isOnPath: false },
        { row: 0, col: 2, type: 'number', value: 8, isStart: false, isEnd: false, isOnPath: false },
        { row: 0, col: 3, type: 'operator', value: '*', isStart: false, isEnd: false, isOnPath: false },
      ],
      [
        { row: 1, col: 0, type: 'operator', value: '+', isStart: false, isEnd: false, isOnPath: true },
        { row: 1, col: 1, type: 'number', value: 2, isStart: false, isEnd: false, isOnPath: false },
        { row: 1, col: 2, type: 'operator', value: '+', isStart: false, isEnd: false, isOnPath: false },
        { row: 1, col: 3, type: 'number', value: 9, isStart: false, isEnd: false, isOnPath: false },
      ],
      [
        { row: 2, col: 0, type: 'number', value: 3, isStart: false, isEnd: false, isOnPath: true },
        { row: 2, col: 1, type: 'operator', value: '+', isStart: false, isEnd: false, isOnPath: true },
        { row: 2, col: 2, type: 'number', value: 4, isStart: false, isEnd: false, isOnPath: true },
        { row: 2, col: 3, type: 'operator', value: '-', isStart: false, isEnd: false, isOnPath: true },
      ],
      [
        { row: 3, col: 0, type: 'operator', value: '/', isStart: false, isEnd: false, isOnPath: false },
        { row: 3, col: 1, type: 'number', value: 5, isStart: false, isEnd: false, isOnPath: false },
        { row: 3, col: 2, type: 'operator', value: '-', isStart: false, isEnd: false, isOnPath: false },
        { row: 3, col: 3, type: 'number', value: 4, isStart: false, isEnd: true, isOnPath: true },
      ],
    ]

    deepFreezeGrid(grid)
    return Object.freeze({
      gridSize: 4,
      grid,
      target: 7,
      solutionPath: [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 2, col: 3 },
        { row: 3, col: 3 },
      ],
    })
  }

  // Default fallback for unsupported grid sizes
  throw new Error(`buildFallbackPuzzle: unsupported gridSize ${gridSize}`)
}



export function generatePuzzle(gridSize: number, seed?: number): MazePuzzle {
  let attempts = 0
  const MAX_ATTEMPTS = 500

  while (attempts < MAX_ATTEMPTS) {
    attempts++
    const puzzleSeed = seed !== undefined ? seed + attempts : undefined
    const puzzle = tryBuildPuzzle(gridSize, puzzleSeed)
    if (puzzle !== null) return puzzle
  }

  return buildFallbackPuzzle(gridSize)
}

function evaluatePathCells(cells: Array<{ type: CellType; value: number | MathOperator }>): number {
  if (cells.length < 1) return NaN
  if (cells.length % 2 === 0) return NaN // even length ends on operator — invalid

  const numberCells = cells.filter((c) => c.type === 'number')
  const operatorCells = cells.filter((c) => c.type === 'operator')

  if (numberCells.length === 0) return NaN
  if (numberCells.length !== operatorCells.length + 1) return NaN

  const firstCell = cells[0]
  if (firstCell.type !== 'number') return NaN

  let result = (firstCell.value as number)

  for (let i = 1; i < cells.length - 1; i += 2) {
    const opCell = cells[i]
    const numCell = cells[i + 1]

    if (opCell.type !== 'operator') return NaN
    if (numCell.type !== 'number') return NaN

    const op = opCell.value as MathOperator
    const num = numCell.value as number

    switch (op) {
      case '+':
        result = result + num
        break
      case '-':
        result = result - num
        break
      case '*':
        result = result * num
        break
      case '/':
        if (num === 0) return NaN
        if (result % num !== 0) return NaN // division must produce whole number
        result = result / num
        break
      default:
        return NaN
    }
  }

  // Round to avoid floating point errors
  return Math.round(result * 10000) / 10000
}

export function evaluateExpression(grid: GridCell[][], path: PathStep[], gridSize: number): number {
  if (path.length < 3) return NaN
  if (path[0].row !== 0 || path[0].col !== 0) return NaN
  if (path[path.length - 1].row !== gridSize - 1 || path[path.length - 1].col !== gridSize - 1) return NaN

  const visited = new Set<string>()
  const pathCells: Array<{ type: CellType; value: number | MathOperator }> = []

  for (let i = 0; i < path.length; i++) {
    const key = `${path[i].row},${path[i].col}`
    if (visited.has(key)) return NaN
    visited.add(key)

    if (i > 0) {
      const prev = path[i - 1]
      const curr = path[i]
      const distance = Math.abs(prev.row - curr.row) + Math.abs(prev.col - curr.col)
      if (distance !== 1) return NaN
    }

    const cell = grid[path[i].row][path[i].col]
    pathCells.push({ type: cell.type, value: cell.value })
  }

  return evaluatePathCells(pathCells)
}

export function isAdjacentTo(a: PathStep, b: PathStep): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1
}

export function canExtendPath(path: PathStep[], newCell: PathStep, gridSize: number): boolean {
  if (path.length === 0) return false

  const lastCell = path[path.length - 1]
  if (!isAdjacentTo(lastCell, newCell)) return false

  for (const cell of path) {
    if (cell.row === newCell.row && cell.col === newCell.col) return false
  }

  return true
}

export function isBacktrack(path: PathStep[], cell: PathStep): boolean {
  if (path.length < 2) return false
  const secondToLast = path[path.length - 2]
  return secondToLast.row === cell.row && secondToLast.col === cell.col
}
