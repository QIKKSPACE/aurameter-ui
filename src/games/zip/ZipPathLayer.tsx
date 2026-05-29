import React, { useMemo } from 'react'
import { Svg, Polyline, Defs, ClipPath, Rect, G } from 'react-native-svg'
import { PathSegment, CellCoord } from './ZipTypes'
import { COLORS } from './ZipColors'

interface ZipPathLayerProps {
  cellSize: number
  gridSize: number
  segments: PathSegment[]
  hintedCells: Set<string>
}

const ZipPathLayerComponent = React.memo<ZipPathLayerProps>(
  ({ cellSize, gridSize, segments, hintedCells }) => {
    const svgWidth = cellSize * gridSize
    const svgHeight = cellSize * gridSize

    const renderedSegments = useMemo(() => {
      return segments.map((segment, segmentIndex) => {
        const points = segment.cells
          .map((cell) => ({
            x: cell.col * cellSize + cellSize / 2,
            y: cell.row * cellSize + cellSize / 2,
          }))
          .map((p) => `${p.x},${p.y}`)
          .join(' ')

        let opacity = COLORS.PATH_OPACITY
        for (const cell of segment.cells) {
          if (hintedCells.has(`${cell.row},${cell.col}`)) {
            opacity = COLORS.HINT_PATH_OPACITY
            break
          }
        }

        const colorIndex = segment.colorIndex % COLORS.PATH_COLORS.length
        const color = COLORS.PATH_COLORS[colorIndex]

        return (
          <Polyline
            key={segmentIndex}
            points={points}
            stroke={color}
            strokeWidth={cellSize * 0.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={opacity}
          />
        )
      })
    }, [segments, cellSize, hintedCells])

    return (
      <Svg
        width={svgWidth}
        height={svgHeight}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 5 }}
        pointerEvents="none"
      >
        <Defs>
          <ClipPath id="boardClip">
            <Rect x={0} y={0} width={svgWidth} height={svgHeight} />
          </ClipPath>
        </Defs>
        <G clipPath="url(#boardClip)">
          {renderedSegments}
        </G>
      </Svg>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.cellSize === nextProps.cellSize &&
      prevProps.gridSize === nextProps.gridSize &&
      prevProps.segments === nextProps.segments &&
      prevProps.hintedCells === nextProps.hintedCells
    )
  }
)

ZipPathLayerComponent.displayName = 'ZipPathLayer'
export const ZipPathLayer = ZipPathLayerComponent
