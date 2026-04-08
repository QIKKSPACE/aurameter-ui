/**
 * TicTacToeNavigator.js
 * Nested stack with a shared TicTacToeProvider so all TicTacToe screens
 * operate on a single game/progression state instance.
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TicTacToeProvider } from './TicTacToeContext';
import GameScreen from './GameScreen';
import LevelScreen from './LevelScreen';

const Stack = createStackNavigator();

const screenOptions = { headerShown: false };

const TicTacToeNavigator = () => {
    return (
        <TicTacToeProvider>
            <Stack.Navigator
                initialRouteName="TicTacToeLevels"
                screenOptions={screenOptions}
            >
                <Stack.Screen name="TicTacToeGame" component={GameScreen} />
                <Stack.Screen name="TicTacToeLevels" component={LevelScreen} />
            </Stack.Navigator>
        </TicTacToeProvider>
    );
};

export default TicTacToeNavigator;
