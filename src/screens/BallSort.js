import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectBallSortLevel,
  selectBallSortPendingAura,
  selectBallSortRewardQueuedForLevel,
  nextLevel,
  queueLevelReward,
  claimPendingAura,
} from '../store/ballSortSlice';
import { StyleSheet, View, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'react-native-linear-gradient';

import PremiumTubeGrid from '../components/ballsort/PremiumTubeGrid';
import GameControls from '../components/ballsort/GameControls';
import BallAnimator from '../animations/BallAnimator';
import { usePremiumBallSort } from '../hooks/usePremiumBallSort';
import { COLORS, CAPACITY } from '../constants/constants';
import { useTheme } from '../constants/context/ThemeContext';
import { GameHaptics } from '../utils/haptics';
import TutorialOverlay from '../components/ballsort/TutorialOverlay';
import WinOverlay from '../components/ballsort/WinOverlay';
import HelpModal from '../components/ballsort/HelpModal';
import GameOverOverlay from '../components/ballsort/GameOverOverlay';
import { updateUserData } from '../store/userSlice';
import { useToast } from '../constants/context/ErrorContext';
import api from '../services/api';

const { width } = Dimensions.get('window');

const BallSortScreen = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const level = useSelector(selectBallSortLevel);
  const pendingAura = useSelector(selectBallSortPendingAura);
  const rewardQueuedForLevel = useSelector((state) =>
    selectBallSortRewardQueuedForLevel(state, level),
  );
  const [movingBall, setMovingBall] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [suppressWinOverlay, setSuppressWinOverlay] = useState(false);
  const [claimingAura, setClaimingAura] = useState(false);
  const [tubeLayoutMap, setTubeLayoutMap] = useState({});
  const moveCompletedRef = useRef(false);
  const user=useSelector(state=>state.user)
  const { showToast } = useToast();
  
  const {
    tubes,
    setTubes,
    history,
    setHistory,
    selectedTube,
    setSelectedTube,
    hasWon,
    hasLost,
    isMoving,
    setIsMoving,
    movesUsed,
    moveLimit,
    movesRemaining,
    registerMove,
    tubeLayouts,
    onTubeLayout,
    handleUndo,
    handleRestart,
    handleHint,
    capacity
  } = usePremiumBallSort({ level, capacity: CAPACITY, colors: COLORS });

  const rowSize = tubes.length <= 12 ? 6 : 7;
  const maxItemsInRow = Math.max(1, Math.min(tubes.length, rowSize));
  const horizontalGap = 10;
  const availableWidth = width - 40; // 20px padding on each side
  const calculatedBallSize = Math.min(42, Math.floor((availableWidth - (maxItemsInRow - 1) * horizontalGap) / maxItemsInRow) - 12);
  const ballSize = Math.max(25, calculatedBallSize);

  useEffect(() => {
    setMovingBall(null);
    moveCompletedRef.current = false;
  }, [level]);

  useEffect(() => {
    if (!hasWon || rewardQueuedForLevel) {
      return;
    }

    dispatch(queueLevelReward({ level, reward: level }));
  }, [dispatch, hasWon, level, rewardQueuedForLevel]);

  useEffect(() => {
    if (!hasWon) {
      setSuppressWinOverlay(false);
    }
  }, [hasWon]);

  const applyMove = useCallback((fromIdx, toIdx) => {
    setTubes((prev) => {
      const next = prev.map(t => [...t]);
      const ball = next[fromIdx]?.pop();
      if (ball) next[toIdx].push(ball);
      return next;
    });
  }, [setTubes]);

  const handleTubeLayout = useCallback((index, layout) => {
    onTubeLayout(index, layout);
    setTubeLayoutMap((prev) => {
      const current = prev[index];
      if (
        current &&
        current.x === layout.x &&
        current.y === layout.y &&
        current.width === layout.width &&
        current.height === layout.height
      ) {
        return prev;
      }
      return { ...prev, [index]: layout };
    });
  }, [onTubeLayout]);

  const canMove = (from, to) => {
    if (from === to) return false;
    const fromTube = tubes[from];
    const toTube = tubes[to];
    
    if (fromTube.length === 0) return false;
    if (toTube.length >= capacity) return false;
    
    if (toTube.length === 0) return true;
    
    return fromTube[fromTube.length - 1] === toTube[toTube.length - 1];
  };

  const handleTubePress = (index) => {
    if (isMoving || hasWon || hasLost) return;

    if (selectedTube === index) {
      setSelectedTube(-1);
      GameHaptics.buttonPress();
      return;
    }

    if (selectedTube === -1) {
      if (tubes[index].length > 0) {
        setSelectedTube(index);
        GameHaptics.selectTube();
      }
      return;
    }

    const from = selectedTube;
    const to = index;

    if (!canMove(from, to)) {
      setSelectedTube(-1);
      GameHaptics.invalidMove();
      return;
    }

    setIsMoving(true);
    setSelectedTube(-1);

    const fromLayout = tubeLayoutMap[from] || tubeLayouts.current[from];
    const toLayout = tubeLayoutMap[to] || tubeLayouts.current[to];
    const fromTube = tubes[from];
    const toTube = tubes[to];
    if (!fromLayout || !toLayout) {
      setHistory((prev) => [...prev, tubes.map(t => [...t])]);
      applyMove(from, to);
      setSelectedTube(-1);
      setIsMoving(false);
      return;
    }

    const ballColor = fromTube[fromTube.length - 1];

    const startX = fromLayout.x + (fromLayout.width - ballSize) / 2;
    const startY = fromLayout.y + fromLayout.height - 8 - (fromTube.length * ballSize) - ((fromTube.length - 1) * 2); 

    const targetX = toLayout.x + (toLayout.width - ballSize) / 2;
    const targetY = toLayout.y + toLayout.height - 8 - ((toTube.length + 1) * ballSize) - (toTube.length * 2);

    setMovingBall({
      color: ballColor,
      startLayout: { x: startX, y: startY },
      endLayout: { x: targetX, y: targetY },
      fromIdx: from,
      toIdx: to
    });
    moveCompletedRef.current = false;
  };

  const finishMovingBall = useCallback(() => {
    if (!movingBall || moveCompletedRef.current) return;
    moveCompletedRef.current = true;
    
    const { fromIdx, toIdx } = movingBall;

    setHistory((prev) => [...prev, tubes.map(t => [...t])]);
    applyMove(fromIdx, toIdx);
    registerMove();
    setMovingBall(null);
    setIsMoving(false);
  }, [applyMove, movingBall, registerMove, tubes, setHistory, setIsMoving]);

  useEffect(() => {
    if (!movingBall) return undefined;
    const fallback = setTimeout(finishMovingBall, 520);
    return () => clearTimeout(fallback);
  }, [finishMovingBall, movingBall]);

  useFocusEffect(
    useCallback(() => {
      if (hasWon) {
        GameHaptics.levelWin();
      }
    }, [hasWon])
  );

  const handleNextLevel = () => {
    setSuppressWinOverlay(true);
    dispatch(nextLevel());
  };

  const handleBackgroundPress = () => {
    if (selectedTube !== -1) {
      setSelectedTube(-1);
    }
  };
 const handleClaimReward = async () => {
  if (claimingAura) {
    return;
  }

  if (pendingAura <= 0) {
    showToast("No pending Aura to claim yet.", "error");
    return;
  }

  setClaimingAura(true);

  try {
    const response = await api.post(
      '/game/ball-sort-game',
      {
        level: level,
        aura: pendingAura,
      },
    );

    if (response?.data?.success) {
    
      dispatch(
    updateUserData({
      aura:
        (user?.userData?.aura || 0) + pendingAura,
    })
  );
dispatch(claimPendingAura());
showToast( `You claimed ${pendingAura} points.`, "success");
handleNextLevel()
    }
  } catch (err) {
    console.log(
      'Claim reward error:',
      err?.response?.data || err.message,
    );
    showToast("Failed to Claim  Aura, Try again", "error");
  } finally {
    setClaimingAura(false);
  }


 }
  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#1a1b26', '#16161e', '#0f0f14']} 
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <TutorialOverlay 
          visible={level === 1 && selectedTube === -1 && history.length === 0 && !hasWon} 
          text="Tap a tube to pick up the top ball"
        />
        <TutorialOverlay 
          visible={level === 1 && selectedTube !== -1 && history.length === 0 && !hasWon} 
          text="Tap another tube to move the ball"
        />
        <GameControls 
          level={level} 
          movesUsed={movesUsed}
          moveLimit={moveLimit}
          onUndo={handleUndo} 
          onRestart={handleRestart} 
          onHint={handleHint}
          onHelp={() => setShowHelp(true)}
          theme={theme}
        />

        <View
          style={styles.gameArea} 
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={handleBackgroundPress}
          />

          <PremiumTubeGrid
            key={`ball-sort-grid-${level}`}
            layoutKey={level}
            tubes={tubes}
            capacity={capacity}
            ballSize={ballSize}
            selectedTube={selectedTube}
            movingBallState={movingBall}
            onTubeLayout={handleTubeLayout}
            onTubePress={handleTubePress}
          />

          {movingBall && (
            <BallAnimator
              ballColor={movingBall.color}
              ballSize={ballSize}
              startLayout={movingBall.startLayout}
              endLayout={movingBall.endLayout}
              onAnimationComplete={finishMovingBall}
            />
          )}
        </View>

        <WinOverlay
          visible={hasWon && !suppressWinOverlay}
          onNextLevel={handleNextLevel}
          claimReward={handleClaimReward}
          rewardAmount={pendingAura}
          claimDisabled={claimingAura || pendingAura <= 0}
          claimLabel={claimingAura ? "Claiming..." : undefined}
        />
        <GameOverOverlay visible={hasLost} onReplay={handleRestart} remainingMoves={movesRemaining} moveLimit={moveLimit} />
        <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b26',
  },
  safeArea: {
    flex: 1,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    marginTop: 20,
    marginHorizontal: 10,
  }
});

export default BallSortScreen;
