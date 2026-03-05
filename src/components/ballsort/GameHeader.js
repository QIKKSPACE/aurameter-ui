import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const GameHeader = ({ level, onUndo, onRestart, theme }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: theme.components.box + "99",
      }}
    >
      <Text style={{ fontSize: 20, color: theme.text.primary }}>
        Level {level}
      </Text>

      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity onPress={onUndo} style={{ marginLeft: 12 }}>
          <Icon name="undo" size={22} color={theme.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onRestart} style={{ marginLeft: 12 }}>
          <Icon name="restart-alt" size={22} color={theme.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(GameHeader);
