import React, { useCallback, useEffect, useMemo } from "react";
import { Text, Image, View, TouchableOpacity, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
  runOnJS
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import LinearGradient from "react-native-linear-gradient";


/* ───────────────── CONSTANTS ───────────────── */
const DELETE_ZONE_HEIGHT = 120;
const LINK_MIN_WIDTH = 150;
const LINK_HEIGHT = 46;

/* ───────────────── UTILS ───────────────── */
const throttle = (fn, delay = 100) => {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
};

/* ───────────────── COMPONENT ───────────────── */
export default function DraggableLayer({
  layer,
  editorScale,          // 🔑 REQUIRED
  canvasWidth,          // = 1080
  canvasHeight,         // = 1920
  isActive,
  onSelect,
  onUpdate,
  onDelete,
  onMoveStart,
  onMoveEnd,
  onEditText,
}) {
  /* ───────────── SHARED VALUES (
  DESIGN SPACE) ───────────── */

if (layer.type === "quiz") {
  const width = 320;
  const height = 170;

  return (
    <Pressable
      onLongPress={() => onDelete(layer.id)}
      style={({ pressed }) => ({
        position: "absolute",
        left: canvasWidth / 2 - width / 2 / editorScale,
        top: canvasHeight / 2 - height / 2 / editorScale,
        width: width / editorScale,  
        height: height / editorScale,
        borderRadius: 26 / editorScale,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        zIndex: layer.zIndex,
      })}
    >
      <LinearGradient
        colors={["#ffffff", "#f9c8ef"]}
        style={{
          flex: 1,
          padding: 16 / editorScale,
          borderRadius: 26 / editorScale,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6,
        }}
      >
        {/* TITLE */}
        <Text
          numberOfLines={1}
          style={{
            fontSize: 20 / editorScale,
            fontWeight: "800",
            color: "#111",
            textAlign: "center",
            marginBottom: 6 / editorScale,
          }}
        >
          {layer.data.title}
        </Text>

        {/* DIVIDER */}
        <View
          style={{
            height: 1,
            width: "60%",
            backgroundColor: "rgba(0,0,0,0.08)",
            alignSelf: "center",
            marginVertical: 6 / editorScale,
          }}
        />

        {/* DESCRIPTION */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: 14 / editorScale,
            color: "#555",
            textAlign: "center",
            lineHeight: 18 / editorScale,
            marginBottom: 12 / editorScale,
          }}
        >
          {layer.data.description}
        </Text>

        {/* CTA */}
        <View
          style={{
            alignSelf: "center",
            backgroundColor: "#111",
            paddingHorizontal: 22 / editorScale,
            paddingVertical: 8 / editorScale,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 13 / editorScale,
              fontWeight: "700",
              letterSpacing: 0.3,
            }}
          >
            Long Press To Delete
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

  const x = useSharedValue(layer.x);
  const y = useSharedValue(layer.y);
  const scale = useSharedValue(layer.scale ?? 1);
  const rotation = useSharedValue(layer.rotation ?? 0);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startRotation = useSharedValue(0);

  const isRotating = useSharedValue(false);
  const isOverDeleteZone = useSharedValue(false);

  /* ───────────── PROP → SHARED SYNC ───────────── */
  useEffect(() => {
    x.value = layer.x;
    y.value = layer.y;
    scale.value = layer.scale ?? 1;
    rotation.value = layer.rotation ?? 0;
  }, [layer.x, layer.y, layer.scale, layer.rotation]);

  /* ───────────── THROTTLED UPDATE ───────────── */
  const syncUpdate = useMemo(
    () => throttle((data) => onUpdate(layer.id, data), 100),
    [layer.id, onUpdate]
  );

  /* ───────────────── GESTURES ───────────────── */

  const tap = Gesture.Tap()
    .maxDistance(6)
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
      // 🔑 divide by editorScale
      x.value = startX.value + e.translationX / editorScale;
      y.value = startY.value + e.translationY / editorScale;

      isOverDeleteZone.value =
        y.value > canvasHeight - DELETE_ZONE_HEIGHT;
    })
    .onEnd(() => {
      runOnJS(onMoveEnd)();

      if (isOverDeleteZone.value) {
        runOnJS(onDelete)(layer.id);
        return;
      }

      runOnJS(syncUpdate)({
        x: x.value,
        y: y.value,
      });
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = startScale.value * e.scale;
    })
    .onEnd(() => {
      runOnJS(syncUpdate)({ scale: scale.value });
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
      runOnJS(syncUpdate)({ rotation: rotation.value });
    });

  const gesture = Gesture.Simultaneous(tap, pan, pinch, rotate);

  /* ───────────────── STYLES ───────────────── */

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotateZ: `${rotation.value}rad` },
      { scale: scale.value },
    ],
    opacity: withTiming(isOverDeleteZone.value ? 0.5 : 1),
  }));

  const rotationTextStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isRotating.value ? 1 : 0),
    transform: [
      { translateY: withTiming(isRotating.value ? -60 : -40) },
    ],
  }));

  const rotationDegrees = useDerivedValue(
    () => `${Math.round((rotation.value * 180) / Math.PI)}°`
  );

  /* ───────────────── RENDER ───────────────── */
const STICKER_SIZE = 100 / editorScale;
const LINK_WIDTH = (layer.width || LINK_MIN_WIDTH) / editorScale;
const LINK_HEIGHT_DS = LINK_HEIGHT / editorScale;
const LINK_FONT_SIZE = 14 / editorScale;
const LINK_LINE_HEIGHT = 18 / editorScale;
const containerStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: x.value },
    { translateY: y.value },
    { rotateZ: `${rotation.value}rad` },
  ],
}));

const scaleStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
  return (
    <GestureDetector gesture={gesture}>
 <Animated.View
  style={[
    { position: "absolute", zIndex: layer.zIndex },
    containerStyle,
  ]}
>
  <Animated.View style={scaleStyle}>
        {/* Rotation HUD */}
        {isActive && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 30,
                right: 0,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
              },
              rotationTextStyle,
            ]}
          >
            <Animated.Text style={{ color: "#fff", fontSize: 16 }}>
              {rotationDegrees.value}
            </Animated.Text>
          </Animated.View>
        )}

        {/* IMAGE */}
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
    style={{
      width: layer.data.width,
      height: layer.data.height,
              zIndex:layer?.zIndex

    }}
    resizeMode="contain"
  />
)}
        {/* TEXT */}
        {layer.type === "text" && (
          <Text
            style={{
              maxWidth: canvasWidth - 40,
              color: layer.data.color,
              fontSize: layer.data.fontSize*3,
              fontFamily: layer.data.fontFamily,
              fontWeight: layer.data.fontWeight,
              textAlign: layer.data.align,
              zIndex:layer?.zIndex
            }}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              onUpdate(layer.id, { width, height });
            }}
          >
            {layer.data.text}
          </Text>
        )}

        {/* LINK */}
       {layer.type === "link" && (
  <Animated.View
    style={{
      width: LINK_WIDTH,
      height: LINK_HEIGHT_DS,
      backgroundColor: "#fff",
      borderRadius: LINK_HEIGHT_DS / 2,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16 / editorScale,
    }}
  >
    <Text
  numberOfLines={1}
  style={{
    color: "#000",
    fontSize: LINK_FONT_SIZE,
    lineHeight: LINK_LINE_HEIGHT,
  }}
>
  {layer.data.text}
</Text>
  </Animated.View>
)}
         </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}



/*{layer.type === "sticker" && (() => {
  // 1. Load the animated image (WebP or GIF)
  // useAnimatedImageValue automatically manages the frames
  const animatedSticker = useAnimatedImageValue(layer.data.uri);

  return (
    <Canvas 
      style={{
        width: layer.data.width,
        height: layer.data.height,
        zIndex: layer?.zIndex
      }}
    >
      <SkiaImage
        image={animatedSticker}
        x={0}
        y={0}
        width={layer.data.width}
        height={layer.data.height}
        fit="contain"
      />
    </Canvas>
  );
})()} */