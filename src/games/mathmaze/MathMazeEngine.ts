import type { MazePuzzle, PathStep, GridCell, MathOperator, CellType } from './MathMazeTypes'

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


function generateValidPath(gridSize: number): PathStep[] {
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
    if (Math.random() < 0.6) {
      next = unvisited[0] // Prefer closer
    } else {
      next = unvisited[Math.floor(Math.random() * unvisited.length)]
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

function evaluatePathCells(cells: Array<{ type: CellType; value: number | MathOperator }>): number {
  const numberCells = cells.filter((c) => c.type === 'number')
  const operatorCells = cells.filter((c) => c.type === 'operator')

  if (numberCells.length === 0) return NaN
  if (numberCells.length !== operatorCells.length + 1) return NaN

  let result = (numberCells[0].value as number)

  for (let i = 0; i < operatorCells.length; i++) {
    const op = operatorCells[i].value as MathOperator
    const nextNum = numberCells[i + 1].value as number

    if (op === '+') {
      result = result + nextNum
    } else if (op === '-') {
      result = result - nextNum
    } else if (op === '*') {
      result = result * nextNum
    } else if (op === '/') {
      if (nextNum === 0) return NaN
      if (result % nextNum !== 0) return NaN
      result = result / nextNum
    }
  }

  return result
}

function tryGeneratePuzzle(gridSize: number): MazePuzzle | null {
  // STEP 1 — Generate valid solution path
  const path = generateValidPath(gridSize)
  if (path.length === 0 || path.length < 3) return null
  if (path.length % 2 === 0) return null // Must be odd: num-op-num...

  // STEP 3 — Generate values for solution path with safe division
  const pathCellData: Array<{ type: CellType; value: number | MathOperator }> = []

  for (let i = 0; i < path.length; i++) {
    if (i % 2 === 0) {
      // NUMBER cell
      pathCellData.push({ type: 'number', value: Math.floor(Math.random() * 9) + 1 })
    } else {
      // OPERATOR cell
      const operators: MathOperator[] = ['+', '-', '*', '/']
      let op = operators[Math.floor(Math.random() * 4)]

      // For division, ensure next number divides current result
      if (op === '/' && pathCellData.length > 0) {
        // Calculate current result so far
        const cellsSoFar = pathCellData
        let result = (cellsSoFar[0].value as number)
        for (let j = 1; j < cellsSoFar.length; j += 2) {
          const currentOp = cellsSoFar[j].value as MathOperator
          const currentNum = cellsSoFar[j + 1]?.value as number
          if (currentOp === '+') result += currentNum
          else if (currentOp === '-') result -= currentNum
          else if (currentOp === '*') result *= currentNum
          else if (currentOp === '/') {
            if (currentNum === 0) result = NaN
            else result = result / currentNum
          }
        }

        if (Number.isFinite(result) && result !== 0) {
          const divisors = getDivisors(Math.abs(Math.floor(result)))
          if (divisors.length === 0) {
            op = '+' // Fallback
          }
        } else {
          op = '+' // Fallback
        }
      }

      pathCellData.push({ type: 'operator', value: op })
    }
  }

  // STEP 4 — Calculate target from solution path
  const target = evaluatePathCells(pathCellData)

  if (!Number.isFinite(target)) return null
  if (target !== Math.round(target)) return null // Must be whole integer
  if (target < -99 || target > 999) return null
  if (target === 0 && Math.random() > 0.1) return null // Avoid 0 most of time

  // STEP 5 — Build the full grid
  const grid: GridCell[][] = Array(gridSize)
    .fill(null)
    .map(() =>
      Array(gridSize)
        .fill(null)
        .map(() => ({ type: 'number' as CellType, value: 1 }))
    )

  // Fill solution path cells
  for (let i = 0; i < path.length; i++) {
    const { row, col } = path[i]
    const data = pathCellData[i]
    grid[row][col] = {
      row,
      col,
      type: data.type,
      value: data.value,
      isOnPath: true,
      isStart: row === 0 && col === 0,
      isEnd: row === gridSize - 1 && col === gridSize - 1,
    }
  }

  // Fill non-path cells with checkerboard pattern
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col].isOnPath) continue

      const isNumber = (row + col) % 2 === 0
      const value = isNumber ? Math.floor(Math.random() * 9) + 1 : ['+', '-', '*', '/'][Math.floor(Math.random() * 4)]

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

  // STEP 6 — Verify at least one solution exists
  const solutions = findSolutions({
    gridSize,
    grid,
    target,
    solutionPath: path,
  })

  if (solutions.length === 0) return null

  return {
    gridSize,
    grid,
    target,
    solutionPath: path,
  }
}

function getHardcodedFallback(gridSize: number): MazePuzzle {
  if (gridSize === 3) {
    const grid: GridCell[][] = [
      [
        { row: 0, col: 0, type: 'number', value: 6, isStart: true, isEnd: false, isOnPath: true },
        { row: 0, col: 1, type: 'operator', value: '+', isStart: false, isEnd: false, isOnPath: true },
        { row: 0, col: 2, type: 'number', value: 3, isStart: false, isEnd: false, isOnPath: true },
      ],
      [
        { row: 1, col: 0, type: 'operator', value: '-', isStart: false, isEnd: false, isOnPath: false },
        { row: 1, col: 1, type: 'number', value: 2, isStart: false, isEnd: false, isOnPath: false },
        { row: 1, col: 2, type: 'operator', value: '+', isStart: false, isEnd: false, isOnPath: false },
      ],
      [
        { row: 2, col: 0, type: 'number', value: 5, isStart: false, isEnd: false, isOnPath: false },
        { row: 2, col: 1, type: 'operator', value: '+', isStart: false, isEnd: false, isOnPath: false },
        { row: 2, col: 2, type: 'number', value: 3, isStart: false, isEnd: true, isOnPath: false },
      ],
    ]
    return {
      gridSize: 3,
      grid,
      target: 9,
      solutionPath: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ],
    }
  }

  // Fallback for 4×4
  const grid: GridCell[][] = Array(4)
    .fill(null)
    .map(() =>
      Array(4)
        .fill(null)
        .map(() => ({ type: 'number' as CellType, value: 1 }))
    )

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const isNumber = (row + col) % 2 === 0
      grid[row][col] = {
        row,
        col,
        type: isNumber ? 'number' : 'operator',
        value: isNumber ? Math.floor(Math.random() * 9) + 1 : ['+', '-'][Math.floor(Math.random() * 2)],
        isStart: row === 0 && col === 0,
        isEnd: row === 3 && col === 3,
        isOnPath: false,
      }
    }
  }

  return {
    gridSize: 4,
    grid,
    target: 8,
    solutionPath: [{ row: 0, col: 0 }],
  }
}

function createGridFromPath(path: PathStep[], gridSize: number): GridCell[][] {
  const grid: GridCell[][] = Array(gridSize)
    .fill(null)
    .map(() =>
      Array(gridSize)
        .fill(null)
        .map(() => ({ type: 'number' as CellType, value: 1 }))
    )

  const pathCellData = fillCellsForPath(path)

  for (let i = 0; i < path.length; i++) {
    const { row, col } = path[i]
    const data = pathCellData[i]
    grid[row][col] = {
      row,
      col,
      type: data.type,
      value: data.value,
      isOnPath: true,
      isStart: row === 0 && col === 0,
      isEnd: row === gridSize - 1 && col === gridSize - 1,
    }
  }

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col].isOnPath) continue

      const isNumber = (row + col) % 2 === 0
      const value = isNumber ? Math.floor(Math.random() * 9) + 1 : ['+', '-', '*', '/'][Math.floor(Math.random() * 4)]

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

  return grid
}

export function generatePuzzle(gridSize: number): MazePuzzle {
  let attempts = 0
  const MAX_ATTEMPTS = 200

  while (attempts < MAX_ATTEMPTS) {
    attempts++
    const puzzle = tryGeneratePuzzle(gridSize)
    if (puzzle !== null) return puzzle
  }

  return getHardcodedFallback(gridSize)
}

function generateFallbackPuzzle(gridSize: number): MazePuzzle {
  const grid: GridCell[][] = Array(gridSize)
    .fill(null)
    .map(() =>
      Array(gridSize)
        .fill(null)
        .map(() => ({ type: 'number' as CellType, value: 1 }))
    )

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const isNumber = (row + col) % 2 === 0
      const value = isNumber ? Math.floor(Math.random() * 9) + 1 : ['+', '-', '*', '/'][Math.floor(Math.random() * 4)]

      grid[row][col] = {
        row,
        col,
        type: isNumber ? 'number' : 'operator',
        value,
        isOnPath: false,
        isStart: row === 0 && col === 0,
        isEnd: row === gridSize - 1 && col === gridSize - 1,
      }
    }
  }

  return {
    gridSize,
    grid,
    target: 10,
    solutionPath: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ],
  }
}

export function evaluateExpression(grid: GridCell[][], path: PathStep[]): number {
  if (path.length < 1) return NaN
  if (path.length % 2 === 0) return NaN
    // even length path ends on operator — invalid

  const cells = path.map((step) => grid[step.row][step.col])

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
        if (result % num !== 0) return NaN
          // division must produce whole number
        result = result / num
        break
      default:
        return NaN
    }
  }

  // Round to avoid floating point errors
  return Math.round(result * 10000) / 10000
}

export function isValidPath(path: PathStep[], gridSize: number): boolean {
  if (path.length < 3) return false
  if (path[0].row !== 0 || path[0].col !== 0) return false
  if (path[path.length - 1].row !== gridSize - 1 || path[path.length - 1].col !== gridSize - 1) return false

  const visited = new Set<string>()
  for (let i = 0; i < path.length; i++) {
    const key = `${path[i].row},${path[i].col}`
    if (visited.has(key)) return false
    visited.add(key)

    if (i > 0) {
      const prev = path[i - 1]
      const curr = path[i]
      const distance = Math.abs(prev.row - curr.row) + Math.abs(prev.col - curr.col)
      if (distance !== 1) return false
    }
  }

  return true
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
