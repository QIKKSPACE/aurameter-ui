/**
 * ═════════════════════════════════════════════════════════════════════════════
 * CLEAN HINT SYSTEM - Grid-based, 4-directional only
 * ═════════════════════════════════════════════════════════════════════════════
 * 
 * CRITICAL RULES (BUG FIX):
 * 1. Hints MUST be a subset of solutionPath
 * 2. Hints NEVER modify correct existing player path
 * 3. Hints ONLY extend or correct from divergence point
 * 4. NO overlaps, NO branching, NO crossing
 * 5. All path merging validated before returning
 * 
 * This is a COMPLETE REBUILD of the hint system to be:
 * - Simple and understandable
 * - Strictly enforcing 4-directional movement (UP/DOWN/LEFT/RIGHT only)
 * - Never producing diagonal or multi-cell jumps
 * - Based on a canonical solution path
 * 
 * Key principle: ALL moves are broken down to single-cell steps in Manhattan distance.
 */

import type { PathSegment, Point, Node, Obstacle } from "./ZipTypes";

/**
 * Check if two points are equal
 */
const pointsEqual = (p1: Point, p2: Point): boolean => {
  return p1.x === p2.x && p1.y === p2.y;
};

/**
 * ⚠️ CRITICAL: Validate hint path is EXACTLY a subset of solution
 * Every point in hint must exist in solution at the right position
 */
const validateHintIsSubsetOfSolution = (
  hintPoints: Point[],
  solutionPoints: Point[],
  hintStartIndex: number
): boolean => {
  for (let i = 0; i < hintPoints.length; i++) {
    const solutionIndex = hintStartIndex + i;
    
    if (solutionIndex >= solutionPoints.length) {
      return false;
    }
    
    if (!pointsEqual(hintPoints[i], solutionPoints[solutionIndex])) {
      return false;
    }
  }
  
  return true;
};

/**
 * Convert path segments to flat point array
 * ✅ STRICT: Only expands 4-directional segments
 * Each segment must be horizontal OR vertical (never diagonal)
 */
export const convertPathToPoints = (segments: PathSegment[]): Point[] => {
  if (segments.length === 0) return [];

  const points: Point[] = [];

  for (const segment of segments) {
    const { from, to } = segment;
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // ✅ VALIDATION: Ensure 4-directional - no diagonals allowed
    if (Math.abs(dx) > 0 && Math.abs(dy) > 0) {
      throw new Error(`Diagonal segments not allowed: [${from.x},${from.y}] → [${to.x},${to.y}]`);
    }

    // Add starting point
    let x = from.x;
    let y = from.y;
    points.push({ x, y });

    // Expand horizontally then vertically
    if (dx > 0) {
      for (let i = 0; i < dx; i++) {
        x++;
        points.push({ x, y });
      }
    } else if (dx < 0) {
      for (let i = 0; i < -dx; i++) {
        x--;
        points.push({ x, y });
      }
    }

    if (dy > 0) {
      for (let i = 0; i < dy; i++) {
        y++;
        points.push({ x, y });
      }
    } else if (dy < 0) {
      for (let i = 0; i < -dy; i++) {
        y--;
        points.push({ x, y });
      }
    }
  }

  // Remove duplicates at segment boundaries
  const unique: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    if (i === 0 || !pointsEqual(points[i], points[i - 1])) {
      unique.push(points[i]);
    }
  }

  return unique;
};

/**
 * Find where player path matches solution path
 * Returns index of last matching point
 * 
 * ✅ CASE A: Player path is correct
 *    Player has: [0,0] → [1,0] → [2,0]
 *    Solution:  [0,0] → [1,0] → [2,0] → [2,1] → [2,2]
 *    Returns: 2 (last correct index)
 * 
 * ✅ CASE B: Player path is wrong at some point
 *    Player has: [0,0] → [1,0] → [1,1] ❌ (should be [2,0])
 *    Solution:  [0,0] → [1,0] → [2,0] → [2,1]
 *    Returns: 1 (last correct before mismatch)
 */
export const findLastCorrectIndex = (playerPoints: Point[], solutionPoints: Point[]): number => {
  let lastCorrect = -1;

  for (let i = 0; i < playerPoints.length && i < solutionPoints.length; i++) {
    if (pointsEqual(playerPoints[i], solutionPoints[i])) {
      lastCorrect = i;
    } else {
      // ⚠️ CRITICAL: Stop at FIRST mismatch - do NOT continue searching
      break;
    }
  }

  return lastCorrect;
};

/**
 * Generate hint path: 2-5 steps from solutionPath starting at given index
 * ✅ STRICT: Only generates 4-directional segments
 * ✅ NEW: Optional endIndex to limit hint (e.g., don't go beyond last node)
 */
export const generateHintPath = (
  solutionPoints: Point[],
  startIndex: number,
  endIndex?: number
): PathSegment[] => {
  if (startIndex >= solutionPoints.length) {
    return [];
  }

  // ✅ NEW: Use provided endIndex or default to startIndex + 5
  const maxEndIndex = endIndex ?? Math.min(startIndex + 5, solutionPoints.length);
  const actualEndIndex = Math.min(maxEndIndex, solutionPoints.length);
  
  const hintPoints = solutionPoints.slice(startIndex, actualEndIndex);

  if (hintPoints.length < 2) {
    return [];
  }

  const hintSegments: PathSegment[] = [];

  // Convert adjacent points to segments - guaranteed 4-directional
  for (let i = 0; i < hintPoints.length - 1; i++) {
    const from = hintPoints[i];
    const to = hintPoints[i + 1];

    if (pointsEqual(from, to)) {
      continue;
    }

    hintSegments.push({ from, to });
  }

  // ✅ VALIDATE: Every segment must be 4-directional
  for (let i = 0; i < hintSegments.length; i++) {
    const seg = hintSegments[i];
    const dx = Math.abs(seg.to.x - seg.from.x);
    const dy = Math.abs(seg.to.y - seg.from.y);

    if (dx + dy !== 1) {
      const errorMsg = `Critical: Hint segment ${i} is not 4-directional!\n` +
        `From: [${seg.from.x},${seg.from.y}] To: [${seg.to.x},${seg.to.y}]\n` +
        `Distance: dx=${dx}, dy=${dy} (expected: 1)\n` +
        `All solutions must be 4-directional step-by-step`;
      throw new Error(errorMsg);
    }
  }

  return hintSegments;
};

/**
 * Helper: Build segments from point array with STRICT validation
 * Ensures no duplicate cells and all segments are 4-directional
 * Returns empty array if any duplicates found
 * 
 * FIX APPLIED: ISSUE 2 - HINT SHOWS DIAGONAL OR JUMPING PATHS
 * What was wrong: Non-adjacent points were converted to single segments without expansion
 * What changed: Added expansion of multi-cell jumps into unit steps before segment creation
 */
const buildSegmentsFromPoints = (points: Point[]): PathSegment[] => {
  if (points.length < 2) return [];
  
  const segments: PathSegment[] = [];
  
  // Verify no duplicate cells first
  const cellSet = new Set<string>();
  for (const point of points) {
    const key = `${point.x},${point.y}`;
    if (cellSet.has(key)) {
      return []; // Return empty array on duplicate detection
    }
    cellSet.add(key);
  }
  
  // Build segments with expansion for non-adjacent points
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    
    if (pointsEqual(from, to)) {
      continue;
    }
    
    // Check if points are adjacent (4-directional only)
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    
    if (dx + dy === 1) {
      // Adjacent: single segment
      segments.push({ from, to });
    } else if (dx + dy > 1) {
      // Non-adjacent: expand into unit steps
      const stepSegments = expandSegmentIntoSteps(from, to);
      segments.push(...stepSegments);
    } else {
      // Zero-length segment: skip
      continue;
    }
  }
  
  return segments;
};

/**
 * Expand a multi-cell segment into individual unit steps (4-directional only)
 * Converts (0,0) → (2,1) into [(0,0)→(1,0), (1,0)→(2,0), (2,0)→(2,1)]
 */
const expandSegmentIntoSteps = (from: Point, to: Point): PathSegment[] => {
  const steps: PathSegment[] = [];
  let current = { ...from };
  
  // Move in X direction first
  while (current.x !== to.x) {
    const next = {
      x: current.x + Math.sign(to.x - current.x),
      y: current.y,
    };
    steps.push({ from: current, to: next });
    current = next;
  }
  
  // Then move in Y direction
  while (current.y !== to.y) {
    const next = {
      x: current.x,
      y: current.y + Math.sign(to.y - current.y),
    };
    steps.push({ from: current, to: next });
    current = next;
  }
  
  return steps;
};

/**
 * Generate intelligent hint with optional path correction
 * 
 * STRICT ALGORITHM - FIX FOR CRITICAL OVERLAP BUG + LAST NODE RULE:
 * 
 * STEP 1: Compare playerPath with solutionPath
 *   Find matching index = last point where paths align
 * 
 * CASE A: PLAYER PATH IS CORRECT (matching === playerLength - 1)
 *   - DO NOT modify playerPath
 *   - Extend from next solution point (but NOT beyond last node!)
 *   - Return: hintSegments only (no correction)
 * 
 * CASE B: PLAYER PATH IS WRONG (matching < playerLength - 1)
 *   - Take only correct portion of player path
 *   - Append next steps from solution (but NOT beyond last node!)
 *   - Verify NO duplicates at merge point
 *   - Return: full correctionPath
 * 
 * STEP 2: CRITICAL NEW RULE - LAST NODE IS FINAL
 *   - If hint would go beyond last node position, STOP at last node
 *   - Hint should guide player to fill grid, ending at last node
 *   - Never hint beyond the final numbered node
 * 
 * STEP 3: MERGE VALIDATION
 *   - Verify merged path has NO duplicate cells
 *   - Verify path is continuous (4-directional only)
 */
export interface HintResult {
  hintSegments: PathSegment[];
  shouldCorrectPath: boolean;
  correctionPath: PathSegment[] | null;
  nextHintStart: number;
}

export const generateHint = (
  playerPath: PathSegment[],
  solutionPoints: Point[] | null,
  playerHintIndex: number = 0,
  nodes?: Node[]  // ✅ NEW: Pass nodes to know where last number is
): HintResult => {
  // ✅ Must have solution
  if (!solutionPoints || solutionPoints.length < 2) {
    return {
      hintSegments: [],
      shouldCorrectPath: false,
      correctionPath: null,
      nextHintStart: 0,
    };
  }

  // ✅ NEW: Find LAST occurrence of last node position in solution
  let lastNodeIndex = solutionPoints.length - 1; // Default: end of solution
  if (nodes && nodes.length > 0) {
    const lastNode = nodes[nodes.length - 1];
    // Find the LAST occurrence where the last node appears in solution
    for (let i = solutionPoints.length - 1; i >= 0; i--) {
      if (pointsEqual(solutionPoints[i], lastNode.position)) {
        lastNodeIndex = i;
        break;
      }
    }
  }

  // ============================================
  // CASE 0: Empty player path - first hint
  // ============================================
  if (playerPath.length === 0) {
    const hintSegments = generateHintPath(solutionPoints, 0);
    if (hintSegments.length === 0) {
      return {
        hintSegments: [],
        shouldCorrectPath: false,
        correctionPath: null,
        nextHintStart: 0,
      };
    }

    return {
      hintSegments,
      shouldCorrectPath: false,
      correctionPath: null,
      nextHintStart: Math.min(5, solutionPoints.length),
    };
  }

  // Convert player path to points for comparison
  let playerPoints: Point[];
  try {
    playerPoints = convertPathToPoints(playerPath);
  } catch (error) {
    console.error("❌ Error converting player path:", error);
    return {
      hintSegments: [],
      shouldCorrectPath: false,
      correctionPath: null,
      nextHintStart: 0,
    };
  }

  // ============================================
  // STEP 1: Find where player path matches solution
  // ============================================
  const matchIndex = findLastCorrectIndex(playerPoints, solutionPoints);

  // ============================================
  // Check: Player reached solution end?
  // ============================================
  if (playerPoints.length > 0 && matchIndex === solutionPoints.length - 1) {
    return {
      hintSegments: [],
      shouldCorrectPath: false,
      correctionPath: null,
      nextHintStart: solutionPoints.length,
    };
  }

  // ============================================
  // CASE A: PLAYER PATH IS CORRECT
  // matchIndex === playerLength - 1 means entire player path is correct
  // ============================================
  if (matchIndex === playerPoints.length - 1) {
    const extendStartIndex = matchIndex + 1;
    
    // ✅ CRITICAL NEW CHECK: Don't hint beyond last node
    if (extendStartIndex > lastNodeIndex) {
      return {
        hintSegments: [],
        shouldCorrectPath: false,
        correctionPath: null,
        nextHintStart: solutionPoints.length,
      };
    }
    
    if (extendStartIndex >= solutionPoints.length) {
      return {
        hintSegments: [],
        shouldCorrectPath: false,
        correctionPath: null,
        nextHintStart: solutionPoints.length,
      };
    }

    // ✅ CRITICAL: Limit hint end to lastNodeIndex, not beyond
    const hintEndIndex = Math.min(extendStartIndex + 5, lastNodeIndex + 1);
    const hintSegments = generateHintPath(solutionPoints, extendStartIndex, hintEndIndex);
    
    if (hintSegments.length === 0) {
      return {
        hintSegments: [],
        shouldCorrectPath: false,
        correctionPath: null,
        nextHintStart: extendStartIndex,
      };
    }

    // ✅ CASE A: No correction needed - just extend
    return {
      hintSegments,
      shouldCorrectPath: false,
      correctionPath: null,
      nextHintStart: extendStartIndex + hintSegments.length,
    };
  }

  // ============================================
  // CASE B: PLAYER PATH IS WRONG
  // matchIndex < playerLength - 1 means player diverged
  // ============================================
  const mismatchIndex = matchIndex + 1;
  
  // FIX APPLIED: ISSUE 4 - PATH CORRECTION ON WRONG HINT REMOVES TOO MUCH
  // What was wrong: Correction could wipe nearly entire path if divergence was early
  // What changed: Guard that only corrects if last 3 cells or fewer are wrong
  
  // Calculate how many cells are wrong
  const wrongCellCount = playerPoints.length - mismatchIndex;
  
  if (wrongCellCount > 3) {
    // Too much wrong to silently correct — just show hint direction instead
    // Show hint from divergence point without correcting
    const hintEndIndex = Math.min(mismatchIndex + 5, lastNodeIndex + 1);
    const hintSegments = generateHintPath(solutionPoints, mismatchIndex, hintEndIndex);
    return {
      hintSegments,
      shouldCorrectPath: false,
      correctionPath: null,
      nextHintStart: mismatchIndex + hintSegments.length,
    };
  }

  // ✅ NEW: Don't allow correction beyond last node
  if (mismatchIndex > lastNodeIndex) {
    return {
      hintSegments: [],
      shouldCorrectPath: false,
      correctionPath: null,
      nextHintStart: solutionPoints.length,
    };
  }

  // ✅ STEP 1: Take ONLY correct portion (do NOT include wrong divergence)
  const correctPlayerPoints: Point[] = playerPoints.slice(0, mismatchIndex);
  
  // ✅ STEP 2: Get next solution steps from mismatch point (but limit to lastNodeIndex)
  const correctionEndIndex = Math.min(mismatchIndex + 5, lastNodeIndex + 1);
  const remainingSteps: Point[] = solutionPoints.slice(mismatchIndex, correctionEndIndex);
  
  if (remainingSteps.length === 0) {
    // No more steps available before last node
    return {
      hintSegments: [],
      shouldCorrectPath: false,
      correctionPath: null,
      nextHintStart: solutionPoints.length,
    };
  }

  // ✅ STEP 3: CRITICAL MERGE - Check for overlap BEFORE merging
  const lastCorrectPoint = correctPlayerPoints[correctPlayerPoints.length - 1];
  const firstRemainPoint = remainingSteps[0];
  
  // If last correct point equals first remaining point, remove the duplicate
  let mergedPoints: Point[];
  if (pointsEqual(lastCorrectPoint, firstRemainPoint)) {
    // Merge without duplication
    mergedPoints = [
      ...correctPlayerPoints,
      ...remainingSteps.slice(1), // Skip the duplicate first point
    ];
  } else {
    // Direct merge (should only happen if mismatchIndex points to a new solution cell)
    mergedPoints = [
      ...correctPlayerPoints,
      ...remainingSteps,
    ];
  }

  // ✅ STEP 4: STRICT VALIDATION - No duplicates allowed
  const correctionPath = buildSegmentsFromPoints(mergedPoints);
  
  if (correctionPath.length === 0) {
    // Fallback: show hint without correction (limited to lastNodeIndex)
    const hintEndIndex = Math.min(mismatchIndex + 5, lastNodeIndex + 1);
    const hintSegments = generateHintPath(solutionPoints, mismatchIndex, hintEndIndex);
    return {
      hintSegments,
      shouldCorrectPath: false,
      correctionPath: null,
      nextHintStart: mismatchIndex + hintSegments.length,
    };
  }

  // ✅ STEP 5: Generate hint segments (the NEW guidance portion, limited to lastNodeIndex)
  const hintEndIndex = Math.min(mismatchIndex + 5, lastNodeIndex + 1);
  const hintSegments = generateHintPath(solutionPoints, mismatchIndex, hintEndIndex);

  // FIX APPLIED: ISSUE 2 - HINT STILL SHOWS DIAGONAL OR JUMPING PATHS
  // What was wrong: Hint segments could contain non-adjacent points without expansion
  // What changed: Added final validation pass to ensure all segments are 4-directional
  
  // ✅ FINAL VALIDATION: Ensure all hintSegments are strictly 4-directional
  for (const seg of hintSegments) {
    const dx = Math.abs(seg.to.x - seg.from.x);
    const dy = Math.abs(seg.to.y - seg.from.y);
    if (dx + dy !== 1) {
      console.error('❌ HintSystem: Invalid segment after expansion', {
        from: seg.from,
        to: seg.to,
        dx,
        dy,
      });
      // Return empty hint if any segment is invalid
      return {
        hintSegments: [],
        shouldCorrectPath: false,
        correctionPath: [],
        nextHintStart: mismatchIndex,
      };
    }
  }

  return {
    hintSegments,
    shouldCorrectPath: true,
    correctionPath,
    nextHintStart: mismatchIndex + hintSegments.length,
  };
};
