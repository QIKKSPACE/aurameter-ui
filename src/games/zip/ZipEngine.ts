import { CellCoord, Barrier, Direction, ZipLevel, PathSegment } from './ZipTypes'

export function isAdjacent(a: CellCoord, b: CellCoord): boolean {
  const distance = Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
  return distance === 1
}

export function hasBarrier(
  from: CellCoord,
  to: CellCoord,
  barriers: Barrier[]
): boolean {
  for (const b of barriers) {
    // Moving RIGHT: from (r,c) to (r,c+1)
    if (from.col + 1 === to.col && from.row === to.row) {
      if (
        (b.row === from.row && b.col === from.col && b.edge === 'right') ||
        (b.row === to.row && b.col === to.col && b.edge === 'left')
      ) return true
    }
    // Moving LEFT: from (r,c) to (r,c-1)
    if (from.col - 1 === to.col && from.row === to.row) {
      if (
        (b.row === from.row && b.col === from.col && b.edge === 'left') ||
        (b.row === to.row && b.col === to.col && b.edge === 'right')
      ) return true
    }
    // Moving DOWN: from (r,c) to (r+1,c)
    if (from.row + 1 === to.row && from.col === to.col) {
      if (
        (b.row === from.row && b.col === from.col && b.edge === 'bottom') ||
        (b.row === to.row && b.col === to.col && b.edge === 'top')
      ) return true
    }
    // Moving UP: from (r,c) to (r-1,c)
    if (from.row - 1 === to.row && from.col === to.col) {
      if (
        (b.row === from.row && b.col === from.col && b.edge === 'top') ||
        (b.row === to.row && b.col === to.col && b.edge === 'bottom')
      ) return true
    }
  }
  return false
}

export function isOnPath(cell: CellCoord, currentPath: CellCoord[]): boolean {
  return currentPath.some((c) => c.row === cell.row && c.col === cell.col)
}

export function getNextExpectedNodeIndex(
  currentPath: CellCoord[],
  nodes: CellCoord[]
): number {
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (isOnPath(nodes[i], currentPath)) {
      return i + 1
    }
  }
  return 0
}

export function canMoveTo(
  from: CellCoord,
  to: CellCoord,
  currentPath: CellCoord[],
  level: ZipLevel
): boolean {
  // Must be adjacent (4-directional only)
  if (!isAdjacent(from, to)) return false

  // Cannot cross barrier
  if (hasBarrier(from, to, level.barriers)) return false

  // Cannot revisit any cell
  if (isOnPath(to, currentPath)) return false

  // Cannot move past the last node
  const lastNode = level.nodes[level.nodes.length - 1]
  const fromIsLastNode =
    from.row === lastNode.row && from.col === lastNode.col
  if (fromIsLastNode) return false

  // Node sequencing: check if target is a node
  const nodeIndex = level.nodes.findIndex(
    (n) => n.row === to.row && n.col === to.col
  )

  if (nodeIndex !== -1) {
    // Target is a node cell - must be the next expected node
    const nextExpectedNodeIndex = getNextExpectedNodeIndex(currentPath, level.nodes)
    if (nodeIndex !== nextExpectedNodeIndex) return false
  }

  return true
}

export function getPathSegments(
  currentPath: CellCoord[],
  nodes: CellCoord[]
): PathSegment[] {
  const segments: PathSegment[] = []
  let currentSegment: CellCoord[] = []
  let colorIndex = 0

  for (let i = 0; i < currentPath.length; i++) {
    currentSegment.push(currentPath[i])

    for (let j = 0; j < nodes.length; j++) {
      if (
        nodes[j].row === currentPath[i].row &&
        nodes[j].col === currentPath[i].col &&
        j > 0
      ) {
        segments.push({
          cells: currentSegment,
          colorIndex,
        })
        currentSegment = [currentPath[i]]
        colorIndex++
        break
      }
    }
  }

  if (currentSegment.length > 0) {
    segments.push({
      cells: currentSegment,
      colorIndex,
    })
  }

  return segments
}

export function isComplete(
  currentPath: CellCoord[],
  level: ZipLevel
): boolean {
  const expectedLength = level.gridSize * level.gridSize

  if (currentPath.length !== expectedLength) return false

  const lastNode = level.nodes[level.nodes.length - 1]
  const pathEnd = currentPath[currentPath.length - 1]

  return pathEnd.row === lastNode.row && pathEnd.col === lastNode.col
}

export function findFirstMistake(
  playerPath: CellCoord[],
  solution: CellCoord[]
): number {
  for (let i = 0; i < playerPath.length; i++) {
    if (
      playerPath[i].row !== solution[i].row ||
      playerPath[i].col !== solution[i].col
    ) {
      return i
    }
  }
  return playerPath.length
}

export function getHintExtension(
  correctUpToIndex: number,
  solution: CellCoord[],
  extendBy: number
): CellCoord[] {
  const result: CellCoord[] = []
  for (let i = 0; i < extendBy; i++) {
    const index = correctUpToIndex + i
    if (index < solution.length) {
      result.push(solution[index])
    }
  }
  return result
}

export function getHintArrowDirection(
  lastHintedCell: CellCoord,
  nextCell: CellCoord
): Direction {
  if (nextCell.row < lastHintedCell.row) return 'up'
  if (nextCell.row > lastHintedCell.row) return 'down'
  if (nextCell.col < lastHintedCell.col) return 'left'
  return 'right'
}

export function validateLevel(level: ZipLevel): boolean {
  const solution = level.solution
  const gridSize = level.gridSize
  const expectedLength = gridSize * gridSize

  if (solution.length !== expectedLength) {
    return false
  }

  const visited = new Set<string>()
  for (let i = 0; i < solution.length; i++) {
    const cell = solution[i]
    const key = `${cell.row},${cell.col}`

    if (visited.has(key)) {
      return false
    }
    visited.add(key)

    if (cell.row < 0 || cell.row >= gridSize || cell.col < 0 || cell.col >= gridSize) {
      return false
    }

    if (i > 0) {
      const prev = solution[i - 1]
      if (!isAdjacent(prev, cell)) {
        return false
      }

      if (hasBarrier(prev, cell, level.barriers)) {
        return false
      }
    }
  }

  if (level.nodes.length === 0) {
    return false
  }

  for (let i = 0; i < level.nodes.length; i++) {
    const node = level.nodes[i]
    const nodeKey = `${node.row},${node.col}`

    if (!visited.has(nodeKey)) {
      return false
    }

    const nodeIndex = solution.findIndex((c) => c.row === node.row && c.col === node.col)
    if (nodeIndex === -1) {
      return false
    }

    if (i > 0) {
      const prevNode = level.nodes[i - 1]
      const prevNodeIndex = solution.findIndex(
        (c) => c.row === prevNode.row && c.col === prevNode.col
      )
      if (nodeIndex <= prevNodeIndex) {
        return false
      }
    }
  }

  const lastNode = level.nodes[level.nodes.length - 1]
  const solutionEnd = solution[solution.length - 1]
  if (solutionEnd.row !== lastNode.row || solutionEnd.col !== lastNode.col) {
    return false
  }

  return true
}
