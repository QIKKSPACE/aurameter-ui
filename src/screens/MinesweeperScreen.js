import React from 'react';
import MinesweeperGameScreen from '../games/minesweeper/MinesweeperGameScreen';

const MinesweeperScreen = ({ route, navigation }) => {
  const difficulty = route?.params?.difficulty || 'beginner';

  return <MinesweeperGameScreen navigation={navigation} initialDifficulty={difficulty} />;
};

export default MinesweeperScreen;
