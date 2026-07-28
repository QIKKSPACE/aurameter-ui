import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import {
  completeLevel,
  selectWordGameCurrentLevel,
  selectWordGameMaxLevel,
  selectWordGamePoints,
  collectReward,
} from '../store/wordGameSlice';

import LinearGradient from 'react-native-linear-gradient';
import api from '../services/api';
import { useToast } from '../constants/context/ErrorContext';
import { updateUserData } from '../store/userSlice';

const { width } = Dimensions.get('window');

const wordData = require('../assets/word.json');

const getResponsiveConfigForLength = (length) => {
  const availableWidth = width - 90;

  let cellSize = 62;
  let gap = 12;

  const estimated = length * cellSize + (length - 1) * gap;

  if (estimated > availableWidth) {
    cellSize = Math.max(
      34,
      Math.floor((availableWidth - length * 6) / length),
    );
    gap = 6;
  }

  const fontSize = Math.max(18, cellSize * 0.42);

  return {
    cellSize,
    gap,
    fontSize,
  };
};

const WordCompletionScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
const { showToast } = useToast();
const user=useSelector(state=>state.user)

  const currentLevel = useSelector(selectWordGameCurrentLevel);
  const maxLevel = useSelector(selectWordGameMaxLevel);
  const points = useSelector(selectWordGamePoints);

  const [levelData, setLevelData] = useState(null);
  const [userInput, setUserInput] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [wordInfo, setWordInfo] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const inputRefs = useRef([]);
  const glowLoopRef = useRef(null);
  const backspaceHandledRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    loadLevel(currentLevel);
  }, [currentLevel, loadLevel]);

  useEffect(() => {
    return () => {
      if (glowLoopRef.current) {
        glowLoopRef.current.stop();
      }
    };
  }, []);

  const loadLevel = useCallback((level) => {
    setLoading(true);
    setFeedback('');
    setWordInfo(null);
    setActiveIndex(null);
    backspaceHandledRef.current = false;

    if (glowLoopRef.current) {
      glowLoopRef.current.stop();
    }

    const data = wordData.find(item => item.Level === level);

    if (!data) {
      setLoading(false);
      return;
    }

    setLevelData(data);

    const initialInput = data.Hint.split('').map(char =>
      char === '_' ? '' : char,
    );

    setUserInput(initialInput);

    const firstEditableIndex = data.Hint.indexOf('_');
    setTimeout(() => {
      if (firstEditableIndex !== -1) {
        setActiveIndex(firstEditableIndex);
        inputRefs.current[firstEditableIndex]?.focus();
      }
    }, 0);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: false,
      }),
    ]).start();

    glowLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: false,
        }),
      ]),
    );

    glowLoopRef.current.start();

    setLoading(false);
  }, [fadeAnim, glowAnim, scaleAnim]);

  const getNextEditableIndex = (fromIndex) => {
    for (let i = fromIndex + 1; i < levelData.Hint.length; i += 1) {
      if (levelData.Hint[i] === '_') {
        return i;
      }
    }

    return -1;
  };

  const getPreviousEditableIndex = (fromIndex) => {
    for (let i = fromIndex - 1; i >= 0; i -= 1) {
      if (levelData.Hint[i] === '_') {
        return i;
      }
    }

    return -1;
  };

  const handleInput = (value, index) => {
    if (!value && backspaceHandledRef.current) {
      backspaceHandledRef.current = false;
      return;
    }

    const newInput = [...userInput];
    newInput[index] = value.toLowerCase();
    setUserInput(newInput);

    if (!value) {
      setActiveIndex(index);
      return;
    }

    const nextIndex = getNextEditableIndex(index);

    if (nextIndex !== -1) {
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleBackspace = (index) => {
    if (levelData.Hint[index] !== '_') {
      return;
    }

    backspaceHandledRef.current = true;

    const newInput = [...userInput];

    if (newInput[index]) {
      newInput[index] = '';
      setUserInput(newInput);
      setActiveIndex(index);
      return;
    }

    const previousIndex = getPreviousEditableIndex(index);

    if (previousIndex !== -1) {
      newInput[previousIndex] = '';
      setUserInput(newInput);
      inputRefs.current[previousIndex]?.focus();
    }
  };

  const triggerShake = () => {
    shakeAnim.setValue(0);

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const fetchWordInfo = async word => {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
      );

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const entry = data[0];
        const meaningObj = entry.meanings?.[0]?.definitions?.[0];

        setWordInfo({
          definition:
            meaningObj?.definition || 'No definition available.',
          partOfSpeech: entry.meanings?.[0]?.partOfSpeech || '',
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const checkAnswer = async () => {
  const attempt = userInput.join('').toLowerCase();

  const validAnswers = levelData.AcceptedAnswers.map(
    answer => answer.toLowerCase()
  );

  if (validAnswers.includes(attempt)) {
    setFeedback('PERFECT ✨');

    setTimeout(() => {
      dispatch(completeLevel(currentLevel));
    }, 1000);
  } else {
    setFeedback('TRY AGAIN');
    triggerShake();
  }
};
  const handleHint = async () => {
  if (levelData?.AcceptedAnswers?.length) {
  await fetchWordInfo(levelData.AcceptedAnswers[0]);
}
  };
const getResponsiveConfig = () => {
  const length = levelData?.Hint?.length || 1;
  return getResponsiveConfigForLength(length);
};

const layoutConfig = getResponsiveConfig();
const totalEditable = levelData
  ? levelData.Hint.split('').filter(char => char === '_').length
  : 0;
const filledCount = levelData
  ? userInput.reduce((count, letter, index) => {
      if (levelData.Hint[index] === '_' && letter) {
        return count + 1;
      }

      return count;
    }, 0)
  : 0;

const renderInputs = () => {
return (
  <View style={styles.inputShell}>
    <View style={styles.inputGrid}>
      {userInput.map((letter, index) => {
        const isFixed = levelData.Hint[index] !== '_';
        const isActive = activeIndex === index;

        return (
          <Animated.View
            key={index}
            style={[
              styles.cellWrap,
              {
                width: layoutConfig.cellSize,
                height: layoutConfig.cellSize + 10,
                marginRight: layoutConfig.gap,
                marginBottom: layoutConfig.gap,
                transform: [
                  { translateX: shakeAnim },
                  { scale: isActive ? 1.04 : 1 },
                ],
              },
              isActive && styles.activeCellWrap,
            ]}
          >
            <TextInput
              ref={el => (inputRefs.current[index] = el)}
              style={[
                styles.input,
                {
                  width: layoutConfig.cellSize,
                  height: layoutConfig.cellSize + 10,
                  fontSize: layoutConfig.fontSize,
                },
                isFixed ? styles.fixedInput : styles.editableInput,
                isActive && styles.activeInput,
              ]}
              value={letter}
              editable={!isFixed}
              maxLength={1}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="dark"
              selectionColor="#8B5CF6"
              placeholderTextColor="#64748B"
              onFocus={() => setActiveIndex(index)}
              onChangeText={val => handleInput(val, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  handleBackspace(index);
                }
              }}
            />
          </Animated.View>
        );
      })}
    </View>
   
  </View>

);
};


  if (loading) {
    return (
      <LinearGradient
        colors={['#020617', '#0F172A']}
        style={styles.loaderContainer}
      >
        <ActivityIndicator size="large" color="#8B5CF6" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#020617', '#0F172A', '#111827']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View>
              <Text style={styles.headerSmall}>WORD MASTER</Text>
              <Text style={styles.headerTitle}>Elite Puzzle</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
             

              <View style={[styles.levelPill, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.levelPillText}>
                  {points} PTS
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
               onPress={async () => {
  if (points <= 0) {
showToast( `No Points,Complete more levels to earn points!`, "failure");


    return;
  }

  try {
    const response = await api.post(
      '/game/word-game',
      {
        level: maxLevel,
        aura: points,
      },
    );

    if (response?.data?.success) {
      dispatch(collectReward());
      dispatch(
    updateUserData({
      aura:
        (user?.userData?.aura || 0) + points,
    })
  );
showToast( `You claimed ${points} points.`, "success");
    }
  } catch (err) {
    console.log(
      'Claim reward error:',
      err?.response?.data || err.message,
    );
showToast("Failed to Claim  Aura, Try again", "error");
  }
}}
                style={{ padding: 6, backgroundColor: '#10B981', borderRadius: 20 }}
              >
                <Icon name="gift" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* MAIN CARD */}

          <Animated.View
            style={[
              styles.mainCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                borderColor: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['rgba(139,92,246,0.2)', '#8B5CF6'],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={[
                'rgba(139,92,246,0.12)',
                'rgba(59,130,246,0.08)',
              ]}
              style={styles.cardGlow}
            />
            
            <View style={styles.topBadge}>
               <View style={styles.levelPill}>
                <Text style={styles.levelPillText}>
                  LVL {currentLevel}  
                </Text>
              </View>
              
            </View>

            

            <Text style={styles.difficulty}>
              {levelData.Tier.toUpperCase()}
            </Text>

            {/* INPUTS */}

            {renderInputs()}

            <View style={styles.progressBlock}>
              <View style={styles.progressMetaRow}>
                <Text style={styles.progressLabel}>COMPLETION</Text>
                <Text style={styles.progressValue}>
                  {filledCount}/{totalEditable}
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${totalEditable ? (filledCount / totalEditable) * 100 : 0}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {!!feedback && (
              <Text style={styles.feedback}>{feedback}</Text>
            )}

            {/* BUTTONS */}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleHint}
              style={[styles.playButtonWrapper, { marginBottom: 12 }]}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.playButton}
              >
                <Icon
                  name="help-buoy"
                  size={22}
                  color="#fff"
                />
                <Text style={styles.playButtonText}>
                  HINT
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={checkAnswer}
              style={styles.playButtonWrapper}
            >
              <LinearGradient
                colors={['#8B5CF6', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.playButton}
              >
                <Icon
                  name="sparkles"
                  size={22}
                  color="#fff"
                />
                <Text style={styles.playButtonText}>
                  VERIFY ANSWER
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* INFO */}

            {wordInfo && (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>
                  WORD INSIGHT
                </Text>

                <Text style={styles.infoDefinition}>
                  {wordInfo.definition}
                </Text>

                {!!wordInfo.partOfSpeech && (
                  <View style={styles.partBadge}>
                    <Text style={styles.partBadgeText}>
                      {wordInfo.partOfSpeech}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* REWARD MODAL */}

    
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 50,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  backButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  headerSmall: {
    color: '#94A3B8',
    fontSize: 12,
    letterSpacing: 2,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 3,
  },

  levelPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },

  levelPillText: {
    color: '#fff',
    fontWeight: '700',
  },

  mainCard: {
    borderRadius: 34,
    padding: 28,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(15,23,42,0.92)',
  },

  cardGlow: {
    ...StyleSheet.absoluteFillObject,
  },

  topBadge: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    gap: 8,
    marginBottom: 24,
  },

  badgeText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },

  category: {
    color: '#fff',
    fontSize: 32,
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: 8,
  },

  difficulty: {
    color: '#A78BFA',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 35,
    fontWeight: '700',
  },

  inputShell: {
    marginBottom: 18,
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.15)',
  },

  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  wordRevealHint: {
    marginTop: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 0.6,
  },

  cellWrap: {
    borderRadius: 22,
  },

  activeCellWrap: {
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  input: {
    width: 58,
    height: 70,
    borderRadius: 18,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    borderWidth: 1.5,
  },

  editableInput: {
    backgroundColor: 'rgba(17,24,39,0.95)',
    borderColor: 'rgba(148,163,184,0.24)',
  },

  fixedInput: {
    backgroundColor: 'rgba(139,92,246,0.14)',
    borderColor: 'rgba(139,92,246,0.55)',
    color: '#DDD6FE',
  },

  activeInput: {
    borderColor: '#A78BFA',
    backgroundColor: 'rgba(139,92,246,0.12)',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  progressBlock: {
    marginBottom: 18,
  },

  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  progressLabel: {
    color: '#94A3B8',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },

  progressValue: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
  },

  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#8B5CF6',
  },

  feedback: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 22,
    letterSpacing: 1,
  },

  playButtonWrapper: {
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 8,
  },

  playButton: {
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  playButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },

  infoCard: {
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  infoTitle: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },

  infoDefinition: {
    color: '#E5E7EB',
    lineHeight: 24,
    fontSize: 15,
  },

  partBadge: {
    marginTop: 15,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(139,92,246,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
  },

  partBadgeText: {
    color: '#C4B5FD',
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  rewardCard: {
    width: width * 0.88,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },

  rewardTop: {
    paddingVertical: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  rewardTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 18,
  },

  rewardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    fontSize: 16,
  },

  rewardBody: {
    padding: 28,
  },

  rewardBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },

  rewardAmount: {
    color: '#10B981',
    fontSize: 34,
    fontWeight: '900',
  },

  claimButton: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },

  claimButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default WordCompletionScreen;
