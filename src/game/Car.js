import {
  Group,
  RoundedRect,
  LinearGradient,
  Rect,
  Shadow,
  BlurMask,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";
import { useSharedValue, useFrameCallback } from "react-native-reanimated";
const { width, height } = Dimensions.get("window");

export function Car() {
  const carX = width / 2;
  const carY = height * 0.72;
const bob = useSharedValue(0);

useFrameCallback((frame) => {
  bob.value = Math.sin(frame.timeSinceFirstFrame / 300) * 2;
});
  return (
  <Group
  transform={[
    { translateX: carX },
    { translateY: carY + bob.value },
    { scaleY: 0.88 },          // perspective squash
    { skewX: -0.08 },          // camera angle illusion
  ]}
>

      
      {/* 1. REALISTIC AMBIENT OCCLUSION SHADOW */}
      <RoundedRect x={-30} y={-45} width={60} height={95} r={15} color="rgba(0,0,0,0.35)">
        <BlurMask blur={15} style="normal" />
      </RoundedRect>

      {/* 2. WHEELS WITH DETAIL */}
      {[-28, 18].map((xPos) => (
        <Group key={xPos}>
          {/* Tire */}
          <RoundedRect x={xPos} y={-10} width={12} height={30} r={4} color="#1A1A1A" />
          {/* Tire Tread Highlight */}
          <Rect x={xPos + 2} y={-5} width={2} height={20} color="rgba(255,255,255,0.05)" />
        </Group>
      ))}

      {/* 3. MAIN BODY WITH METALLIC GRADIENT */}
      <RoundedRect x={-26} y={-45} width={52} height={90} r={14}>
        <LinearGradient
          start={{ x: -26, y: 0 }}
          end={{ x: 26, y: 0 }}
          colors={["#0F172A", "#2563EB", "#1E40AF", "#0F172A"]} // Simulates light hitting the curve
        />
        <Shadow dx={0} dy={2} blur={5} color="rgba(255,255,255,0.3)" inner />
      </RoundedRect>

      {/* 4. REFINED CABIN & GLASS */}
      <Group>
        {/* Roof */}
        <RoundedRect x={-19} y={-35} width={38} height={42} r={8} color="#1E293B" />
        
        {/* Windshield with Sky Reflection */}
        <RoundedRect x={-16} y={-31} width={32} height={20} r={5}>
          <LinearGradient
            start={{ x: -16, y: -31 }}
            end={{ x: 16, y: -11 }}
            colors={["#475569", "#94A3B8", "#475569"]} 
          />
        </RoundedRect>

        {/* Glossy Reflection Streak on Windshield */}
        <Rect x={-8} y={-31} width={4} height={20} color="rgba(255,255,255,0.2)" />
      </Group>

      {/* 5. CAR DETAILS (Headlights & Grille) */}
      {/* Headlights */}
      <RoundedRect x={-22} y={-44} width={10} height={4} r={2} color="#FDE047">
        <Shadow dx={0} dy={0} blur={10} color="#FDE047" />
      </RoundedRect>
      <RoundedRect x={12} y={-44} width={10} height={4} r={2} color="#FDE047">
        <Shadow dx={0} dy={0} blur={10} color="#FDE047" />
      </RoundedRect>

      {/* Hood Lines */}
      <Rect x={-10} y={-45} width={0.5} height={15} color="rgba(0,0,0,0.3)" />
      <Rect x={10} y={-45} width={0.5} height={15} color="rgba(0,0,0,0.3)" />

    </Group>
  );
}