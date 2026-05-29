/**
 * AnimatedBackground.js
 * Static gradient background for the dark theme.
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const AnimatedBackground = ({ theme }) => {
    const firstColor = Array.isArray(theme.bgGradient)
        ? theme.bgGradient[0]
        : '#121212'

    return (
        <View
            style={[
                StyleSheet.absoluteFill,
                { backgroundColor: firstColor },
            ]}
            pointerEvents="none"
        >
            <LinearGradient
                colors={theme.bgGradient}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
        </View>
    );
};

export default memo(AnimatedBackground);
