import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert
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

const WordCompletionScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
const { showToast } = useToast();

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
const user=useSelector(state=>state.user)
  const inputRefs = useRef([]);

  useEffect(() => {
    loadLevel(currentLevel);
  }, [currentLevel]);

  const loadLevel = (level) => {
    setLoading(true);
    setFeedback('');
    setWordInfo(null);

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

    Animated.loop(
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
    ).start();

    setLoading(false);
  };

  const handleInput = (value, index) => {
    const newInput = [...userInput];
    newInput[index] = value.toLowerCase();
    setUserInput(newInput);

    if (value && index < levelData.Hint.length - 1) {
      let nextIndex = -1;

      for (let i = index + 1; i < levelData.Hint.length; i++) {
        if (levelData.Hint[i] === '_') {
          nextIndex = i;
          break;
        }
      }

      if (nextIndex !== -1) {
        inputRefs.current[nextIndex]?.focus();
      }
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
    const attempt = userInput.join('');

    if (attempt === levelData.Word) {
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
    if (levelData && levelData.Word) {
      await fetchWordInfo(levelData.Word);
    }
  };

  const renderInputs = () => {
    return userInput.map((letter, index) => {
      const isFixed = levelData.Hint[index] !== '_';

      return (
        <Animated.View
          key={index}
          style={{
            transform: [{ translateX: shakeAnim }],
          }}
        >
          <TextInput
            ref={el => (inputRefs.current[index] = el)}
            style={[
              styles.input,
              isFixed ? styles.fixedInput : styles.editableInput,
            ]}
            value={letter}
            editable={!isFixed}
            maxLength={1}
            autoCapitalize="none"
            onChangeText={val => handleInput(val, index)}
          />
        </Animated.View>
      );
    });
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
    Alert.alert(
      'No Points',
      'Complete more levels to earn points!',
    );

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

          <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.wordContainer}
>
  {renderInputs()}
</ScrollView>
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

wordContainer:  
{ flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  paddingHorizontal: 10,
  marginBottom: 28,
  flexGrow: 1,
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
    backgroundColor: '#111827',
    borderColor: '#374151',
  },

  fixedInput: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderColor: '#8B5CF6',
    color: '#C4B5FD',
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