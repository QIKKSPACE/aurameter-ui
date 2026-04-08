/**
 * levelManager.js
 * Level definitions with board sizes, XP thresholds, and achievement tracking.
 */

export const LEVELS = [
    {
        id: 1,
        name: 'Beginner',
        description: 'Random AI — warm up your skills!',
        aiType: 'random',
        requiredXP: 0,
        icon: '🟢',
        boardSize: 3,
        winLength: 3,
    },
    {
        id: 2,
        name: 'Defender',
        description: 'Defensive AI — it blocks your wins!',
        aiType: 'defensive',
        requiredXP: 100,
        icon: '🔵',
        boardSize: 3,
        winLength: 3,
    },
    {
        id: 3,
        name: 'Strategist',
        description: 'Strategic AI — corners and center first.',
        aiType: 'strategic',
        requiredXP: 250,
        icon: '🟡',
        boardSize: 3,
        winLength: 3,
    },
    {
        id: 4,
        name: 'Tactician',
        description: '4×4 board — thinks 3 moves ahead!',
        aiType: 'limitedMinimax',
        requiredXP: 500,
        icon: '🟠',
        boardSize: 4,
        winLength: 4,
    },
    {
        id: 5,
        name: 'Grandmaster',
        description: '5×5 board — ultimate challenge!',
        aiType: 'fullMinimax',
        requiredXP: 800,
        icon: '🔴',
        boardSize: 5,
        winLength: 5,
    },
];

export const XP_REWARDS = {
    WIN: 50,
    DRAW: 20,
    LOSE: 0,
};

export const ACHIEVEMENTS = [
    {
        id: 'first_win',
        title: 'First Victory',
        description: 'Win your first game!',
        icon: '🏆',
        condition: (stats) => stats.totalWins >= 1,
    },
    {
        id: 'streak_5',
        title: 'On Fire!',
        description: 'Achieve a 5-win streak!',
        icon: '🔥',
        condition: (stats) => stats.bestStreak >= 5,
    },
    {
        id: 'beat_expert',
        title: 'Giant Slayer',
        description: 'Beat the Grandmaster AI!',
        icon: '⚔️',
        condition: (stats) => stats.beatenLevels?.includes(5),
    },
    {
        id: 'ten_wins',
        title: 'Veteran',
        description: 'Win 10 games total!',
        icon: '🎖️',
        condition: (stats) => stats.totalWins >= 10,
    },
    {
        id: 'streak_10',
        title: 'Unstoppable',
        description: 'Achieve a 10-win streak!',
        icon: '💎',
        condition: (stats) => stats.bestStreak >= 10,
    },
    {
        id: 'all_levels',
        title: 'Level Master',
        description: 'Unlock all levels!',
        icon: '👑',
        condition: (stats) => stats.unlockedLevel >= 5,
    },
];

/**
 * Get level config by id.
 */
export const getLevelConfig = (levelId) => {
    return LEVELS.find((l) => l.id === levelId) || LEVELS[0];
};

/**
 * Check if a level is unlocked based on XP.
 */
export const isLevelUnlocked = (levelId, xp) => {
    const level = LEVELS.find((l) => l.id === levelId);
    return level ? xp >= level.requiredXP : false;
};

/**
 * Get the highest unlocked level for a given XP.
 */
export const getHighestUnlockedLevel = (xp) => {
    let highest = 1;
    for (const level of LEVELS) {
        if (xp >= level.requiredXP) {
            highest = level.id;
        }
    }
    return highest;
};

/**
 * Get XP required for the next level.
 */
export const getXPForNextLevel = (currentLevel) => {
    const nextLevel = LEVELS.find((l) => l.id === currentLevel + 1);
    return nextLevel ? nextLevel.requiredXP : null;
};

/**
 * Check which new achievements have been unlocked.
 */
export const checkNewAchievements = (stats, previouslyUnlocked = []) => {
    return ACHIEVEMENTS.filter(
        (a) => !previouslyUnlocked.includes(a.id) && a.condition(stats),
    );
};

export default {
    LEVELS,
    XP_REWARDS,
    ACHIEVEMENTS,
    getLevelConfig,
    isLevelUnlocked,
    getHighestUnlockedLevel,
    getXPForNextLevel,
    checkNewAchievements,
};
