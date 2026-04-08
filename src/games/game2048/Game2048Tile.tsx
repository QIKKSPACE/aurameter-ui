import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Animated } from 'react-native';
import { Tile } from './Game2048Types';
import { getTileColor, getTileFontSize } from './Game2048Colors';

type Props = {
  tile: Tile;
  cellSize: number;
  gap: number;
  gridPadding: number;
};

export default React.memo(
  function Game2048Tile({ tile, cellSize, gap, gridPadding }: Props) {
    const scale = useRef(new Animated.Value(tile.isNew ? 0 : 1)).current;
    const translateX = useRef(
      new Animated.Value(gridPadding + tile.prevCol * (cellSize + gap))
    ).current;
    const translateY = useRef(
      new Animated.Value(gridPadding + tile.prevRow * (cellSize + gap))
    ).current;

    const colors = getTileColor(tile.value);
    const fontSize = getTileFontSize(tile.value, cellSize);

    const targetX = gridPadding + tile.col * (cellSize + gap);
    const targetY = gridPadding + tile.row * (cellSize + gap);

    useEffect(() => {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: targetX,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: targetY,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }, [tile.col, tile.row, targetX, targetY]);

    useEffect(() => {
      if (tile.isNew) {
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }).start();
      }
    }, [tile.isNew]);

    useEffect(() => {
      if (tile.isMerged) {
        scale.setValue(1);
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [tile.isMerged]);

    const styles = useMemo(
      () =>
        StyleSheet.create({
          tile: {
            position: 'absolute',
            width: cellSize,
            height: cellSize,
            backgroundColor: colors.bg,
            borderRadius: 4,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          },
          text: {
            fontSize: fontSize,
            fontWeight: '700',
            color: colors.text,
            width: cellSize - 8,
            height: cellSize - 8,
            textAlign: 'center',
            textAlignVertical: 'center',
          },
        }),
      [cellSize, colors, fontSize]
    );

    return (
      <Animated.View
        style={[
          styles.tile,
          {
            transform: [
              { translateX },
              { translateY },
              { scale },
            ],
          },
        ]}
      >
        <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit>
          {tile.value}
        </Text>
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.tile.id === nextProps.tile.id &&
      prevProps.tile.value === nextProps.tile.value &&
      prevProps.tile.row === nextProps.tile.row &&
      prevProps.tile.col === nextProps.tile.col &&
      prevProps.tile.isNew === nextProps.tile.isNew &&
      prevProps.tile.isMerged === nextProps.tile.isMerged &&
      prevProps.cellSize === nextProps.cellSize &&
      prevProps.gap === nextProps.gap &&
      prevProps.gridPadding === nextProps.gridPadding
    );
  }
);
