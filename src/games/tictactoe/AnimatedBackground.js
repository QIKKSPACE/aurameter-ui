/**
 * AnimatedBackground.js
 * Static gradient background for the dark theme.
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const AnimatedBackground = ({ theme }) => {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
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
