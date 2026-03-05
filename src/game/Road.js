import {
  Path,
  Skia,
  LinearGradient,
  Group,
  Rect,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export function Road() {
  // Road dimensions
  const roadTopWidth = width * 0.35;
  const roadBottomWidth = width * 0.9;

  const roadTopY = 80;
  const roadBottomY = height;

  // Build trapezoid path
  const path = Skia.Path.Make();
  path.moveTo(width / 2 - roadTopWidth / 2, roadTopY);
  path.lineTo(width / 2 + roadTopWidth / 2, roadTopY);
  path.lineTo(width / 2 + roadBottomWidth / 2, roadBottomY);
  path.lineTo(width / 2 - roadBottomWidth / 2, roadBottomY);
  path.close();

  return (
    <Group>
  

      {/* Road */}
      <Path path={path}>
        <LinearGradient
          start={{ x: 0, y: roadTopY }}
          end={{ x: 0, y: roadBottomY }}
          colors={["#0F131A", "#1A1F2A"]}
        />
      </Path>
    </Group>
  );
}
