/**
 * GameHeader.js
 * Displays current level, turn indicator, and win streak badge.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withTiming,
    useSharedValue,
} from 'react-native-reanimated';
import { LEVELS } from './levelManager';

const GameHeader = ({ currentLevel, isPlayerTurn, streak, theme, isAIThinking }) => {
    const level = LEVELS.find((l) => l.id === currentLevel);
    const pulseOpacity = useSharedValue(1);

    React.useEffect(() => {
        if (isAIThinking) {
            pulseOpacity.value = withRepeat(
                withTiming(0.4, { duration: 600 }),
                -1,
                true,
            );
        } else {
            pulseOpacity.value = withTiming(1, { duration: 200 });
        }
    }, [isAIThinking, pulseOpacity]);

    const thinkingStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
    }));

    return (
        <View style={[styles.container, { backgroundColor: theme.cardBg }]}>
            <View style={styles.row}>
                {/* Level info */}
                <View style={styles.levelContainer}>
                    <Text style={[styles.levelIcon]}>{level?.icon || '🎮'}</Text>
                    <View>
                        <Text style={[styles.levelName, { color: theme.textColor }]}>
                            {level?.name || 'Level'}
                        </Text>
                        <Text style={[styles.levelNum, { color: theme.textSecondary }]}>
                            Level {currentLevel}
                        </Text>
                    </View>
                </View>

                {/* Turn indicator */}
                <Animated.View style={[styles.turnContainer, thinkingStyle]}>
                    <Text style={[styles.turnText, { color: theme.textColor }]}>
                        {isAIThinking ? '🤖 AI Thinking...' : '👆 Your Turn'}
                    </Text>
                </Animated.View>

                {/* Streak */}
                {streak > 0 && (
                    <View style={[styles.streakBadge, { backgroundColor: `${theme.accentColor}30` }]}>
                        <Text style={[styles.streakText, { color: theme.accentColor }]}>
                            🔥 {streak}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 20,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    levelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    levelIcon: {
        fontSize: 24,
    },
    levelName: {
        fontSize: 14,
        fontWeight: '700',
    },
    levelNum: {
        fontSize: 11,
        fontWeight: '500',
    },
    turnContainer: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    turnText: {
        fontSize: 13,
        fontWeight: '600',
    },
    streakBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    streakText: {
        fontSize: 14,
        fontWeight: '700',
    },
});

export default memo(GameHeader);
