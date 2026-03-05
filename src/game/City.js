import {
  Group,
  Rect,
  LinearGradient,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";
import { useSharedValue, useFrameCallback } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export function City() {
  const scroll = useSharedValue(0);

  useFrameCallback((frame) => {
    scroll.value += 10 * frame.timeSincePreviousFrame / 1000; // VERY slow
    if (scroll.value > height) scroll.value = 0;
  });

  return (
    <Group>
      {/* Sky */}
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: height }}
          colors={["#050608", "#0B0E14"]}
        />
      </Rect>

      {/* Building silhouettes */}
      {Array.from({ length: 12 }).map((_, i) => {
        const buildingWidth = 40 + (i % 3) * 20;
        const buildingHeight = 120 + (i % 4) * 40;
        const x = i * (width / 10);
        const y =
          height -
          buildingHeight -
          ((scroll.value + i * 60) % height);

        return (
          <Rect
            key={i}
            x={x}
            y={y}
            width={buildingWidth}
            height={buildingHeight}
            color="#0A0F1A"
          />
        );
      })}
    </Group>
  );
}
