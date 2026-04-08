/**
 * HINT SYSTEM VALIDATION & TESTING
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * This module tests the NEW hint system to ensure:
 * 1. All hints follow Manhattan distance (4-directional only)
 * 2. No diagnostic errors occur
 * 3. Hints are generated correctly from solution paths
 * 4. Path correction works as expected
 */

import { 
  convertPathToPoints,
  generateHint,
  findLastCorrectIndex,
  generateHintPath,
  HintResult
} from './HintSystem';
import type { PathSegment, Point } from './ZipTypes';

/**
 * Validate that all segments in a path follow 4-directional constraint
 * ✅ abs(dx) + abs(dy) === 1
 */
export const validateHintPath = (segments: PathSegment[]): boolean => {
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const dx = Math.abs(seg.to.x - seg.from.x);
    const dy = Math.abs(seg.to.y - seg.from.y);
    
    if (dx + dy !== 1) {
      return false;
    }
  }
  return true;
};

/**
 * Test 1: Empty path gets initial hint
 */
export const testEmptyPathHint = () => {
  const solution: Point[] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
  ];
  
  const result = generateHint([], solution, 0);
  
  return validateHintPath(result.hintSegments);
};

/**
 * Test 2: Correct path gets next steps
 */
export const testCorrectPathHint = () => {
  const solution: Point[] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
  ];
  
  // Player followed first 3 points correctly
  const playerPath: PathSegment[] = [
    { from: { x: 0, y: 0 }, to: { x: 1, y: 0 } },
    { from: { x: 1, y: 0 }, to: { x: 2, y: 0 } },
  ];
  
  const result = generateHint(playerPath, solution, 0);
  
  return validateHintPath(result.hintSegments) && !result.shouldCorrectPath;
};

/**
 * Test 3: Wrong path gets correction
 */
export const testWrongPathCorrection = () => {
  const solution: Point[] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
  ];
  
  // Player took wrong path after (1,0)
  const playerPath: PathSegment[] = [
    { from: { x: 0, y: 0 }, to: { x: 1, y: 0 } },
    { from: { x: 1, y: 0 }, to: { x: 1, y: 1 } }, // ❌ Wrong!
  ];
  
  const result = generateHint(playerPath, solution, 0);
  
  return validateHintPath(result.hintSegments) && result.shouldCorrectPath;
};

/**
 * Test 4: Point conversion maintains 4-directional paths
 */
export const testPointConversion = () => {
  const segments: PathSegment[] = [
    { from: { x: 0, y: 0 }, to: { x: 2, y: 0 } },
    { from: { x: 2, y: 0 }, to: { x: 2, y: 2 } },
  ];
  
  const points = convertPathToPoints(segments);
  
  // Verify points form 4-directional path
  let valid = true;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = Math.abs(points[i + 1].x - points[i].x);
    const dy = Math.abs(points[i + 1].y - points[i].y);
    if (dx + dy !== 1) {
      valid = false;
    }
  }
  
  return valid;
};

/**
 * Run all validation tests
 */
export const runHintSystemValidation = () => {
  const results = [
    testEmptyPathHint(),
    testCorrectPathHint(),
    testWrongPathCorrection(),
    testPointConversion(),
  ];
  
  const allPassed = results.every(r => r === true);
  
  return allPassed;
};
