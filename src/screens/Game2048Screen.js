import React from 'react';
import Game2048Screen from '../games/game2048/Game2048Screen';

const Game2048ScreenWrapper = ({ route, navigation }) => {
  return <Game2048Screen navigation={navigation} />;
};

export default Game2048ScreenWrapper;
