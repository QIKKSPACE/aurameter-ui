/**
 * useTicTacToe.js
 * Central game logic hook managing board state, AI moves, XP, streaks, achievements,
 * level progression, and AsyncStorage persistence.
 * Supports NxN boards (3×3, 4×4, 5×5).
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkWinner } from './checkWinner';
import { getAIMoveForLevel } from './aiEngine';
import {
    LEVELS,
    XP_REWARDS,
    getHighestUnlockedLevel,
    checkNewAchievements,
    getXPForNextLevel,
    getLevelConfig,
} from './levelManager';
import { getTheme } from './themes';

const STORAGE_KEYS = {
    XP: '@tictactoe_xp',
    STREAK: '@tictactoe_streak',
    BEST_STREAK: '@tictactoe_best_streak',
    UNLOCKED_LEVEL: '@tictactoe_unlocked_level',
    ACHIEVEMENTS: '@tictactoe_achievements',
    TOTAL_WINS: '@tictactoe_total_wins',
    BEATEN_LEVELS: '@tictactoe_beaten_levels',
};

const useTicTacToe = (initialLevel = 1) => {
    // ─── Board config ───
    const [currentLevel, setCurrentLevel] = useState(initialLevel);
    const levelConfig = useMemo(() => getLevelConfig(currentLevel), [currentLevel]);
    const boardSize = levelConfig.boardSize;
    const totalCells = boardSize * boardSize;

    // ─── Core game state ───
    const [board, setBoard] = useState(Array(totalCells).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [result, setResult] = useState(null); // { winner, line, isDraw }
    const [isAIThinking, setIsAIThinking] = useState(false);

    // ─── Progression state ───
    const [xp, setXP] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [unlockedLevel, setUnlockedLevel] = useState(1);
    const [achievements, setAchievements] = useState([]);
    const [totalWins, setTotalWins] = useState(0);
    const [beatenLevels, setBeatenLevels] = useState([]);
    const [newAchievements, setNewAchievements] = useState([]);
    const [xpGained, setXPGained] = useState(0);
    const [finishedGameId, setFinishedGameId] = useState(0);

    // ─── Theme (hardcoded dark) ───
    const theme = useMemo(() => getTheme(), []);

    // ─── Refs ───
    const aiTimeoutRef = useRef(null);
    const xpRef = useRef(xp);
    const streakRef = useRef(streak);
    const bestStreakRef = useRef(bestStreak);
    const totalWinsRef = useRef(totalWins);
    const beatenLevelsRef = useRef(beatenLevels);
    const currentLevelRef = useRef(currentLevel);
    const achievementsRef = useRef(achievements);
    const boardSizeRef = useRef(boardSize);
    const finishedGameIdRef = useRef(0);

    useEffect(() => {
        xpRef.current = xp;
    }, [xp]);
    useEffect(() => {
        streakRef.current = streak;
    }, [streak]);
    useEffect(() => {
        bestStreakRef.current = bestStreak;
    }, [bestStreak]);
    useEffect(() => {
        totalWinsRef.current = totalWins;
    }, [totalWins]);
    useEffect(() => {
        beatenLevelsRef.current = beatenLevels;
    }, [beatenLevels]);
    useEffect(() => {
        currentLevelRef.current = currentLevel;
        boardSizeRef.current = getLevelConfig(currentLevel).boardSize;
    }, [currentLevel]);
    useEffect(() => {
        achievementsRef.current = achievements;
    }, [achievements]);

    // ─── Load persisted data ───
    useEffect(() => {
        const load = async () => {
            try {
                const [
                    savedXP,
                    savedStreak,
                    savedBestStreak,
                    savedUnlockedLevel,
                    savedAchievements,
                    savedTotalWins,
                    savedBeatenLevels,
                ] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.XP),
                    AsyncStorage.getItem(STORAGE_KEYS.STREAK),
                    AsyncStorage.getItem(STORAGE_KEYS.BEST_STREAK),
                    AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVEL),
                    AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS),
                    AsyncStorage.getItem(STORAGE_KEYS.TOTAL_WINS),
                    AsyncStorage.getItem(STORAGE_KEYS.BEATEN_LEVELS),
                ]);

                if (savedXP) setXP(parseInt(savedXP, 10));
                if (savedStreak) setStreak(parseInt(savedStreak, 10));
                if (savedBestStreak) setBestStreak(parseInt(savedBestStreak, 10));
                if (savedUnlockedLevel) setUnlockedLevel(parseInt(savedUnlockedLevel, 10));
                if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
                if (savedTotalWins) setTotalWins(parseInt(savedTotalWins, 10));
                if (savedBeatenLevels) setBeatenLevels(JSON.parse(savedBeatenLevels));

            } catch (e) {
                console.warn('Failed to load TicTacToe data:', e);
            }
        };
        load();
    }, []);

    // ─── Persist helper ───
    const persist = useCallback(async (key, value) => {
        try {
            await AsyncStorage.setItem(
                key,
                typeof value === 'string' ? value : JSON.stringify(value),
            );
        } catch (e) {
            console.warn('Failed to persist:', key, e);
        }
    }, []);

    // ─── Handle game end ───
    const handleGameEnd = useCallback(
        (outcome) => {
            // outcome = 'win' | 'lose' | 'draw'
            const prevXP = xpRef.current;
            const prevStreak = streakRef.current;
            const prevBestStreak = bestStreakRef.current;
            const prevTotalWins = totalWinsRef.current;
            const prevBeatenLevels = beatenLevelsRef.current;
            const prevAchievements = achievementsRef.current;
            const levelAtFinish = currentLevelRef.current;
            const isReplayLevel = prevBeatenLevels.includes(levelAtFinish);

            let gainedXP = 0;
            let newStreak = prevStreak;
            let newTotalWins = prevTotalWins;
            let newBeatenLevels = [...prevBeatenLevels];

            switch (outcome) {
                case 'win':
                    gainedXP = XP_REWARDS.WIN;
                    newStreak = prevStreak + 1;
                    newTotalWins = prevTotalWins + 1;
                    if (!newBeatenLevels.includes(levelAtFinish)) {
                        newBeatenLevels.push(levelAtFinish);
                    }
                    break;
                case 'draw':
                    gainedXP = XP_REWARDS.DRAW;
                    newStreak = 0;
                    break;
                case 'lose':
                    gainedXP = XP_REWARDS.LOSE;
                    newStreak = 0;
                    break;
            }

            if (isReplayLevel) {
                gainedXP = Math.ceil(gainedXP / 2);
            }

            const newXP = prevXP + gainedXP;
            const newBestStreak = Math.max(prevBestStreak, newStreak);
            const newUnlockedLevel = getHighestUnlockedLevel(newXP);

            // Check for new achievements
            const stats = {
                totalWins: newTotalWins,
                bestStreak: newBestStreak,
                beatenLevels: newBeatenLevels,
                unlockedLevel: newUnlockedLevel,
            };
            const freshAchievements = checkNewAchievements(stats, prevAchievements);

            xpRef.current = newXP;
            streakRef.current = newStreak;
            bestStreakRef.current = newBestStreak;
            totalWinsRef.current = newTotalWins;
            beatenLevelsRef.current = newBeatenLevels;

            // Update state
            setXP(newXP);
            setStreak(newStreak);
            setBestStreak(newBestStreak);
            setUnlockedLevel(newUnlockedLevel);
            setTotalWins(newTotalWins);
            setBeatenLevels(newBeatenLevels);
            setXPGained(gainedXP);

            if (freshAchievements.length > 0) {
                const updatedAchievements = [...prevAchievements, ...freshAchievements.map((a) => a.id)];
                achievementsRef.current = updatedAchievements;
                setAchievements(updatedAchievements);
                setNewAchievements(freshAchievements);
                persist(STORAGE_KEYS.ACHIEVEMENTS, updatedAchievements);
            }

            // Persist all
            persist(STORAGE_KEYS.XP, String(newXP));
            persist(STORAGE_KEYS.STREAK, String(newStreak));
            persist(STORAGE_KEYS.BEST_STREAK, String(newBestStreak));
            persist(STORAGE_KEYS.UNLOCKED_LEVEL, String(newUnlockedLevel));
            persist(STORAGE_KEYS.TOTAL_WINS, String(newTotalWins));
            persist(STORAGE_KEYS.BEATEN_LEVELS, newBeatenLevels);

            finishedGameIdRef.current += 1;
            setFinishedGameId(finishedGameIdRef.current);
        },
        [persist],
    );

    // ─── Player move ───
    const makePlayerMove = useCallback(
        (cellIndex) => {
            if (
                board[cellIndex] !== null ||
                !isPlayerTurn ||
                gameOver ||
                isAIThinking
            ) {
                return false;
            }

            const newBoard = [...board];
            newBoard[cellIndex] = 'X';
            setBoard(newBoard);

            const { winner, line, isDraw } = checkWinner(newBoard, boardSize);

            if (winner) {
                setResult({ winner, line, isDraw: false });
                setGameOver(true);
                handleGameEnd('win');
                return true;
            }

            if (isDraw) {
                setResult({ winner: null, line: null, isDraw: true });
                setGameOver(true);
                handleGameEnd('draw');
                return true;
            }

            setIsPlayerTurn(false);
            setIsAIThinking(true);
            return true;
        },
        [board, isPlayerTurn, gameOver, isAIThinking, handleGameEnd, boardSize],
    );

    // ─── AI move ───
    useEffect(() => {
        if (isPlayerTurn || gameOver || !isAIThinking) return;

        const curBoardSize = boardSizeRef.current;

        const aiMove = () => {
            const moveFn = getAIMoveForLevel(currentLevel);
            const boardCopy = [...board];
            const cellIndex = moveFn(boardCopy, 'O', 'X', curBoardSize);

            if (cellIndex === -1) {
                const { winner, line, isDraw } = checkWinner(board, curBoardSize);
                if (winner) {
                    setResult({ winner, line, isDraw: false });
                    setGameOver(true);
                    handleGameEnd(winner === 'O' ? 'lose' : 'win');
                } else if (isDraw) {
                    setResult({ winner: null, line: null, isDraw: true });
                    setGameOver(true);
                    handleGameEnd('draw');
                } else {
                    setIsPlayerTurn(true);
                }
                setIsAIThinking(false);
                return;
            }

            const newBoard = [...board];
            newBoard[cellIndex] = 'O';
            setBoard(newBoard);

            const { winner, line, isDraw } = checkWinner(newBoard, curBoardSize);

            if (winner) {
                setResult({ winner, line, isDraw: false });
                setGameOver(true);
                handleGameEnd('lose');
            } else if (isDraw) {
                setResult({ winner: null, line: null, isDraw: true });
                setGameOver(true);
                handleGameEnd('draw');
            } else {
                setIsPlayerTurn(true);
            }

            setIsAIThinking(false);
        };

        // Simulate AI "thinking" delay for feel
        const delay = currentLevel >= 4 ? 160 : 100;
        aiTimeoutRef.current = setTimeout(aiMove, delay);

        return () => {
            if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
        };
    }, [isPlayerTurn, gameOver, isAIThinking, board, currentLevel, handleGameEnd]);

    // ─── Reset game ───
    const resetGame = useCallback((level) => {
        const newLevel = level !== undefined ? level : currentLevel;
        const config = getLevelConfig(newLevel);
        const newBoardSize = config.boardSize;

        setBoard(Array(newBoardSize * newBoardSize).fill(null));
        setIsPlayerTurn(true);
        setGameOver(false);
        setResult(null);
        setIsAIThinking(false);
        setNewAchievements([]);
        setXPGained(0);
        setFinishedGameId(0);
        if (level !== undefined) {
            setCurrentLevel(level);
            currentLevelRef.current = level;
            boardSizeRef.current = newBoardSize;
        }
        if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    }, [currentLevel]);

    // ─── XP progress ───
    const xpProgress = useMemo(() => {
        const nextLevelXP = getXPForNextLevel(unlockedLevel);
        if (!nextLevelXP) return 1; // Max level
        const currentLevelXP =
            LEVELS.find((l) => l.id === unlockedLevel)?.requiredXP || 0;
        const progress = (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
        return Math.min(Math.max(progress, 0), 1);
    }, [xp, unlockedLevel]);

    // ─── Cleanup ───
    useEffect(() => {
        return () => {
            if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
        };
    }, []);

    return {
        // Game state
        board,
        isPlayerTurn,
        gameOver,
        result,
        currentLevel,
        isAIThinking,
        boardSize,

        // Progression
        xp,
        xpGained,
        finishedGameId,
        streak,
        bestStreak,
        unlockedLevel,
        achievements,
        newAchievements,
        totalWins,
        beatenLevels,
        xpProgress,

        // Theme
        theme,

        // Actions
        makePlayerMove,
        resetGame,
        setCurrentLevel,
    };
};

export default useTicTacToe;
