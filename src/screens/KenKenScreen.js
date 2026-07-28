import React from 'react';
import { KenKenGameScreen } from '../games/kenken/KenKenGameScreen';

const KenKenScreen = ({ route, navigation }) => {
  const levelId = route?.params?.levelId;

  return <KenKenGameScreen navigation={navigation} levelId={levelId} />;
};

export default KenKenScreen;
