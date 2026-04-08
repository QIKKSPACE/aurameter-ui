/**
 * ResultScreen.js
 * Win/Lose/Draw result with XP gained animation, achievements unlocked,
 * and Play Again / Home buttons. Includes confetti effect for wins.
 */

import React, { useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    BounceIn,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useTicTacToeContext } from './TicTacToeContext';
import AnimatedBackground from './AnimatedBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Simple confetti particles ───
const ConfettiPiece = ({ index }) => {
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(1);

    const startX = useMemo(() => Math.random() * SCREEN_WIDTH, []);
    const color = useMemo(() => {
        const colors = ['#FF006E', '#00F5FF', '#FFE66D', '#66FCF1', '#FF6B6B', '#A855F7'];
        return colors[index % colors.length];
    }, [index]);
    const size = useMemo(() => 6 + Math.random() * 10, []);

    useEffect(() => {
        const delay = index * 100;
        translateY.value = withDelay(
            delay,
            withTiming(600 + Math.random() * 400, {
                duration: 2500 + Math.random() * 1500,
                easing: Easing.out(Easing.ease),
            }),
        );
        translateX.value = withDelay(
            delay,
            withTiming((Math.random() - 0.5) * 200, {
                duration: 2500,
                easing: Easing.inOut(Easing.ease),
            }),
        );
        rotate.value = withDelay(
            delay,
            withTiming(720 + Math.random() * 360, { duration: 3000 }),
        );
        opacity.value = withDelay(
            delay + 1500,
            withTiming(0, { duration: 1000 }),
        );
    }, [index, translateY, translateX, rotate, opacity]);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { rotate: `${rotate.value}deg` },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.confetti,
                style,
                {
                    left: startX,
                    width: size,
                    height: size * 1.5,
                    backgroundColor: color,
                    borderRadius: size / 4,
                },
            ]}
        />
    );
};

const ResultScreen = ({ navigation, route }) => {
    const {
        winner,
        isDraw,
        xpGained = 0,
        level = 1,
        newAchievements = [],
    } = route?.params || {};
    const { theme } = useTicTacToeContext();

    const isWin = winner === 'X';
    const isLose = winner === 'O';

    // ─── Trophy pulse animation ───
    const trophyScale = useSharedValue(1);
    useEffect(() => {
        if (isWin) {
            trophyScale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
                ),
                3,
                false,
            );
        }
    }, [isWin, trophyScale]);

    const trophyStyle = useAnimatedStyle(() => ({
        transform: [{ scale: trophyScale.value }],
    }));

    const getResultTitle = () => {
        if (isWin) return 'Victory!';
        if (isDraw) return 'Draw!';
        return 'Defeat!';
    };

    const getResultEmoji = () => {
        if (isWin) return '🏆';
        if (isDraw) return '🤝';
        return '😤';
    };

    const getResultSubtitle = () => {
        if (isWin) return 'You crushed the AI!';
        if (isDraw) return "It's a tie. Try harder!";
        return 'The AI wins this time.';
    };

    const handlePlayAgain = () => {
        navigation.replace('TicTacToeGame', { level, gameKey: Date.now() });
    };

    const handleHome = () => {
        navigation.replace('TicTacToeLevels');
    };

    const confettiPieces = useMemo(
        () => (isWin ? Array.from({ length: 20 }, (_, i) => i) : []),
        [isWin],
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <AnimatedBackground theme={theme} />

            {/* Confetti for wins */}
            {confettiPieces.map((i) => (
                <ConfettiPiece key={i} index={i} />
            ))}

            <View style={styles.content}>
                {/* Result emoji */}
                <Animated.View entering={BounceIn.delay(200)} style={trophyStyle}>
                    <Text style={styles.resultEmoji}>{getResultEmoji()}</Text>
                </Animated.View>

                {/* Result title */}
                <Animated.Text
                    entering={FadeInDown.delay(400).springify()}
                    style={[styles.resultTitle, { color: theme.textColor }]}
                >
                    {getResultTitle()}
                </Animated.Text>

                <Animated.Text
                    entering={FadeInDown.delay(500).springify()}
                    style={[styles.resultSubtitle, { color: theme.textSecondary }]}
                >
                    {getResultSubtitle()}
                </Animated.Text>

                {/* XP Gained */}
                <Animated.View
                    entering={FadeInDown.delay(700).springify()}
                    style={[styles.xpCard, { backgroundColor: theme.cardBg }]}
                >
                    <Text style={[styles.xpLabel, { color: theme.textSecondary }]}>
                        XP Earned
                    </Text>
                    <Text style={[styles.xpValue, { color: theme.accentColor }]}>
                        +{xpGained}
                    </Text>
                </Animated.View>

                {/* New Achievements */}
                {newAchievements.length > 0 && (
                    <Animated.View
                        entering={FadeInDown.delay(900).springify()}
                        style={[styles.achievementCard, { backgroundColor: theme.cardBg }]}
                    >
                        <Text style={[styles.achievementTitle, { color: theme.accentColor }]}>
                            🎉 Achievement Unlocked!
                        </Text>
                        {newAchievements.map((a) => (
                            <View key={a.id} style={styles.achievementRow}>
                                <Text style={styles.achievementEmoji}>{a.icon}</Text>
                                <Text style={[styles.achievementName, { color: theme.textColor }]}>
                                    {a.title}
                                </Text>
                            </View>
                        ))}
                    </Animated.View>
                )}

                {/* Action Buttons */}
                <Animated.View style={styles.buttonGroup} entering={FadeInUp.delay(1000).springify()}>
                    <TouchableOpacity
                        onPress={handlePlayAgain}
                        activeOpacity={0.85}
                        style={styles.primaryButtonWrapper}
                    >
                        <LinearGradient
                            colors={theme.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.primaryButton}
                        >
                            <Text style={styles.primaryButtonText}>
                                {isLose ? '🔄 Retry' : '▶ Play Again'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleHome}
                        style={[styles.secondaryButton, { backgroundColor: theme.cardBg }]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.secondaryButtonText, { color: theme.textColor }]}>
                            🏠 Home
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    confetti: {
        position: 'absolute',
        top: -10,
    },
    resultEmoji: {
        fontSize: 80,
        textAlign: 'center',
        marginBottom: 12,
    },
    resultTitle: {
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: 2,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
        marginBottom: 4,
    },
    resultSubtitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 24,
    },
    xpCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 16,
        gap: 12,
        marginBottom: 12,
    },
    xpLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    xpValue: {
        fontSize: 28,
        fontWeight: '900',
    },
    achievementCard: {
        padding: 16,
        borderRadius: 16,
        width: SCREEN_WIDTH - 80,
        marginBottom: 12,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 12,
    },
    achievementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 6,
    },
    achievementEmoji: {
        fontSize: 22,
    },
    achievementName: {
        fontSize: 15,
        fontWeight: '700',
    },
    buttonGroup: {
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
        gap: 12,
    },
    primaryButtonWrapper: {
        width: SCREEN_WIDTH - 80,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    primaryButton: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 1,
    },
    secondaryButton: {
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 16,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ResultScreen;
