import React, { useEffect, useState, useRef, useMemo } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { generateSudokuPuzzle } from '../hooks/useGenerateSudokuPuzzle';
import { setFocusState, setPuzzle, showAnswer, takeHint, updateCell, incrementTime } from '../store/sudokuSlice';

const { width } = Dimensions.get('window');
const GRID_SIZE = width - 30;
const CELL_SIZE = (GRID_SIZE - 10) / 9; // Account for borders
const MAX_HINTS = 5;

const SudokuGame = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const appState = useRef(AppState.currentState);

  const { sudoku, answer, userCurrentPosition, totalTimeSpent, hintsTaken } = useSelector((state) => state.sudoku);

  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null); // { row, col }
  const [checkModalVisible, setCheckModalVisible] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  // 1. Initial Load Logic
  useEffect(() => {
    if (!sudoku.length) {
      createNewGame();
    }
    setLoading(false);
  }, []);

  const createNewGame = () => {
    const { puzzle, solution } = generateSudokuPuzzle();
    dispatch(setPuzzle({ puzzle, solution, previousAnswer: solution }));
    setIsSolved(false);
    setCheckModalVisible(false);
  };

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
      if (sudoku[row][col] === 0) { // Only update if not a fixed starting number
        dispatch(updateCell({ row, col, value: num }));
      }
    }
  };

  const handleCheck = () => {
    const solved = JSON.stringify(userCurrentPosition) === JSON.stringify(answer);
    setIsSolved(solved);
    setCheckModalVisible(true);
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

  const selectedValue = useMemo(() => getSelectedValue(), [selectedCell, userCurrentPosition]);
  const hintsRemaining = MAX_HINTS - hintsTaken;

  const renderCell = (row, col) => {
    const val = userCurrentPosition[row][col];
    const isFixed = sudoku[row][col] !== 0;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isSameValue = val !== 0 && val === selectedValue;

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        activeOpacity={0.8}
        onPress={() => setSelectedCell({ row, col })}
        style={[
          styles.cell,
          isSelected && styles.cellSelected,
          !isSelected && isSameValue && styles.cellHighlightValue,
          // Draw the 3x3 subgrid borders
          col % 3 === 2 && col !== 8 && { borderRightWidth: 3, borderRightColor: '#444' },
          row % 3 === 2 && row !== 8 && { borderBottomWidth: 3, borderBottomColor: '#444' },
        ]}
      >
        <Text style={[
          styles.cellText,
          isFixed ? styles.fixedText : styles.userText,
          isSelected && { color: '#fff' }
        ]}>
          {val !== 0 ? val : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#00E5FF" /></View>;

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Number Pad */}
      <View style={styles.numpad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity 
            key={num} 
            style={styles.numBtn} 
            onPress={() => handleNumberInput(num)}
          >
            <Text style={styles.numBtnText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity 
          style={[styles.numBtn, styles.clearBtn]} 
          onPress={() => handleNumberInput(0)}
        >
          <Icon name="refresh-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.footer}>
       <TouchableOpacity
  style={[
    styles.actionBtn,
    (!selectedCell || hintsRemaining <= 0) && styles.disabledBtn
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
      (!selectedCell || hintsRemaining <= 0) && { color: '#666' }
    ]}
  >
    Hint {hintsRemaining}/5
  </Text>
</TouchableOpacity>
       
      </View>

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
                <TouchableOpacity style={styles.primaryBtn} onPress={createNewGame}>
                  <Text style={styles.primaryBtnText}>New Challenge</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: '#333', marginTop: 10 }]} 
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
  container: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center' },
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
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF',
    zIndex: 10,
    transform: [{ scale: 1.05 }],
    borderRadius: 4,
  },
  cellHighlightValue: { backgroundColor: '#3d3d3d' },
  cellText: { fontSize: CELL_SIZE * 0.5, fontWeight: '600' },
  fixedText: { color: '#888' },
  userText: { color: '#00E5FF' },
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
  numBtnText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  clearBtn: { borderColor: '#FF3B30' },
  footer: { flexDirection: 'row', marginTop: 20, width: '90%', justifyContent: 'space-around' },
  actionBtn: { alignItems: 'center', padding: 10 },
  actionText: { color: 'white', marginTop: 5, fontSize: 12 },
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
