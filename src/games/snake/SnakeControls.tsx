import React, { memo, useCallback, useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../../components/AppText";
import type { Direction } from "./SnakeTypes";

type SnakeControlsProps = {
  onDirectionChange: (direction: Direction) => void;
  onSpeedBoost?: () => void;
  styles: ReturnType<typeof import("./SnakeStyles").createSnakeStyles>;
  theme: any;
};

function SnakeControlsComponent({
  onDirectionChange,
  onSpeedBoost,
  styles,
  theme,
}: SnakeControlsProps) {
  // ULTRA FAST: Direction change only - ZERO overhead
  const handleDirection = useCallback((direction: Direction) => {
    onDirectionChange(direction);
  }, [onDirectionChange]);

  // Double-tap detection for boost button
  const lastBoostTapTimeRef = useRef(0);
  const handleBoost = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastBoostTapTimeRef.current;

    if (timeSinceLastTap < 300) {
      // Double-tap detected - 2x speed boost
      if (onSpeedBoost) {
        onSpeedBoost();
      }
    }

    lastBoostTapTimeRef.current = now;
  }, [onSpeedBoost]);

  const buttonSize = 60;
  const buttonRadius = Math.floor(buttonSize / 2);

  return (
    <View style={styles.controlsWrap}>
      {/* D-Pad Circular Layout */}
      <View
        style={{
          position: "relative",
          width: 240,
          height: 240,
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        {/* UP Button - Top */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => handleDirection("UP")}
          style={{
            position: "absolute",
            top: 0,
            width: buttonSize,
            height: buttonSize,
            backgroundColor: "#F5F5DC",
            borderRadius: buttonRadius,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AppText
            variant="button"
            style={{ color: theme.background.color, fontSize: 18, fontWeight: "bold" }}
          >
            ↑
          </AppText>
        </TouchableOpacity>

        {/* DOWN Button - Bottom */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => handleDirection("DOWN")}
          style={{
            position: "absolute",
            bottom: 0,
            width: buttonSize,
            height: buttonSize,
            backgroundColor: "#F5F5DC",
            borderRadius: buttonRadius,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AppText
            variant="button"
            style={{ color: theme.background.color, fontSize: 18, fontWeight: "bold" }}
          >
            ↓
          </AppText>
        </TouchableOpacity>

        {/* LEFT Button - Left */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => handleDirection("LEFT")}
          style={{
            position: "absolute",
            left: 0,
            width: buttonSize,
            height: buttonSize,
            backgroundColor: "#F5F5DC",
            borderRadius: buttonRadius,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AppText
            variant="button"
            style={{ color: theme.background.color, fontSize: 18, fontWeight: "bold" }}
          >
            ←
          </AppText>
        </TouchableOpacity>

        {/* RIGHT Button - Right */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => handleDirection("RIGHT")}
          style={{
            position: "absolute",
            right: 0,
            width: buttonSize,
            height: buttonSize,
            backgroundColor: "#F5F5DC",
            borderRadius: buttonRadius,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AppText
            variant="button"
            style={{ color: theme.background.color, fontSize: 18, fontWeight: "bold" }}
          >
            →
          </AppText>
        </TouchableOpacity>

        {/* CENTER BOOST Button */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={handleBoost}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#FF6347",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#FF6347",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 8,
            elevation: 12,
          }}
        >
          <AppText
            variant="button"
            style={{ color: "#F5F5DC", fontSize: 14, fontWeight: "bold" }}
          >
            BOOST
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default memo(SnakeControlsComponent);
