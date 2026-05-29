export type Direction = 'up' | 'down' | 'left' | 'right'

export type CellCoord = {
  row: number
  col: number
}

export type Barrier = {
  row: number
  col: number
  edge: 'top' | 'bottom' | 'left' | 'right'
}

export type ZipLevel = {
  id: number
  gridSize: number
  nodes: CellCoord[]
  barriers: Barrier[]
  solution: CellCoord[]
}

export type PathSegment = {
  cells: CellCoord[]
  colorIndex: number
}

export type ZipGameState = {
  level: ZipLevel
  currentPath: CellCoord[]
  currentNodeIndex: number
  isComplete: boolean
  hintsUsed: number
  hintMessage: string | null
  hintArrow: { cell: CellCoord; direction: Direction } | null
  elapsedSeconds: number
}
