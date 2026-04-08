/**
 * TicTacToeContext.js
 * React Context to share a single useTicTacToe hook instance
 * across all screens in the TicTacToe module.
 */

import React, { createContext, useContext } from 'react';
import useTicTacToe from './useTicTacToe';

const TicTacToeContext = createContext(null);

/**
 * Provider component — wrap the TicTacToe navigation stack with this.
 * Creates a single useTicTacToe instance shared across all child screens.
 */
export const TicTacToeProvider = ({ children }) => {
    const gameState = useTicTacToe();
    return (
        <TicTacToeContext.Provider value={gameState}>
            {children}
        </TicTacToeContext.Provider>
    );
};

/**
 * Hook to access the shared game state from any TicTacToe screen.
 * @returns {ReturnType<typeof useTicTacToe>}
 */
export const useTicTacToeContext = () => {
    const context = useContext(TicTacToeContext);
    if (!context) {
        throw new Error(
            'useTicTacToeContext must be used within a TicTacToeProvider',
        );
    }
    return context;
};

export default TicTacToeContext;
