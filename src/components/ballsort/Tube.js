import React from "react";
import { View, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import Ball from "./Ball";

const Tube = ({
  tube,
  index,
  isSelected,
  onPress,
  onLayout,
  theme,
  capacity,
  selectStyle,
}) => {
  return (
    <TouchableOpacity onPress={onPress} onLayout={onLayout}>
      <View
        style={{
          width: 50,
          height: capacity * 46,
          borderRadius: 20,
          backgroundColor: theme.components.card,
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 10,
        }}
      >
        {tube.map((color, i) => {
          const isTop = i === tube.length - 1;
          return (
            <Animated.View
              key={`${index}-${i}`}
              style={isTop && isSelected ? selectStyle : null}
            >
              <Ball color={color} />
            </Animated.View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(Tube);
