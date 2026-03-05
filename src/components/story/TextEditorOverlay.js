import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Slider from "@react-native-community/slider";
import { shallowEqual, useSelector } from "react-redux";

/* ───────────────── CONSTANTS ───────────────── */

const COLORS = [
  "#ffffff",
  "#ff3b30",
  "#ffcc00",
  "#34c759",
  "#007aff",
  "#af52de",
  "#ff2d55",
  "#000000",
];

const DEFAULT_FONT_FAMILY = "Roboto";

/* ───────────────── COMPONENT ───────────────── */

export default function TextEditorOverlay({
  visible,
  layerId,
  onDone,
  onClose,
  canvasWidth,
}) {
  const layer = useSelector(
    state => state.storyCreator.layers.find(l => l.id === layerId),
    shallowEqual
  );

  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState("#ffffff");
  const [align, setAlign] = useState("center");

  /* ───────── Init from layer ───────── */
  useEffect(() => {
    if (!layer?.data) return;

    setText(layer.data.text || "");
    setFontSize(layer.data.fontSize || 36);
    setColor(layer.data.color || "#ffffff");
    setAlign(layer.data.align || "center");
  }, [layer]);

  if (!visible) return null;

  /* ───────────────── RENDER ───────────────── */

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            onDone({
              text,
              fontSize,
              color,
              align,
              fontFamily: DEFAULT_FONT_FAMILY,
              fontWeight: "400",
            })
          }
        >
          <Icon name="check" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Text input */}
      <View style={[styles.textContainer, { maxWidth: canvasWidth - 40 }]}>
        <TextInput
          autoFocus
          multiline
          value={text}
          onChangeText={setText}
          textAlign={align}
          placeholder="Type something"
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={[
            styles.textInput,
            {
              color,
              fontSize,
              fontFamily: DEFAULT_FONT_FAMILY,
              textAlign: align,
            },
          ]}
        />
      </View>

      {/* Controls */}
      <View>
        {/* Font size */}
        <View style={styles.sliderContainer}>
          <Slider
            minimumValue={14}
            maximumValue={72}
            value={fontSize}
            onValueChange={setFontSize}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="rgba(255,255,255,0.3)"
          />
        </View>

        {/* Color picker */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={COLORS}
          keyExtractor={item => item}
          contentContainerStyle={styles.colorList}
          renderItem={({ item }) => {
            const active = item === color;
            return (
              <TouchableOpacity
                onPress={() => setColor(item)}
                style={[
                  styles.colorDot,
                  { backgroundColor: item },
                  active && styles.colorActive,
                ]}
              />
            );
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

/* ───────────────── STYLES ───────────────── */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingTop: 50,
    paddingBottom: 50,
    zIndex: 10000,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  textInput: {
    maxWidth: "100%",
  },

  sliderContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },

  colorList: {
    paddingHorizontal: 20,
  },

  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
  },

  colorActive: {
    borderWidth: 3,
    borderColor: "#fff",
  },
});
