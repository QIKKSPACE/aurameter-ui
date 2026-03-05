import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../constants/styles";

const WinOverlay = ({ onNext, theme }) => (
  <View style={styles.centerBox}>
    <Text style={[styles.winText, { color: theme.text.accent }]}>
      🎉 Victory!
    </Text>
    <TouchableOpacity
      onPress={onNext}
      style={[
        styles.nextButton,
        { backgroundColor: theme.text.accent },
      ]}
    >
      <Text style={{ fontWeight: "700" }}>Next Level</Text>
    </TouchableOpacity>
  </View>
);

export default React.memo(WinOverlay);
