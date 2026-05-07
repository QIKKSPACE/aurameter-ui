/**
 * TicTacToeHomeScreen.js
 * Main entry screen for the Tic-Tac-Toe game module.
 * Features animated title, action buttons, XP bar, streak display, and theme selector.
 */

import React, { useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    FadeInDown,
    FadeInUp,
    Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useTicTacToeContext } from './TicTacToeContext';
import AnimatedBackground from './AnimatedBackground';
import ThemeSelector from './ThemeSelector';
import XPBar from './XPBar';
import { ACHIEVEMENTS } from './levelManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TicTacToeHomeScreen = ({ navigation }) => {
    const {
        xp, streak, bestStreak, unlockedLevel, achievements,
        totalWins, theme, themeId, changeTheme, xpProgress,
    } = useTicTacToeContext();

    const themeSelectorRef = useRef(null);

    // ─── Animated title ───
    const titleScale = useSharedValue(1);
    React.useEffect(() => {
        titleScale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            false,
        );
    }, [titleScale]);

    const titleAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: titleScale.value }],
    }));

    const handlePlay = useCallback(() => {
        navigation.navigate('TicTacToeGame', { level: unlockedLevel });
    }, [navigation, unlockedLevel]);

    const handleLevels = useCallback(() => {
        navigation.navigate('TicTacToeLevels');
    }, [navigation]);

    const handleOpenThemes = useCallback(() => {
        themeSelectorRef.current?.open();
    }, []);

    const unlockedAchievements = ACHIEVEMENTS.filter((a) =>
        achievements.includes(a.id),
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <AnimatedBackground theme={theme} />

            <View style={styles.content}>
                {/* Title */}
                <Animated.View style={[styles.titleContainer, titleAnimStyle]} entering={FadeInDown.delay(200).springify()}>
                    <Text style={[styles.titleEmoji]}>🎮</Text>
                    <Text style={[styles.title, { color: theme.textColor }]}>
                        Tic Tac Toe
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Challenge the AI
                    </Text>
                </Animated.View>

                {/* Stats Row */}
                <Animated.View style={styles.statsRow} entering={FadeInDown.delay(400).springify()}>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                        <Text style={styles.statIcon}>🏆</Text>
                        <Text style={[styles.statValue, { color: theme.textColor }]}>{totalWins}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Wins</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                        <Text style={styles.statIcon}>🔥</Text>
                        <Text style={[styles.statValue, { color: theme.accentColor }]}>{streak}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Streak</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                        <Text style={styles.statIcon}>⭐</Text>
                        <Text style={[styles.statValue, { color: theme.textColor }]}>{bestStreak}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Best</Text>
                    </View>
                </Animated.View>

                {/* XP Bar */}
                <Animated.View entering={FadeInDown.delay(500).springify()}>
                    <XPBar xp={xp} progress={xpProgress} theme={theme} />
                </Animated.View>

                {/* Achievements Row */}
                {unlockedAchievements.length > 0 && (
                    <Animated.View
                        style={[styles.achievementsRow, { backgroundColor: theme.cardBg }]}
                        entering={FadeInDown.delay(600).springify()}
                    >
                        <Text style={[styles.achievementsLabel, { color: theme.textSecondary }]}>
                            Achievements
                        </Text>
                        <View style={styles.achievementIcons}>
                            {unlockedAchievements.map((a) => (
                                <Text key={a.id} style={styles.achievementIcon}>{a.icon}</Text>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* Buttons */}
                <Animated.View style={styles.buttonGroup} entering={FadeInUp.delay(700).springify()}>
                    <TouchableOpacity
                        onPress={handlePlay}
                        activeOpacity={0.85}
                        style={styles.playButtonWrapper}
                    >
                        <LinearGradient
                            colors={theme.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.playButton}
                        >
                            <Text style={styles.playButtonIcon}>▶</Text>
                            <Text style={styles.playButtonText}>Play</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.secondaryRow}>
                        <TouchableOpacity
                            onPress={handleLevels}
                            style={[styles.secondaryButton, { backgroundColor: theme.cardBg }]}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.secondaryButtonIcon}>📊</Text>
                            <Text style={[styles.secondaryButtonText, { color: theme.textColor }]}>
                                Levels
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleOpenThemes}
                            style={[styles.secondaryButton, { backgroundColor: theme.cardBg }]}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.secondaryButtonIcon}>🎨</Text>
                            <Text style={[styles.secondaryButtonText, { color: theme.textColor }]}>
                                Themes
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>

            {/* Theme Bottom Sheet */}
            <ThemeSelector
                ref={themeSelectorRef}
                currentThemeId={themeId}
                onSelectTheme={changeTheme}
                theme={theme}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    titleEmoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    title: {
        fontSize: 40,
        fontWeight: '900',
        letterSpacing: 2,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        minWidth: 80,
    },
    statIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    achievementsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 8,
        gap: 10,
    },
    achievementsLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    achievementIcons: {
        flexDirection: 'row',
        gap: 6,
    },
    achievementIcon: {
        fontSize: 18,
    },
    buttonGroup: {
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
    },
    playButtonWrapper: {
        width: SCREEN_WIDTH - 80,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    playButtonIcon: {
        fontSize: 22,
        color: '#FFF',
    },
    playButtonText: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 2,
    },
    secondaryRow: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 16,
        gap: 8,
    },
    secondaryButtonIcon: {
        fontSize: 18,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});

export default TicTacToeHomeScreen;
