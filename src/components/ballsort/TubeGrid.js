import React from "react";
import { View } from "react-native";
import Tube from "./Tube";

const TubeGrid = ({
  tubes,
  rowSize,
  onTubePress,
  onTubeLayout,
  selectedTube,
  capacity,
  theme,
  selectStyle,
}) => {
  const rows = [];
  for (let i = 0; i < tubes.length; i += rowSize) {
    rows.push(tubes.slice(i, i + rowSize));
  }

  return (
    <View style={{ alignItems: "center" }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: "row", marginBottom: 20 }}>
          {row.map((tube, i) => {
            const index = r * rowSize + i;
            return (
              <Tube
                key={index}
                tube={tube}
                index={index}
                isSelected={index === selectedTube}
                onPress={() => onTubePress(index)}
                onLayout={(e) =>
                  onTubeLayout(index, e.nativeEvent.layout)
                }
                theme={theme}
                capacity={capacity}
                selectStyle={selectStyle}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default React.memo(TubeGrid);
