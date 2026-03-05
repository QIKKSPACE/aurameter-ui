import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  AppState,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { generateSudokuPuzzle } from '../hooks/useGenerateSudokuPuzzle';
import { setFocusState, setPuzzle, showAnswer, takeHint, updateCell,incrementTime } from '../store/sudokuSlice';


const screenWidth = Dimensions.get('window').width;
const gridSize = Math.min(screenWidth - 40, 360);
const cellSize = gridSize / 9;

const SudokuGame = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const appState = useRef(AppState.currentState);

  const { sudoku, answer, userCurrentPosition, updatedAt, totalTimeSpent } =
    useSelector((state) => state.sudoku);

  const [loading, setLoading] = useState(true);
  const [focusedCell, setFocusedCell] = useState(null);

  useEffect(() => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (!sudoku.length || !updatedAt || now - updatedAt > twentyFourHours) {
      const { puzzle, solution } = generateSudokuPuzzle();
      dispatch(setPuzzle({
  puzzle,
  solution,
  previousAnswer: solution,
}));

    }

    setLoading(false);
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(() => {
      if (isMounted && appState.current === 'active') {
        try {
          dispatch(incrementTime());
        } catch (err) {
          console.warn('Increment time error:', err);
        }
      }
    }, 1000);

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (isMounted) {
        appState.current = nextAppState;
        try {
          dispatch(setFocusState(nextAppState === 'active'));
        } catch (err) {
          console.warn('AppState error:', err);
        }
      }
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
      subscription.remove();
    };
  }, [dispatch]);

  const handleInputChange = (value, rowIndex, colIndex) => {
    if (!isNaN(value)) {
     dispatch(
  updateCell({
    row: rowIndex,
    col: colIndex,
    value: value ? parseInt(value, 10) : 0,
  })
);

    }
  };

  const handleHint = () => {
    if (focusedCell) {
      dispatch(takeHint({row:focusedCell.rowIndex, col:focusedCell.colIndex}));
      setFocusedCell(null);
    }
  };
//2d25f4e5-c7ab-4bdc-a122-25293abb6984,ucdvpnkf
  const checkSolution = () => {
    if (JSON.stringify(userCurrentPosition) === JSON.stringify(answer)) {
      Alert.alert('🎉 Congratulations!', 'You have solved the puzzle!');
    } else {
      Alert.alert('❌ Try Again', 'The solution is not correct.');
    }
  };

  const renderPuzzle = () => (
    <View style={styles.grid}>
      {sudoku.map((row, rowIndex) => (
        <View
          style={[
            styles.row,
            rowIndex % 3 === 0 ? styles.thickTopBorder : {},
            rowIndex === 8 ? styles.thickBottomBorder : {},
          ]}
          key={rowIndex}
        >
          {row.map((_, colIndex) => (
            <View
              style={[
                styles.cellContainer,
                colIndex % 3 === 0 ? styles.thickLeftBorder : {},
                colIndex === 8 ? styles.thickRightBorder : {},
              ]}
              key={colIndex}
            >
            <TextInput
  style={[styles.cell,sudoku[rowIndex][colIndex] === 0?{backgroundColor:'black'}:{}]}
  keyboardType="numeric"
  maxLength={1}
  value={
    userCurrentPosition?.[rowIndex]?.[colIndex] === 0
      ? ''
      : userCurrentPosition?.[rowIndex]?.[colIndex]?.toString()
  }
  onFocus={() => setFocusedCell({ rowIndex, colIndex })}
  onBlur={() => setFocusedCell(null)}
  onChangeText={(value) =>
    handleInputChange(value, rowIndex, colIndex)
  }
  editable={sudoku[rowIndex][colIndex] === 0} // Only disable if the initial value is not 0 (pre-filled cell)
  selectTextOnFocus={true} // Optionally, automatically select text when focused
/>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#E5E5E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sudoku Puzzle</Text>
      </View>

      {loading || !sudoku.length ? (
        <ActivityIndicator
          size="large"
          color="#00E5FF"
          style={{ marginTop: 100 }}
        />
      ) : (
        <>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleHint}>
              <Text style={styles.buttonText}>💡 Hint</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => dispatch(showAnswer())}
            >
              <Text style={styles.buttonText}>🧠 Solve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={checkSolution}>
              <Text style={styles.buttonText}>✅ Check</Text>
            </TouchableOpacity>
          </View>

          {renderPuzzle()}
          <Text style={styles.timerText}>⏱ Time: {totalTimeSpent}s</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0D1B2A',
    paddingTop: 80,
  },
  row: {
    flexDirection: 'row',
  },
  cellContainer: {
    margin: 1,
  },
 cell: {
  width: cellSize,
  height: cellSize,
  backgroundColor: '#1B263B',
  borderRadius: 5,
  borderWidth: 1,
  borderColor: '#00E5FF',
   alignItems:'center',
   justifyContent:'center',
  textAlign: 'center',
  textAlignVertical: 'center', // ✅ ANDROID FIX
  padding: 0,                  // ✅ removes offset
  margin: 0,

  color: 'wheat',
  fontSize: cellSize * 0.3,    // ✅ dynamic perfect size
},
  header: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    padding: 20,
  },
  headerTitle: {
    color: '#E5E5E5',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  grid: {
    width: gridSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  thickTopBorder: {
    borderTopWidth: 2,
    borderTopColor: 'white',
  },
  thickLeftBorder: {
    borderLeftWidth: 2,
    borderLeftColor: 'white',
  },
  thickBottomBorder: {
    borderBottomWidth: 2,
    borderBottomColor: 'white',
  },
  thickRightBorder: {
    borderRightWidth: 2,
    borderRightColor: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1B263B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderColor: '#00E5FF',
    borderWidth: 1,
  },
  buttonText: {
    color: 'wheat',
    fontSize: 14,
  },
  timerText: {
    color: '#E5E5E5',
    marginTop: 10,
    fontSize: 16,
  },
});

export default SudokuGame;