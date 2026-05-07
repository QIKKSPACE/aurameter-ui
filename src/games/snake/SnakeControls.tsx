import React, { memo } from "react";
import { View } from "react-native";
import AppText from "../../components/AppText";

type SnakeControlsProps = {
  onSpeedBoost?: () => void;
  styles: ReturnType<typeof import("./SnakeStyles").createSnakeStyles>;
  theme: any;
};

function SnakeControlsComponent({
  theme,
}: SnakeControlsProps) {
  // Visual indicator only — all touch handling is done by PanResponder on parent screen
  // This component is purely decorative and transparent to touches
  return (
    <View
      style={{
        pointerEvents: "none",
      }}
    >
      {/* Boost Indicator — visual hint, touches pass through to PanResponder */}
      <View
        style={{
          backgroundColor: "rgba(231,76,60,0.15)",
          borderRadius: 20,
          paddingHorizontal: 20,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: "rgba(231,76,60,0.4)",
          alignSelf: "center",
        }}
      >
        <AppText
          variant="caption"
          style={{ color: "#E74C3C", fontSize: 11, textAlign: "center" }}
        >
          TAP = BOOST  ·  SWIPE = STEER
        </AppText>
      </View>
    </View>
  );
}

export default memo(SnakeControlsComponent);
