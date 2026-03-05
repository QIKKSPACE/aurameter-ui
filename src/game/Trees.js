import {
  Group,
  Rect,
  Circle,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";
import { useSharedValue, useFrameCallback } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export function Trees() {
  const scroll = useSharedValue(0);

  useFrameCallback((frame) => {
    scroll.value += 120 * frame.timeSincePreviousFrame / 1000; // faster
    if (scroll.value > height) scroll.value = 0;
  });

  return (
    <Group>
      {Array.from({ length: 8 }).map((_, i) => {
        const y = height - ((scroll.value + i * 180) % height);

        return (
          <Group key={i}>
            {/* Left tree */}
            <Group transform={[{ translateX: 40 }, { translateY: y }]}>
              <Rect x={-4} y={0} width={8} height={24} color="#1C2A1A" />
              <Circle cx={0} cy={-10} r={14} color="#0F3D2E" />
            </Group>

            {/* Right tree */}
            <Group transform={[{ translateX: width - 40 }, { translateY: y + 90 }]}>
              <Rect x={-4} y={0} width={8} height={24} color="#1C2A1A" />
              <Circle cx={0} cy={-10} r={14} color="#0F3D2E" />
            </Group>
          </Group>
        );
      })}
    </Group>
  );
}
