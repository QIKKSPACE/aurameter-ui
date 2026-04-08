/**
 * XPBar.js
 * Animated gradient XP progress bar.
 */

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const BAR_WIDTH = Dimensions.get('window').width - 80;

const XPBar = ({ xp, progress, theme, compact = false }) => {
    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withTiming(progress, {
            duration: 800,
            easing: Easing.out(Easing.ease),
        });
    }, [progress, animatedProgress]);

    const barStyle = useAnimatedStyle(() => ({
        width: interpolate(
            animatedProgress.value,
            [0, 1],
            [0, compact ? BAR_WIDTH * 0.6 : BAR_WIDTH],
        ),
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(animatedProgress.value, [0, 0.5, 1], [0.3, 0.6, 1]),
    }));

    const barHeight = compact ? 8 : 14;
    const containerWidth = compact ? BAR_WIDTH * 0.6 : BAR_WIDTH;

    return (
        <View style={[styles.container, compact && styles.containerCompact]}>
            {!compact && (
                <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>
                        ⚡ XP
                    </Text>
                    <Text style={[styles.xpValue, { color: theme.accentColor }]}>
                        {xp}
                    </Text>
                </View>
            )}
            <View
                style={[
                    styles.trackContainer,
                    {
                        width: containerWidth,
                        height: barHeight,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                ]}
            >
                <Animated.View style={[styles.progressBar, barStyle, { height: barHeight }]}>
                    <LinearGradient
                        colors={theme.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.gradient, { borderRadius: barHeight / 2 }]}
                    />
                </Animated.View>
                <Animated.View
                    style={[
                        styles.glow,
                        glowStyle,
                        { backgroundColor: theme.accentColor },
                    ]}
                />
            </View>
            {compact && (
                <Text style={[styles.compactXP, { color: theme.textSecondary }]}>
                    {xp} XP
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 8,
    },
    containerCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: BAR_WIDTH,
        marginBottom: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
    },
    xpValue: {
        fontSize: 14,
        fontWeight: '800',
    },
    trackContainer: {
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    progressBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
    },
    glow: {
        position: 'absolute',
        right: 0,
        top: -2,
        width: 8,
        height: '140%',
        borderRadius: 4,
        opacity: 0,
    },
    compactXP: {
        fontSize: 12,
        fontWeight: '700',
    },
});

export default memo(XPBar);
