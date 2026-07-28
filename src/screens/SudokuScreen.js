import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  AppState,
  Modal,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { generateSudokuPuzzle } from '../hooks/useGenerateSudokuPuzzle';
import {
  setPuzzle,
  showAnswer,
  takeHint,
  updateCell,
  toggleNote,
  clearNotes,
  incrementTime,
  awardCompletionReward,
  collectReward,
} from '../store/sudokuSlice';
import { useToast } from '../constants/context/ErrorContext';
import api from '../services/api';
import { updateUserData } from '../store/userSlice';

const { width } = Dimensions.get('window');
const GRID_SIZE = width - 30;
const CELL_SIZE = (GRID_SIZE - 10) / 9; // Account for borders
const MAX_DIGIT_COUNT = 9;
const MAX_HINTS = 5;

const SudokuGame = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const appState = useRef(AppState.currentState);

  const {
    sudoku,
    answer,
    userCurrentPosition,
    notes = [],
    totalTimeSpent,
    hintsTaken,
    rewardScore,
  } = useSelector((state) => state.sudoku);

  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null); // { row, col }
  const [noteMode, setNoteMode] = useState(false);
  const [checkModalVisible, setCheckModalVisible] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
const { showToast } = useToast();
const user=useSelector(state=>state.user)
  const [collectingReward, setCollectingReward] = useState(false);

  const conflictSet = useMemo(() => {
    const conflicts = new Set();

    const markConflicts = (cells) => {
      const seen = new Map();
      cells.forEach(({ row, col }) => {
        const value = userCurrentPosition[row]?.[col];
        if (!value) return;
        if (!seen.has(value)) {
          seen.set(value, []);
        }
        seen.get(value).push(`${row}-${col}`);
      });

      seen.forEach((positions) => {
        if (positions.length > 1) {
          positions.forEach((position) => conflicts.add(position));
        }
      });
    };

    for (let index = 0; index < 9; index += 1) {
      markConflicts(Array.from({ length: 9 }, (_, col) => ({ row: index, col })));
      markConflicts(Array.from({ length: 9 }, (_, row) => ({ row, col: index })));
    }

    for (let boxRow = 0; boxRow < 3; boxRow += 1) {
      for (let boxCol = 0; boxCol < 3; boxCol += 1) {
        const cells = [];
        for (let row = boxRow * 3; row < boxRow * 3 + 3; row += 1) {
          for (let col = boxCol * 3; col < boxCol * 3 + 3; col += 1) {
            cells.push({ row, col });
          }
        }
        markConflicts(cells);
      }
    }

    return conflicts;
  }, [userCurrentPosition]);
  // 1. Initial Load Logic
  const createNewGame = useCallback(() => {
    const { puzzle, solution } = generateSudokuPuzzle();
    dispatch(setPuzzle({ puzzle, solution, previousAnswer: solution }));
    setIsSolved(false);
    setCheckModalVisible(false);
    setSelectedCell(null);
    setNoteMode(false);
  }, [dispatch]);

  useEffect(() => {
    if (!sudoku.length) {
      createNewGame();
    }
    setLoading(false);
  }, [createNewGame, sudoku.length]);

  // 2. Timer & AppState Logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (appState.current === 'active') dispatch(incrementTime());
    }, 1000);
    const sub = AppState.addEventListener('change', (next) => (appState.current = next));
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [dispatch]);

  // 3. Handlers
  const handleNumberInput = (num) => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      if (sudoku[row][col] === 0) {
        if (noteMode && num !== 0) {
          dispatch(toggleNote({ row, col, value: num }));
          return;
        }

        const currentValue = userCurrentPosition[row][col];

        if (num !== 0) {
          const digitCount = digitCounts[num] ?? 0;
          const isSameValue = currentValue === num;

          if (!isSameValue && digitCount >= MAX_DIGIT_COUNT) {
            Alert.alert(
              'Digit limit reached',
              `You can only place ${MAX_DIGIT_COUNT} of each digit in one game.`
            );
            return;
          }
        }

        dispatch(updateCell({ row, col, value: num }));
        dispatch(clearNotes({ row, col }));
      }
    }
  };

  const handleCellPress = (row, col) => {
    setSelectedCell({ row, col });
    if (noteMode && sudoku[row][col] !== 0) {
      setNoteMode(false);
    }
  };

  const handleCellLongPress = (row, col) => {
    if (sudoku[row][col] === 0) {
      setSelectedCell({ row, col });
      setNoteMode(true);
    }
  };

  const handleCheck = () => {
    const solved = JSON.stringify(userCurrentPosition) === JSON.stringify(answer);
    setIsSolved(solved);
    setCheckModalVisible(true);
    if (solved) {
      dispatch(awardCompletionReward());
    }
  };

  const handleCollectReward = async() => {
    if (rewardScore <= 0) return;
    
  try {
    setCollectingReward(true);
    const response = await api.post(
      '/game/sudoku-game',
      {
        aura: rewardScore,
      },
    );

    if (response?.data?.success) {
        dispatch(collectReward());

      dispatch(
    updateUserData({
      aura:
        (user?.userData?.aura || 0) + rewardScore,
    })
    
  );
showToast( `You claimed ${rewardScore} points.`, "success");
    setCollectingReward(false);

    }
  } catch (err) {
    console.log(
      'Claim reward error:',
      err?.response?.data || err.message,
    );
showToast("Failed to Claim  Aura, Try again", "error");
    setCollectingReward(false);
  }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 4. Helper for Highlights
  const getSelectedValue = () => {
    if (!selectedCell) return null;
    return userCurrentPosition[selectedCell.row][selectedCell.col];
  };

  const selectedValue = getSelectedValue();
  const hintsRemaining = MAX_HINTS - hintsTaken;
  const digitCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((acc, digit) => {
    acc[digit] = userCurrentPosition.reduce(
      (total, row) => total + row.filter(value => value === digit).length,
      0
    );
    return acc;
  }, {});

  const renderCell = (row, col) => {
    const val = userCurrentPosition[row][col];
    const isFixed = sudoku[row][col] !== 0;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isSameValue = val !== 0 && val === selectedValue;
    const hasConflict = conflictSet.has(`${row}-${col}`);
    const cellNotes = notes?.[row]?.[col] || [];
    const showNotes = !val && cellNotes.length > 0;

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        activeOpacity={0.8}
        onPress={() => handleCellPress(row, col)}
        onLongPress={() => handleCellLongPress(row, col)}
        style={[
          styles.cell,
          isSelected && styles.cellSelected,
          hasConflict && styles.cellConflict,
          !isSelected && isSameValue && styles.cellHighlightValue,
          // Draw the 3x3 subgrid borders
          col % 3 === 2 && col !== 8 && { borderRightWidth: 3, borderRightColor: '#444' },
          row % 3 === 2 && row !== 8 && { borderBottomWidth: 3, borderBottomColor: '#444' },
        ]}
      >
        {showNotes ? (
          <View style={styles.noteGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((note) => (
              <Text
                key={note}
                style={[
                  styles.noteText,
                  cellNotes.includes(note) && styles.noteTextActive,
                ]}
              >
                {cellNotes.includes(note) ? note : '·'}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={[
            styles.cellText,
            isFixed ? styles.fixedText : styles.userText,
            hasConflict && styles.conflictText,
            isSelected && !hasConflict && { color: '#fff' },
          ]}>
            {val !== 0 ? val : ''}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#00E5FF" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Icon name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.timerContainer}>
            <Icon name="time-outline" size={20} color="#00E5FF" />
            <Text style={styles.timerText}>{formatTime(totalTimeSpent)}</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={handleCheck}>
            <Icon name="checkmark-done-circle" size={28} color="#00E5FF" />
          </TouchableOpacity>
        </View>

        {/* Grid */}
        <View style={styles.gridCard}>
          <View style={styles.grid}>
            {userCurrentPosition.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.noteHint}>
          Long-press an empty cell to jot down multiple candidates.
        </Text>

        {/* Number Pad */}
        <View style={styles.numpad}>
          <TouchableOpacity
            style={[styles.noteToggleBtn, noteMode && styles.noteToggleBtnActive]}
            onPress={() => setNoteMode((prev) => !prev)}
          >
            <Icon name="create-outline" size={18} color={noteMode ? '#000' : '#00E5FF'} />
            <Text style={[styles.noteToggleText, noteMode && styles.noteToggleTextActive]}>
              Notes {noteMode ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              disabled={(digitCounts[num] ?? 0) >= MAX_DIGIT_COUNT}
              style={[
                styles.numBtn,
                (digitCounts[num] ?? 0) >= MAX_DIGIT_COUNT && styles.numBtnDisabled,
              ]}
              onPress={() => handleNumberInput(num)}
            >
              <Text style={styles.numBtnText}>{num}</Text>
              <Text style={styles.numBtnSubtext}>
                {Math.max(0, MAX_DIGIT_COUNT - (digitCounts[num] ?? 0))}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.numBtn, styles.clearBtn]}
            onPress={() => handleNumberInput(0)}
          >
            <Icon name="refresh-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {rewardScore > 0 && (
          <View style={styles.rewardCard}>
            <Text style={styles.rewardLabel}>Reward ready</Text>
            <Text style={styles.rewardValue}>+{rewardScore} score</Text>
            <TouchableOpacity style={styles.rewardBtn} onPress={handleCollectReward} disabled={collectingReward}>
              {collectingReward ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.rewardBtnText}>COLLECT REWARD</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              (!selectedCell || hintsRemaining <= 0) && styles.disabledBtn,
            ]}
            disabled={!selectedCell || hintsRemaining <= 0}
            onPress={() => {
              if (hintsRemaining <= 0) {
                Alert.alert('Hint limit reached', 'You can use up to 5 hints in one Sudoku game.');
                return;
              }
              dispatch(
                takeHint({
                  row: selectedCell?.row,
                  col: selectedCell?.col,
                })
              );
            }}
          >
            <Icon
              name="bulb"
              size={22}
              color={!selectedCell || hintsRemaining <= 0 ? '#666' : '#FFD60A'}
            />
            <Text
              style={[
                styles.actionText,
                (!selectedCell || hintsRemaining <= 0) && { color: '#666' },
              ]}
            >
              Hint {hintsRemaining}/5
            </Text>
          </TouchableOpacity>
        
        </View>
      </ScrollView>

      {/* Modals */}
      <Modal visible={checkModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon 
              name={isSolved ? "trophy" : "close-circle"} 
              size={80} 
              color={isSolved ? "#FFD60A" : "#FF3B30"}  
            />
            <Text style={styles.modalTitle}>{isSolved ? "Masterpiece!" : "Not Quite..."}</Text>
            <Text style={styles.modalText}>
              {isSolved 
                ? "You've conquered this puzzle with precision." 
                : "There are some mistakes in the grid. Keep pushing!"}
            </Text>
            
            <View style={styles.modalActions}>
              {isSolved && (
                <TouchableOpacity style={[styles.primaryBtn,{ minWidth: 200 }]} onPress={createNewGame}>
                  <Text style={styles.primaryBtnText}>New Challenge</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: '#333', marginTop: 10,minWidth: 200 }]} 
                onPress={() => setCheckModalVisible(false)}
              >
                <Text style={styles.primaryBtnText}>Back to Grid</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 28,
  },
  header: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  timerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  timerText: { color: 'white', fontSize: 18, fontWeight: '600', marginLeft: 8, fontVariant: ['tabular-nums'] },
  gridCard: {
    backgroundColor: '#1A1A1A',
    padding: 5,
    borderRadius: 12,
    elevation: 10,
    shadowColor: '#00E5FF',
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  grid: { width: GRID_SIZE, height: GRID_SIZE, backgroundColor: '#333' },
  row: { flexDirection: 'row', flex: 1 },
  cell: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 0.5,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellSelected: {
    backgroundColor: '#1D9BF0',
    borderColor: '#1D9BF0',
    zIndex: 10,
    transform: [{ scale: 1.05 }],
    borderRadius: 4,
  },
  cellConflict: {
    backgroundColor: 'rgba(255, 59, 48, 0.18)',
    borderColor: '#FF3B30',
  },
  cellHighlightValue: { backgroundColor: '#3d3d3d' },
  cellText: { fontSize: CELL_SIZE * 0.5, fontWeight: '600' },
  fixedText: { color: '#888' },
  userText: { color: '#00E5FF' },
  conflictText: { color: '#FF3B30' },
  noteHint: {
    width: '90%',
    color: '#6CAFFF',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '90%',
    marginTop: 30,
  },
  numBtn: {
    width: width * 0.15,
    height: width * 0.15,
    backgroundColor: '#1A1A1A',
    margin: 5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  noteToggleBtn: {
    width: '90%',
    marginBottom: 8,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1D9BF0',
    backgroundColor: '#121212',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteToggleBtnActive: {
    backgroundColor: '#1D9BF0',
    borderColor: '#1D9BF0',
  },
  noteToggleText: {
    color: '#1D9BF0',
    fontWeight: '700',
    marginLeft: 8,
  },
  noteToggleTextActive: {
    color: '#000',
  },
  numBtnText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  numBtnSubtext: { color: '#9AA0A6', fontSize: 11, marginTop: 2, fontWeight: '600' },
  numBtnDisabled: { opacity: 0.45 },
  clearBtn: { borderColor: '#FF3B30' },
  footer: { flexDirection: 'row', marginTop: 20, width: '90%', justifyContent: 'space-around' },
  actionBtn: { alignItems: 'center', padding: 10 },
  actionText: { color: 'white', marginTop: 5, fontSize: 12 },
  rewardCard: {
    width: '90%',
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    alignItems: 'center',
  },
  rewardLabel: {
    color: '#9AA0A6',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rewardValue: {
    color: '#FFD60A',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  rewardBtn: {
    marginTop: 12,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#00E5FF',
    alignItems: 'center',
  },
  rewardBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  noteGrid: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  noteText: {
    width: '33.33%',
    height: '33.33%',
    textAlign: 'center',
    color: 'rgba(29, 155, 240, 0.18)',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 14,
  },
  noteTextActive: {
    color: '#1D9BF0',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#1A1A1A', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', marginVertical: 15 },
  modalText: { color: '#AAA', textAlign: 'center', fontSize: 16, marginBottom: 25 },
  primaryBtn: { backgroundColor: '#00E5FF', width: '100%', padding: 15, borderRadius: 15, alignItems: 'center' },
  primaryBtnText: { color: 'black', fontWeight: 'bold', fontSize: 18 },
  iconBtn: { padding: 5 },
  disabledBtn: {
  opacity: 0.5,
},
});

export default SudokuGame;
