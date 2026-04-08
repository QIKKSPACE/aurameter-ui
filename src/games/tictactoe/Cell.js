/**
 * Cell.js
 * Animated Tic-Tac-Toe cell with pop-in and glow effects.
 * Accepts dynamic cellSize for NxN boards.
 */

import React, { memo, useEffect, useMemo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Cell = ({ value, index, onPress, theme, isWinningCell, disabled, cellSize = 100 }) => {
    const scale = useSharedValue(1);
    const glow = useSharedValue(0);
    const glowColor = useMemo(
        () => (value === 'X' ? theme.xGlowColor : theme.oGlowColor),
        [value, theme.xGlowColor, theme.oGlowColor],
    );

    useEffect(() => {
        if (value) {
            scale.value = withTiming(1, { duration: 120 });
            glow.value = withTiming(0.3, { duration: 200 });
        } else {
            scale.value = 1;
            glow.value = 0;
        }
    }, [value, scale, glow]);

    const pieceStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: value ? interpolate(scale.value, [0, 1], [0, 1]) : 0,
    }));

    const glowStyle = useAnimatedStyle(() => {
        return {
            shadowColor: glowColor,
            shadowOpacity: interpolate(glow.value, [0, 1], [0, 0.8]),
            shadowRadius: interpolate(glow.value, [0, 1], [0, 20]),
            elevation: interpolate(glow.value, [0, 1], [0, 10]),
        };
    });

    const renderPiece = () => {
        if (!value) return null;

        const color = value === 'X' ? theme.xColor : theme.oColor;
        const fontSize = cellSize * 0.5;

        return (
            <Animated.Text
                style={[
                    styles.pieceText,
                    pieceStyle,
                    { color, fontSize, fontWeight: '900' },
                ]}
            >
                {value}
            </Animated.Text>
        );
    };

    return (
        <AnimatedTouchable
            onPress={() => !disabled && !value && onPress(index)}
            activeOpacity={0.7}
            disabled={disabled || !!value}
            style={[
                styles.cell,
                glowStyle,
                {
                    backgroundColor: theme.cellBg,
                    borderColor: isWinningCell ? theme.winLineColor : theme.cellBorder,
                    borderWidth: isWinningCell ? 3 : 2,
                    width: cellSize,
                    height: cellSize,
                },
            ]}
        >
            {renderPiece()}
        </AnimatedTouchable>
    );
};

const styles = StyleSheet.create({
    cell: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        margin: 4,
        shadowOffset: { width: 0, height: 4 },
    },
    pieceText: {
        textAlign: 'center',
        fontFamily: undefined,
    },
});

export default memo(Cell);
