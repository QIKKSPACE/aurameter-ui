import React, { useCallback, useEffect } from "react";
import { Text, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-worklets";

const DELETE_ZONE_HEIGHT = 120;
const LINK_MIN_WIDTH = 150;
const LINK_HEIGHT = 46;
export default function DraggableLayer({
  layer,
  onUpdate,
  onDelete,
  isActive,
  onSelect,
  canvasHeight,
  canvasWidth,
  onMoveStart,
  onMoveEnd, 
    onEditText,   // 👈 new
}) {
  /* ------------------ SHARED VALUES ------------------ */
  const x = useSharedValue(layer.x);
  const y = useSharedValue(layer.y);
  const scale = useSharedValue(layer.scale || 1);
  const rotation = useSharedValue(layer.rotation || 0);
 const LINK_MAX_WIDTH = canvasWidth - 80;

  const startX = useSharedValue(layer.x);
  const startY = useSharedValue(layer.y);
  const startScale = useSharedValue(scale.value);
  const startRotation = useSharedValue(rotation.value);
  const isRotating = useSharedValue(false);
  const isOverDeleteZone = useSharedValue(false);
  
function throttle(fn, delay) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
}
  /* ------------------ SYNC ------------------ */
  useEffect(() => {
    // Only update shared values if the props actually change
    x.value = layer.x;
    y.value = layer.y;
    scale.value = layer.scale || 1;
    rotation.value = layer.rotation || 0;
  }, [layer.x, layer.y, layer.scale, layer.rotation]);

  /* ------------------ HELPER ------------------ */
const syncToUpdate = useCallback(
throttle((changes) => onUpdate(layer.id, changes), 100),
  []
);
  /* ------------------ GESTURES ------------------ */
  const tap = Gesture.Tap()
  .maxDistance(6)        // 👈 VERY important
  .onEnd(() => {
    runOnJS(onSelect)(layer.id);

    if (layer.type === "text") {
      runOnJS(onEditText)(layer);
    }
  });

  const pan = Gesture.Pan()
    .onBegin(() => {
      startX.value = x.value;
      startY.value = y.value;
      runOnJS(onSelect)(layer.id);
      runOnJS(onMoveStart)();
    })
    .onUpdate((e) => {
      x.value = startX.value + e.translationX;
      y.value = startY.value + e.translationY;
      isOverDeleteZone.value = y.value > canvasHeight - DELETE_ZONE_HEIGHT;
    })
    .onEnd(() => {
      runOnJS(onMoveEnd)();
      if (isOverDeleteZone.value) {
        runOnJS(onDelete)(layer.id);
        return;
      }
      runOnJS(syncToUpdate)({ x: x.value, y: y.value });
    });

const pinch = Gesture.Pinch()
  .onBegin(() => {
    startScale.value = scale.value; // store original scale
  })
  .onUpdate((e) => {
    scale.value = startScale.value * e.scale; // just update visual scale
  })
.onEnd(() => {
  runOnJS(syncToUpdate)({
    scale: scale.value,
  });
});
  const rotate = Gesture.Rotation()
    .onBegin(() => {
      isRotating.value = true;
      startRotation.value = rotation.value;
      runOnJS(onSelect)(layer.id);
    })
    .onUpdate((e) => {
      rotation.value = startRotation.value + e.rotation;
    })
    .onEnd(() => {
      isRotating.value = false;
      runOnJS(syncToUpdate)({ rotation: rotation.value });
    });

  const gesture = Gesture.Simultaneous(tap, pan, pinch, rotate);

  /* ------------------ STYLES ------------------ */
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotateZ: `${rotation.value}rad` },
      { scale: scale.value },
    ],
    opacity: withTiming(isOverDeleteZone.value ? 0.5 : 1),
  }));

  const selectionStyle = {
    borderWidth: isActive ? 1.5 : 0,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
  };

  const rotationTextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isRotating.value ? 1 : 0),
    transform: [{ translateY: withTiming(isRotating.value ? -60 : -40) }],
  }));

  const rotationDegrees = useDerivedValue(() =>
    `${Math.round((rotation.value * 180) / Math.PI)}°`
  );
const onLinkTextLayout = (e) => {
  const textWidth = e.nativeEvent.layout.width;

  const finalWidth = Math.min(
    LINK_MAX_WIDTH,
    Math.max(LINK_MIN_WIDTH, textWidth + 32) // padding
  );

  onUpdate(layer.id, {
    width: finalWidth,
    height: LINK_HEIGHT,
  });
};

  /* ------------------ RENDER ------------------ */
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          {
            position: "absolute",
            zIndex: layer.zIndex,
          },
          animatedStyle,
        ]}
      >
         {/* Border Overlay */}
  
        {/* Rotation Text */}
        {isActive && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 30,
                right: 0,
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
              },
              rotationTextAnimatedStyle,
            ]}
          >
            <Animated.Text style={{ color: "white", fontSize: 16 }}>
              {rotationDegrees.value}
            </Animated.Text>
          </Animated.View>
        )}

        {/* Image Layer */}
        {layer.type === "image" && (
          <Image
            source={{ uri: layer.data.url }}
             style={{
    width: layer.data.width,
    height: layer.data.height,
    borderRadius: 8,
  }}
            resizeMode="contain"
          />
        )}

           {layer.type === "sticker" && (
          <Image
            source={{ uri: layer.data.uri }}
            style={{ width: 100, height: 100, borderRadius: 2 }}
            resizeMode="cover"
          />
        )}

        {/* Text Layer */}
     {layer.type === "text" && (
  <Text
  style={{
    maxWidth: canvasWidth-40,
    paddingHorizontal: 0, // no extra padding here
     color: layer.data.color,
      fontSize: layer.data.fontSize,
      fontFamily: layer.data.fontFamily,
      fontWeight: layer.data.fontWeight,
      textAlign: layer.data.align,
  }}
  onLayout={(e) => {
    const { width, height } = e.nativeEvent.layout;
    console.log(width,height)
    onUpdate(layer.id, { width, height });
  }}
>
    {layer.data.text}
  </Text>
)}
{layer.type === "link" && (
  <Animated.View
    style={{
      width: layer.width || LINK_MIN_WIDTH,
      height: LINK_HEIGHT,
      backgroundColor: "#fff",
      borderRadius: LINK_HEIGHT / 2,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
    }}
  >
    {/* Hidden measurer */}
    {!layer.width && (
      <Text
        style={{
          position: "absolute",
          opacity: 0,
          fontSize: layer.data.fontSize || 16,
          fontFamily: layer.data.fontFamily,
        }}
        numberOfLines={1}
        onLayout={onLinkTextLayout}
      >
        {layer.data.text}
      </Text>
    )}

    {/* Visible text */}
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={{
        color: "#000",
        fontSize: layer.data.fontSize || 16,
        fontFamily:'Roboto',
      }}
    >
      {layer.data.text}
    </Text>
  </Animated.View>
)}

      </Animated.View>
    </GestureDetector>
  );
}
