import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import PremiumTube from './PremiumTube';
import { isTubeComplete } from '../../engine/ballSortEngine';

const PremiumTubeGrid = ({ 
  tubes, 
  capacity, 
  ballSize = 42,
  selectedTube,
  movingBallState = null, // { fromIdx, toIdx }
  onTubeLayout,
  onTubePress,
  layoutKey
}) => {
  const [gridWidth, setGridWidth] = useState(0);
  const [gridHeight, setGridHeight] = useState(0);

  const rowSize = tubes.length <= 12 ? 6 : 7;
  const tubeWidth = ballSize + 12;
  const horizontalGap = 10;
  const verticalGap = 40;
  const tubeHeight = (capacity * ballSize) + 20;

  useEffect(() => {
    if (gridWidth === 0 || gridHeight === 0 || !onTubeLayout) return;

    const numRows = Math.ceil(tubes.length / rowSize);
    const totalHeight = (numRows * tubeHeight) + ((numRows - 1) * verticalGap);
    // Ensure we don't start above 0 if grid is too small
    const startY = Math.max(0, (gridHeight - totalHeight) / 2);

    for (let tubeIndex = 0; tubeIndex < tubes.length; tubeIndex++) {
      const rowIndex = Math.floor(tubeIndex / rowSize);
      const colIndex = tubeIndex % rowSize;

      const itemsInThisRow = Math.min(rowSize, tubes.length - rowIndex * rowSize);
      const rowWidth = (itemsInThisRow * tubeWidth) + ((itemsInThisRow - 1) * horizontalGap);
      const startX = (gridWidth - rowWidth) / 2;

      const x = startX + (colIndex * (tubeWidth + horizontalGap));
      const y = startY + (rowIndex * (tubeHeight + verticalGap));

      onTubeLayout(tubeIndex, { x, y, width: tubeWidth, height: tubeHeight });
    }
  }, [gridWidth, gridHeight, tubes.length, rowSize, tubeWidth, horizontalGap, verticalGap, tubeHeight, onTubeLayout, layoutKey]);

  if (gridWidth === 0 || gridHeight === 0) {
    return (
      <View 
        style={{ flex: 1 }} 
        onLayout={(e) => {
          setGridWidth(e.nativeEvent.layout.width);
          setGridHeight(e.nativeEvent.layout.height);
        }} 
      />
    );
  }

  const numRows = Math.ceil(tubes.length / rowSize);
  const totalHeight = (numRows * tubeHeight) + ((numRows - 1) * verticalGap);
  const startY = Math.max(0, (gridHeight - totalHeight) / 2);

  return (
    <View style={styles.gridContainer} pointerEvents="box-none">
      {tubes.map((tube, tubeIndex) => {
        const complete = isTubeComplete(tube, capacity);
        const isSelected = tubeIndex === selectedTube;
        
        const movingBallIndex = (movingBallState && movingBallState.fromIdx === tubeIndex) 
          ? tube.length - 1 
          : -1;

        const rowIndex = Math.floor(tubeIndex / rowSize);
        const colIndex = tubeIndex % rowSize;

        const itemsInThisRow = Math.min(rowSize, tubes.length - rowIndex * rowSize);
        const rowWidth = (itemsInThisRow * tubeWidth) + ((itemsInThisRow - 1) * horizontalGap);
        const startX = (gridWidth - rowWidth) / 2;

        const x = startX + (colIndex * (tubeWidth + horizontalGap));
        const y = startY + (rowIndex * (tubeHeight + verticalGap));

        return (
          <TouchableOpacity
            key={`tube-pos-${tubeIndex}`}
            activeOpacity={0.9}
            onPress={() => onTubePress?.(tubeIndex)}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: tubeWidth,
              height: tubeHeight,
            }}
          >
            <PremiumTube
              tube={tube}
              capacity={capacity}
              ballSize={ballSize}
              isSelected={isSelected}
              isComplete={complete}
              movingBallIndex={movingBallIndex}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1,
    position: 'relative',
  }
});

export default React.memo(PremiumTubeGrid);
