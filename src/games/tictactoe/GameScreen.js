import React, { useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTicTacToeContext } from './TicTacToeContext';
import AnimatedBackground from './AnimatedBackground';
import Board from './Board';
import XPBar from './XPBar';
import { LEVELS } from './levelManager';

const GameScreen = ({ navigation, route }) => {
    const level = route?.params?.level || 1;
    const gameKey = route?.params?.gameKey || 0;
    const {
        board, isPlayerTurn, gameOver, result, currentLevel,
        isAIThinking, xp, streak, theme, xpProgress, xpGained,
        newAchievements, makePlayerMove, resetGame,
        boardSize,
    } = useTicTacToeContext();

    useEffect(() => {
        resetGame(level);
    }, [level, gameKey, resetGame]);

    const handleCellPress = useCallback(
        (index) => {
            makePlayerMove(index);
        },
        [makePlayerMove],
    );

    const levelMeta = useMemo(
        () => LEVELS.find((item) => item.id === currentLevel),
        [currentLevel],
    );

    const statusLabel = useMemo(() => {
        if (gameOver && result?.winner === 'X') return 'Victory';
        if (gameOver && result?.winner === 'O') return 'Defeat';
        if (gameOver && result?.isDraw) return 'Draw';
        if (isAIThinking) return 'AI thinking';
        return 'Your turn';
    }, [gameOver, isAIThinking, result]);

    const statusTone = useMemo(() => {
        if (gameOver && result?.winner === 'X') return theme.accentColor;
        if (gameOver && result?.winner === 'O') return theme.xColor;
        if (gameOver && result?.isDraw) return '#E7C67A';
        if (isAIThinking) return theme.oColor;
        return theme.textColor;
    }, [gameOver, isAIThinking, result, theme]);

    const resultTitle = useMemo(() => {
        if (result?.winner === 'X') return 'You won';
        if (result?.winner === 'O') return 'You lost';
        return 'Match drawn';
    }, [result]);

    const resultSubtitle = useMemo(() => {
        if (result?.winner === 'X') return 'Good game. Clean finish.';
        if (result?.winner === 'O') return 'The AI found the better line.';
        return 'No winner this round.';
    }, [result]);

    const resultEmoji = useMemo(() => {
        if (result?.winner === 'X') return '🏆';
        if (result?.winner === 'O') return '🤖';
        return '🤝';
    }, [result]);

    const handlePlayAgain = useCallback(() => {
        resetGame(currentLevel);
    }, [currentLevel, resetGame]);

    const handleBackToLevels = useCallback(() => {
        navigation.replace('TicTacToeLevels');
    }, [navigation]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <AnimatedBackground theme={theme} />

            <View style={styles.content}>
                <View style={[styles.topBar, { backgroundColor: theme.cardBg, borderColor: theme.boardBorder }]}>
                    <View>
                        <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>
                            Level {currentLevel}
                        </Text>
                        <Text style={[styles.levelName, { color: theme.textColor }]}>
                            {levelMeta?.name || 'Challenge'}
                        </Text>
                    </View>
                    <View style={styles.topBarRight}>
                        <View style={[styles.statusChip, { backgroundColor: `${statusTone}22`, borderColor: `${statusTone}55` }]}>
                            <Text style={[styles.statusChipText, { color: statusTone }]}>
                                {statusLabel}
                            </Text>
                        </View>
                        <Text style={[styles.streakText, { color: theme.textSecondary }]}>
                            Streak {streak}
                        </Text>
                    </View>
                </View>

                <View style={[styles.boardShell, { backgroundColor: `${theme.boardColor}D0`, borderColor: theme.boardBorder }]}>
                    <View style={styles.boardHeaderRow}>
                        <Text style={[styles.boardHeaderTitle, { color: theme.textColor }]}>
                            Make your best move
                        </Text>
                        <Text style={[styles.boardHeaderMeta, { color: theme.textSecondary }]}>
                            {boardSize}x{boardSize} board
                        </Text>
                    </View>

                    <Board
                        board={board}
                        onCellPress={handleCellPress}
                        theme={theme}
                        result={result}
                        disabled={!isPlayerTurn || gameOver || isAIThinking}
                        boardSize={boardSize}
                    />
                </View>

                <View style={[styles.footerPanel, { backgroundColor: theme.cardBg, borderColor: theme.boardBorder }]}>
                    <XPBar xp={xp} progress={xpProgress} theme={theme} compact />
                </View>
            </View>

            {gameOver && result && (
                <View style={styles.resultBackdrop}>
                    <View style={[styles.resultCard, { backgroundColor: theme.cardBg, borderColor: theme.boardBorder }]}>
                        <Text style={styles.resultEmoji}>{resultEmoji}</Text>
                        <Text style={[styles.resultTitle, { color: theme.textColor }]}>
                            {resultTitle}
                        </Text>
                        <Text style={[styles.resultSubtitle, { color: theme.textSecondary }]}>
                            {resultSubtitle}
                        </Text>

                        <View style={styles.resultStatsRow}>
                            <View style={[styles.resultStatCard, { backgroundColor: '#151515', borderColor: theme.boardBorder }]}>
                                <Text style={[styles.resultStatLabel, { color: theme.textSecondary }]}>
                                    XP
                                </Text>
                                <Text style={[styles.resultStatValue, { color: theme.accentColor }]}>
                                    +{xpGained}
                                </Text>
                            </View>
                            <View style={[styles.resultStatCard, { backgroundColor: '#151515', borderColor: theme.boardBorder }]}>
                                <Text style={[styles.resultStatLabel, { color: theme.textSecondary }]}>
                                    Level
                                </Text>
                                <Text style={[styles.resultStatValue, { color: theme.textColor }]}>
                                    {currentLevel}
                                </Text>
                            </View>
                        </View>

                        {newAchievements.length > 0 && (
                            <View style={[styles.achievementPanel, { backgroundColor: '#151515', borderColor: theme.boardBorder }]}>
                                <Text style={[styles.achievementHeading, { color: theme.accentColor }]}>
                                    New achievement
                                </Text>
                                {newAchievements.map((achievement) => (
                                    <Text
                                        key={achievement.id}
                                        style={[styles.achievementText, { color: theme.textColor }]}
                                    >
                                        {achievement.icon} {achievement.title}
                                    </Text>
                                ))}
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.primaryAction}
                            onPress={handlePlayAgain}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={theme.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.primaryActionGradient}
                            >
                                <Text style={styles.primaryActionText}>Play Again</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryAction, { borderColor: theme.boardBorder, backgroundColor: '#151515' }]}
                            onPress={handleBackToLevels}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.secondaryActionText, { color: theme.textColor }]}>
                                Back to Levels
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
        alignItems: 'stretch',
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 40,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 16,
        marginBottom: 18,
    },
    eyebrow: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    levelName: {
        fontSize: 24,
        fontWeight: '800',
    },
    topBarRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    statusChip: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    statusChipText: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    streakText: {
        fontSize: 13,
        fontWeight: '600',
    },
    boardShell: {
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 28,
        paddingTop: 18,
        paddingHorizontal: 12,
        paddingBottom: 14,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 15,
    },
    boardHeaderRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 14,
    },
    boardHeaderTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    boardHeaderMeta: {
        fontSize: 12,
        fontWeight: '600',
    },
    footerPanel: {
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    resultBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    resultCard: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 28,
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    resultEmoji: {
        fontSize: 56,
        textAlign: 'center',
        marginBottom: 12,
    },
    resultTitle: {
        fontSize: 30,
        fontWeight: '800',
        textAlign: 'center',
    },
    resultSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 6,
        marginBottom: 18,
    },
    resultStatsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 14,
    },
    resultStatCard: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: 'center',
    },
    resultStatLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    resultStatValue: {
        fontSize: 22,
        fontWeight: '800',
    },
    achievementPanel: {
        borderWidth: 1,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
    },
    achievementHeading: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    achievementText: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    primaryAction: {
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 10,
    },
    primaryActionGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryActionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    secondaryAction: {
        borderWidth: 1,
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: 'center',
    },
    secondaryActionText: {
        fontSize: 15,
        fontWeight: '700',
    },
});

export default GameScreen;
