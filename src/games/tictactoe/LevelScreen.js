/**
 * LevelScreen.js
 * Level selector showing locked/unlocked levels, AI description, and XP requirements.
 */

import React, { useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import { useToast } from '../../constants/context/ErrorContext';
import { updateUserData } from '../../store/userSlice';
import { claimAura } from '../../store/ticTacToeSlice';
import { useTicTacToeContext } from './TicTacToeContext';
import AnimatedBackground from './AnimatedBackground';
import XPBar from './XPBar';
import { ACHIEVEMENTS, LEVELS, isLevelUnlocked } from './levelManager';

const LevelScreen = ({ navigation }) => {
    const {
        xp,
        streak,
        bestStreak,
        totalWins,
        achievements,
        xpProgress,
        theme,
        beatenLevels,
    } = useTicTacToeContext();
    const score = useSelector((state) => state.ticTacToe?.score || 0);
    const aura = useSelector((state) => state.ticTacToe?.aura || 0);
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const { showToast } = useToast();
    const [collectingAura, setCollectingAura] = React.useState(false);

    const handleCollectAura = useCallback(async () => {
        if (collectingAura || aura <= 0) return;
        try {
            setCollectingAura(true);
            const response = await api.post('/game/tic-tac-toe', { aura });
            if (response?.data?.success) {
                dispatch(claimAura());
                dispatch(updateUserData({ aura: (user?.userData?.aura || 0) + aura }));
                showToast(`You claimed ${aura} Aura.`, 'success');
            }
        } catch (err) {
            console.log('Claim aura error:', err?.response?.data || err.message);
            showToast('Failed to Claim Aura, Try again', 'error');
        } finally {
            setCollectingAura(false);
        }
    }, [aura, collectingAura, dispatch, showToast, user?.userData?.aura]);

    const handleSelectLevel = useCallback(
        (levelId) => {
            if (isLevelUnlocked(levelId, xp)) {
                navigation.navigate('TicTacToeGame', {
                    level: levelId,
                    gameKey: Date.now(),
                });
            }
        },
        [xp, navigation],
    );

    const unlockedAchievements = useMemo(
        () => ACHIEVEMENTS.filter((achievement) => achievements.includes(achievement.id)),
        [achievements],
    );

    const renderLevelCard = (level, index) => {
        const unlocked = isLevelUnlocked(level.id, xp);
        const beaten = beatenLevels.includes(level.id);

        return (
            <View key={level.id} style={styles.levelItem}>
                <TouchableOpacity
                    onPress={() => handleSelectLevel(level.id)}
                    disabled={!unlocked}
                    activeOpacity={0.8}
                    style={[
                        styles.levelCard,
                        {
                            backgroundColor: unlocked
                                ? theme.cardBg
                                : 'rgba(255,255,255,0.05)',
                            borderColor: beaten
                                ? theme.accentColor
                                : unlocked
                                    ? theme.boardBorder
                                    : 'rgba(255,255,255,0.1)',
                            opacity: unlocked ? 1 : 0.5,
                        },
                    ]}
                >
                    <View style={styles.levelLeft}>
                        <View
                            style={[
                                styles.levelIconBg,
                                {
                                    backgroundColor: unlocked
                                        ? `${theme.accentColor}25`
                                        : 'rgba(255,255,255,0.05)',
                                },
                            ]}
                        >
                            <Text style={styles.levelIcon}>{unlocked ? level.icon : '🔒'}</Text>
                        </View>
                        <View style={styles.levelInfo}>
                            <Text style={[styles.levelName, { color: theme.textColor }]}>
                                {level.name}
                            </Text>
                            <Text style={[styles.xpRequired, { color: theme.accentColor }]}>
                                {level.requiredXP === 0 ? 'Open now' : `${level.requiredXP} XP required`}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.levelRight}>
                        {beaten && (
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: `${theme.accentColor}30` },
                                ]}
                            >
                                <Text style={[styles.statusText, { color: theme.accentColor }]}>
                                    ✓ Beaten
                                </Text>
                            </View>
                        )}
                        {unlocked && !beaten && (
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: 'rgba(255,255,255,0.1)' },
                                ]}
                            >
                                <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                                    Play →
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <AnimatedBackground theme={theme} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.screenEyebrow, { color: theme.accentColor }]}>
                            Tic Tac Toe
                        </Text>
                        <Text style={[styles.screenTitle, { color: theme.textColor }]}>
                            Choose Level
                        </Text>
                    </View>
                    <View style={[styles.xpBadge, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.xpBadgeText, { color: theme.accentColor }]}>
                            ⚡ {xp} XP
                        </Text>
                    </View>
                </View>

                <View
                    style={[styles.statsRow, { backgroundColor: theme.cardBg, borderColor: theme.boardBorder }]}
                >
                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>🏆</Text>
                        <Text style={[styles.statValue, { color: theme.textColor }]}>
                            {totalWins}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                            Wins
                        </Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>🔥</Text>
                        <Text style={[styles.statValue, { color: theme.accentColor }]}>
                            {streak}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                            Streak
                        </Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>⭐</Text>
                        <Text style={[styles.statValue, { color: theme.textColor }]}>
                            {bestStreak}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                            Best
                        </Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>🎯</Text>
                        <Text style={[styles.statValue, { color: theme.accentColor }]}>
                            {score}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                            Score
                        </Text>
                    </View>
                </View>

                <View
                    style={[styles.summaryCard, { backgroundColor: theme.cardBg, borderColor: theme.boardBorder }]}
                >
                    <XPBar xp={xp} progress={xpProgress} theme={theme} />
                    <Text style={[styles.rulesText, { color: theme.textSecondary }]}>
                        Scoring: win + level points, lose - level points. Aura banks from wins and can be claimed anytime when it is above zero.
                    </Text>
                    {aura > 0 && (
                        <View style={{ marginTop: 12, padding: 14, borderRadius: 16, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <Text style={[{ fontSize: 16, fontWeight: '700', marginBottom: 10 }, { color: theme.textColor }]}>
                                Reward Ready: +{aura} AURA
                            </Text>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                disabled={collectingAura}
                                onPress={handleCollectAura}
                                style={{
                                    backgroundColor: collectingAura ? '#94A3B8' : '#22C55E',
                                    paddingHorizontal: 22,
                                    paddingVertical: 12,
                                    borderRadius: 24,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                {collectingAura ? (
                                    <ActivityIndicator size="small" color="#000" />
                                ) : null}
                                <Text style={{ fontWeight: '700', color: '#000' }}>
                                    {collectingAura ? 'COLLECTING...' : 'COLLECT AURA'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {unlockedAchievements.length > 0 && (
                        <View style={styles.achievementRow}>
                            <Text
                                style={[styles.achievementLabel, { color: theme.textSecondary }]}
                            >
                                Achievements
                            </Text>
                            <View style={styles.achievementIcons}>
                                {unlockedAchievements.slice(0, 6).map((achievement) => (
                                    <Text key={achievement.id} style={styles.achievementIcon}>
                                        {achievement.icon}
                                    </Text>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {LEVELS.map((level, index) => renderLevelCard(level, index))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    screenEyebrow: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: '900',
    },
    xpBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    xpBadgeText: {
        fontSize: 14,
        fontWeight: '800',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 8,
        marginBottom: 14,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    statIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 2,
    },
    summaryCard: {
        borderWidth: 1,
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 18,
    },
    rulesText: {
        fontSize: 12,
        lineHeight: 17,
        marginTop: 10,
    },
    achievementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        gap: 12,
    },
    achievementLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
    achievementIcons: {
        flexDirection: 'row',
        flexShrink: 1,
        gap: 6,
    },
    achievementIcon: {
        fontSize: 18,
    },
    levelItem: {
        marginBottom: 12,
    },
    levelCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderRadius: 22,
        borderWidth: 1,
    },
    levelLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    levelIconBg: {
        width: 54,
        height: 54,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    levelIcon: {
        fontSize: 24,
    },
    levelInfo: {
        flex: 1,
    },
    levelName: {
        fontSize: 20,
        fontWeight: '800',
    },
    xpRequired: {
        fontSize: 13,
        fontWeight: '700',
        marginTop: 6,
    },
    levelRight: {
        marginLeft: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
    },
});

export default LevelScreen;
