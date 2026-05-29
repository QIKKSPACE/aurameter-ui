import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  initialize,
  requestPermission,
  readRecords,
  getGrantedPermissions,
} from 'react-native-health-connect';
import { Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
import { useToast } from '../constants/context/ErrorContext';
import { updateUserData } from '../store/userSlice';
const { width } = Dimensions.get('window');

// ─── Inline SVG-style icons via Text (no extra deps) ──────────────────────────
const Icon = ({ name, size = 20, color = '#fff' }) => {
  const icons = {
    back: '‹',
    info: 'ⓘ',
    close: '✕',
    check: '✓',
    refresh: '↻',
    steps: '👟',
    warning: '⚠',
  };
  return (
    <Text style={{ fontSize: size, color, lineHeight: size + 4 }}>
      {icons[name] ?? '?'}
    </Text>
  );
};

// ─── Ring progress component ──────────────────────────────────────────────────
const StepRing = ({ steps, goal = 10000 }) => {
  const progress = Math.min(steps / goal, 1);
  const pct = Math.round(progress * 100);

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [steps]);

  return (
    <Animated.View
      style={[
        styles.ringWrapper,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      {/* Outer decorative ring */}
      <View style={styles.ringOuter}>
        <View style={styles.ringInner}>
          <Text style={styles.stepsNumber}>
            {steps.toLocaleString()}
          </Text>
          <Text style={styles.stepsLabel}>steps today</Text>
          <View style={styles.progressPill}>
            <Text style={styles.progressPillText}>{pct}% of goal</Text>
          </View>
        </View>
      </View>

      {/* Progress arc indicator (simplified bar below ring) */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: `${pct}%` },
          ]}
        />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabelText}>0</Text>
        <Text style={styles.progressLabelText}>Goal: {goal.toLocaleString()}</Text>
      </View>
    </Animated.View>
  );
};

// ─── Info Modal ───────────────────────────────────────────────────────────────
const InfoModal = ({ visible, onClose }) => {
  const steps = [
    {
      num: '01',
      title: 'Install Health Connect',
      desc: 'Download the Health Connect app from the Google Play Store. Its free and published by Google.',
    },
    {
      num: '02',
      title: 'Open this app',
      desc: 'Relaunch the app after installing Health Connect. It will automatically request access.',
    },
    {
      num: '03',
      title: 'Grant permission',
      desc: 'When prompted, allow this app to read your Steps data from Health Connect.',
    },
    {
      num: '04',
      title: 'Start moving',
      desc: 'Your steps are synced automatically. Tap Refresh anytime to see the latest count.',
    },
      {
      num: '05',
      title: 'Claim Reward',
      desc: 'Once you walk 5000 steps in a day, you can claim your Aura reward in the app, once per day.',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Handle */}
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>How it works</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Icon name="close" size={14} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}
          >
            <Text style={styles.modalSubtitle}>
              This app uses{' '}
              <Text style={styles.modalHighlight}>Google Health Connect</Text>
              {' '}to read your daily step data securely.
            </Text>

            {steps.map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumBadge}>
                  <Text style={styles.stepNumText}>{s.num}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}

            <View style={styles.privacyCard}>
              <Text style={styles.privacyIcon}>🔒</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.privacyTitle}>Your data stays private</Text>
                <Text style={styles.privacyDesc}>
                  Step data is read directly from your device. Nothing is uploaded to external servers.
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.modalCTA} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.modalCTAText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── Status Banner ────────────────────────────────────────────────────────────
const StatusBanner = ({ type, message, onAction, actionLabel }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <View style={[styles.banner, isError ? styles.bannerError : styles.bannerSuccess]}>
      <Text style={styles.bannerText}>{message}</Text>
      {onAction && (
        <TouchableOpacity onPress={onAction} style={styles.bannerAction}>
          <Text style={styles.bannerActionText}>{actionLabel ?? 'Retry'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const StepTrackerScreen = ({ navigation }) => {
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [infoVisible, setInfoVisible] = useState(false);
  const [permDenied, setPermDenied] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
const user=useSelector(state=>state.user?.userData)
const [showClaimModal, setShowClaimModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
    const WALK_AURA_REWARD = 10;
   const dispatch=useDispatch();
const MIN_STEPS = 5000;
  const goal = 5000;
const { showToast } = useToast();

  const remaining = Math.max(goal - steps, 0);
  const calories = Math.round(steps * 0.04);
  const km = (steps * 0.000762).toFixed(2);
  const canClaimWalkReward = () => {
  
  if (!user) return false;

  // User must complete minimum steps
  if (steps < MIN_STEPS) return false;

  // Never claimed before
  if (!user?.last_walk_time) return true;

  const lastClaim = new Date(user.last_walk_time);
  const now = new Date();

  // Check if same day
  const isSameDay =
    lastClaim.getDate() === now.getDate() &&
    lastClaim.getMonth() === now.getMonth() &&
    lastClaim.getFullYear() === now.getFullYear();

  // Can only claim once per day
  return !isSameDay;
};
useEffect(() => {
  if (canClaimWalkReward()) {
    setShowClaimModal(true);
  } 
}, [steps, user]);
const claimWalkAura = async () => {
  try {

    setLoading(true);

    const res = await api.post(
      "/game/walk-aura",
      {
        aura: WALK_AURA_REWARD,
        steps,
      }
    );

    if (res.data.success) {

      setShowClaimModal(false);

      showToast(
        `You earned ${WALK_AURA_REWARD} Aura ✨`,"success"
      );
dispatch(
    updateUserData({
      aura:
        (user?.aura || 0) + WALK_AURA_REWARD,
      last_walk_time: new Date().toISOString(),
    })
  );

    }

  } catch (err) {

    console.error(
      'Claim reward error:',
      err?.response?.data || err.message,
    );
showToast("Failed to Claim  Aura, Try again", "error");

  } finally {
    setLoading(false);
  }
};
const openHealthConnectSettings = async () => {
  try {
    if (Platform.OS !== 'android') return;

    await Linking.openURL(
      'android-app://com.google.android.apps.healthdata'
    );
  } catch (e) {
    Linking.openSettings();
  }
};
  useEffect(() => {
    initHealthConnect();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const requestActivityPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        {
          title: 'Activity Permission',
          message: 'This app needs activity permission to track your steps.',
          buttonPositive: 'Allow',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  const initHealthConnect = async () => {
    try {
      setLoading(true);
      clearMessages();
      setPermDenied(false);

      const activityGranted = await requestActivityPermission();
      if (!activityGranted) {
        setPermDenied(true);
        setErrorMsg('Activity recognition permission is required to track steps.');
        return;
      }

      const initialized = await initialize();
      if (!initialized) {
        setErrorMsg('Health Connect is not installed. Tap the info icon to learn how to set it up.');
        return;
      }

      const permissions = await requestPermission([{ accessType: 'read', recordType: 'Steps' }]);
      const granted = await getGrantedPermissions();

      const hasSteps = granted.some(p => p.recordType === 'Steps');
      if (!hasSteps) {
        setPermDenied(true);
        setErrorMsg('Steps permission was denied. Please grant access to continue.');
        return;
      }

      await fetchSteps(true);
    } catch (error) {
      setErrorMsg('Could not connect to Health Connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSteps = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      clearMessages();

      const startTime = new Date();
      startTime.setHours(0, 0, 0, 0);
      const endTime = new Date();

      const response = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      });

      let totalSteps = 0;
      response.records.forEach(r => { totalSteps += r.count || 0; });
      setSteps(totalSteps);

      if (!silent) {
        setSuccessMsg('Steps updated just now');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch {
      setErrorMsg('Failed to read steps. Make sure Health Connect is running.');
    } finally {
      setLoading(false);
    }
  };

  // Stats row


  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── Background gradient layers ── */}
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />

      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={styles.topBarBtn}
            activeOpacity={0.7}
          >
            <Icon name="back" size={26} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.screenTitle}>Activity</Text>

          <TouchableOpacity
            onPress={() => setInfoVisible(true)}
            style={styles.topBarBtn}
            activeOpacity={0.7}
          >
            <Icon name="info" size={18} color="#A8A8B3" />
          </TouchableOpacity>
        </View>

        {/* ── Date ── */}
        <Text style={styles.dateLabel}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {/* ── Status Banner ── */}
        <StatusBanner
  type={errorMsg ? 'error' : 'success'}
  message={errorMsg || successMsg}
  onAction={permDenied ? openHealthConnectSettings : null}
  actionLabel={permDenied ? "Open Settings" : "Retry"}
/>
        {/* ── Main Ring ── */}
        <View style={styles.ringSection}>
          {loading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="large" color="#5B9CF6" />
              <Text style={styles.loadingText}>Syncing steps…</Text>
            </View>
          ) : (
            <StepRing steps={steps} goal={goal} />
          )}
        </View>

        {/* ── Stats Row ── */}
        {!loading && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{calories}</Text>
              <Text style={styles.statLabel}>kcal</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{km}</Text>
              <Text style={styles.statLabel}>km</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{remaining.toLocaleString()}</Text>
              <Text style={styles.statLabel}>remaining</Text>
            </View>
          </View>
        )}

        {/* ── Refresh Button ── */}
        <TouchableOpacity
          style={[styles.refreshBtn, loading && styles.refreshBtnDisabled]}
          onPress={() => fetchSteps(false)}
          disabled={loading}
          activeOpacity={0.8}
        >
          <View style={styles.refreshBtnInner}>
            <Icon name="refresh" size={16} color="#fff" />
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </View>
        </TouchableOpacity>

        {/* ── Footer note ── */}
        <Text style={styles.footerNote}>Synced from Health Connect · Today</Text>
      </Animated.View>

      {/* ── Info Modal ── */}
      <InfoModal visible={infoVisible} onClose={() => setInfoVisible(false)} />
        <Modal
  visible={showClaimModal}
  transparent
  animationType="fade"
>
  <View style={styles.claimOverlay}>
    <View style={styles.claimCard}>

      <Text style={styles.claimEmoji}>
        🎉
      </Text>

      <Text style={styles.claimTitle}>
        Daily Walk Completed
      </Text>

      <Text style={styles.claimDesc}>
        You walked {steps.toLocaleString()} steps today.
      </Text>

      <Text style={styles.claimAura}>
        +{WALK_AURA_REWARD} Aura
      </Text>

      <TouchableOpacity
        style={styles.claimButton}
        onPress={claimWalkAura}
      >
        <Text style={styles.claimButtonText}>
          Claim Reward
        </Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>
    </View>
  );
};

export default StepTrackerScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#080810',
  },

  bgGlow1: {
    position: 'absolute',
    top: -100,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(91,156,246,0.08)',
  },

  bgGlow2: {
    position: 'absolute',
    bottom: 60,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(90,200,140,0.06)',
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
  },

  // ── Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },

  // ── Date
  dateLabel: {
    color: '#5E5E72',
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.2,
  },

  // ── Banner
  banner: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  bannerError: {
    backgroundColor: 'rgba(255,69,58,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,69,58,0.25)',
  },
  bannerSuccess: {
    backgroundColor: 'rgba(48,209,88,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(48,209,88,0.25)',
  },
  bannerText: {
    color: '#E0E0E8',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  bannerAction: {
    backgroundColor: 'rgba(91,156,246,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bannerActionText: {
    color: '#5B9CF6',
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Ring
  ringSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  loadingWrapper: {
    alignItems: 'center',
    gap: 14,
  },
  loadingText: {
    color: '#5E5E72',
    fontSize: 14,
  },

  ringWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  ringOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(91,156,246,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    // Shadow
    shadowColor: '#5B9CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  ringInner: {
    width: 172,
    height: 172,
    borderRadius: 86,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stepsNumber: {
    fontSize: 44,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -1.5,
    lineHeight: 50,
  },
  stepsLabel: {
    fontSize: 12,
    color: '#5E5E72',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  progressPill: {
    marginTop: 6,
    backgroundColor: 'rgba(91,156,246,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(91,156,246,0.3)',
  },
  progressPillText: {
    color: '#5B9CF6',
    fontSize: 11,
    fontWeight: '600',
  },

  progressTrack: {
    width: width - 80,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5B9CF6',
    borderRadius: 2,
  },
  progressLabels: {
    width: width - 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabelText: {
    color: '#5E5E72',
    fontSize: 11,
    fontWeight: '400',
  },

  // ── Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: '#5E5E72',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // ── Refresh
  refreshBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#5B9CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#5B9CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  refreshBtnDisabled: {
    opacity: 0.5,
  },
  refreshBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  footerNote: {
    textAlign: 'center',
    color: '#3A3A4C',
    fontSize: 12,
    marginBottom: Platform.OS === 'ios' ? 32 : 20,
  },

  // ── Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#111118',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '88%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.1,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 20,
  },
  modalSubtitle: {
    color: '#8E8E9A',
    fontSize: 14,
    lineHeight: 21,
  },
  modalHighlight: {
    color: '#5B9CF6',
    fontWeight: '600',
  },

  stepRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  stepNumBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(91,156,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(91,156,246,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  stepNumText: {
    color: '#5B9CF6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },   
  stepTitle: {
    color: '#E8E8F0',
    fontSize: 15,
    fontWeight: '600',
  },
  stepDesc: {
    color: '#6E6E82',
    fontSize: 13,
    lineHeight: 19,
  },

  privacyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(48,209,88,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(48,209,88,0.15)',
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  privacyIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  privacyTitle: {
    color: '#30D158',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  privacyDesc: {
    color: '#6E6E82',
    fontSize: 12,
    lineHeight: 18,
  },

  modalCTA: {
    marginHorizontal: 24,
    marginTop: 12,
    height: 52,
    backgroundColor: '#5B9CF6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B9CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  modalCTAText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  claimOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.75)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
},

claimCard: {
  width: '100%',
  backgroundColor: '#111118',
  borderRadius: 28,
  padding: 28,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
},

claimEmoji: {
  fontSize: 54,
  marginBottom: 12,
},

claimTitle: {
  color: '#fff',
  fontSize: 24,
  fontWeight: '700',
  marginBottom: 8,
},

claimDesc: {
  color: '#8E8E9A',
  fontSize: 15,
  textAlign: 'center',
  lineHeight: 22,
},

claimAura: {
  color: '#5B9CF6',
  fontSize: 34,
  fontWeight: '800',
  marginTop: 20,
  marginBottom: 24,
},

claimButton: {
  width: '100%',
  height: 54,
  backgroundColor: '#5B9CF6',
  borderRadius: 18,
  alignItems: 'center',
  justifyContent: 'center',
},

claimButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},
});
