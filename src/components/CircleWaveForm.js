import React, { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, Animated, StyleSheet, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
  const { width, height } = Dimensions.get("window");
const CircleWaveForm = ({ isPlaying, }) => {
  const bars = [useRef(new Animated.Value(1)), useRef(new Animated.Value(2)), useRef(new Animated.Value(1.5)),useRef(new Animated.Value(1.9)
)];

  // Function to start animation
  const startWaveAnimation = () => {
    bars.forEach((bar, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar.current, { toValue: 3, duration: 400 + index * 100, useNativeDriver: false }),
          Animated.timing(bar.current, { toValue: 1, duration: 400 + index * 100, useNativeDriver: false }),
        ])
      ).start();
    });
  };

  // Stop animation when audio is paused
  useEffect(() => {
    if (isPlaying) {
      startWaveAnimation();
    } else {
      bars.forEach((bar) => bar.current.setValue(1));
    }
  }, [isPlaying]);

  return (
    <TouchableOpacity  style={styles.audioMessage}>
      <View style={styles.waveContainer}>
        {bars.map((bar, index) => (
          <Animated.View key={index} style={[styles.waveBar, { height: bar.current.interpolate({ inputRange: [1, 3], outputRange: [10, 25] }) }]} />
        ))}
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
    audioMessage: {
        width:80,
        height:80,
        borderRadius:40,
      flexDirection: "row",
      alignItems: "center",
        borderColor:'#00E5FF',
        borderWidth:3,
       alignItems:'center',justifyContent:'center',
      left:width/2-45,
       bottom:65,
       marginVertical:10,
       
       zIndex:1300
    },
    waveContainer: {
      flexDirection: "row",
      alignItems: "center",
  
    },
    waveBar: {
      width: 4,
      backgroundColor: "white",
      marginHorizontal: 3,
      borderRadius: 2,
    },
  });
  
export default CircleWaveForm;
