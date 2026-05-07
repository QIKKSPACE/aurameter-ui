export type MathOperator = '+' | '-' | '*' | '/'

export type CellType = 'number' | 'operator'

export type GridCell = {
  row: number
  col: number
  type: CellType
  value: number | MathOperator
  isOnPath: boolean
  isStart: boolean
  isEnd: boolean
}

export type PathStep = {
  row: number
  col: number
}

export type MazePuzzle = {
  gridSize: number
  grid: GridCell[][]
  target: number
  solutionPath: PathStep[]
}

export type PathStatus = 'idle' | 'drawing' | 'correct' | 'wrong'

export type MathMazeGameState = {
  puzzle: MazePuzzle | null
  currentPath: PathStep[]
  pathStatus: PathStatus
  currentResult: number | null
  playerScore: number
  timeRemaining: number
  roundsCompleted: number
  isGameOver: boolean
}
