import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  useWindowDimensions,
  Pressable,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";

const EDITOR_WIDTH = 1080;
const EDITOR_HEIGHT = 1920;
const LINK_MIN_WIDTH = 150;
const LINK_HEIGHT = 46;

const StoryLayersRenderer = ({ layers }) => {
  if (!layers?.length) return null;

  const { width: screenW, height: screenH } =  Dimensions.get("window");
  const [activeLink, setActiveLink] = useState(null);


    
       const editorScale = useMemo(
          () => Math.min(screenW / EDITOR_WIDTH, screenH / EDITOR_HEIGHT),
          [screenW, screenH]
        );

  const offsetX = (screenW - EDITOR_WIDTH * editorScale) / 2;
  const offsetY = (screenH - EDITOR_HEIGHT * editorScale) / 2;

  const map = (layer) => ({
    x: offsetX + layer.x * editorScale,
    y: offsetY + layer.y * editorScale-layer.height,
    width: layer.width || LINK_MIN_WIDTH,
    height: layer.height ?? layer.data.height,
    fontSize: layer.data.fontSize ?? 14,
  });

  const LinkLayer = ({ layer }) => {
    const m = map(layer);

    return (
      <Pressable
        onPress={() => setActiveLink({ layer, metrics: m })}
        style={[
          styles.layer,
          {
            width: m.width,
            height: m.height,
            backgroundColor: layer.data.backgroundColor,
              zIndex: 999999,
  elevation: 999, // 🔑 ANDROID

            transform: [
              { translateX: m.x },
              { translateY: m.y },
              { rotate: `${layer.rotation}rad` },
              { scale: layer.scale ?? 1 },
            ],
          },
        ]}
      >
        <Text
          style={{
            color: layer.data.color,
            fontSize: m.fontSize,
            fontFamily: layer.data.fontFamily,
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {layer.data.text}
        </Text>
      </Pressable>
    );
  };

  return (
    <Pressable
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
      onPress={() => setActiveLink(null)}
    >
      {layers
        .slice()
        .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
        .map((layer) =>
          layer.type === "link" ? (
            <LinkLayer key={layer.id} layer={layer} />
          ) : null
        )}

  {activeLink && (
  <View style={styles.pillCenterWrapper} pointerEvents="box-none">
    <TouchableOpacity style={styles.pill}             onPress={() => {
  
              if (activeLink?.layer.data.url) {
                Linking.openURL(activeLink.layer?.data.url);
                setActiveLink(null)
              }
            }}
>
      <Text style={styles.pillText}>Follow link</Text>
    </TouchableOpacity>
  </View>
)}
    </Pressable>
  );
};

export default StoryLayersRenderer;

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    zIndex:10
  },
  pill: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  pillCenterWrapper: {
  flex:1,
  alignItems: "center",
  justifyContent: "center",
  paddingTop:250,
  zIndex: 999999,
  elevation: 999, // Android
},

});
