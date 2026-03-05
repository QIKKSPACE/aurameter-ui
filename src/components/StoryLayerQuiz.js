import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
const DESIGN_WIDTH = 1080;
const DESIGN_HEIGHT = 1920;
const QuizRenderComponent = ({ quiz,  onLongPress }) => {
     const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
   
      const editorScale = useMemo(
         () => Math.min(SCREEN_W / DESIGN_WIDTH, SCREEN_H / DESIGN_HEIGHT),
         [SCREEN_W, SCREEN_H]
       );
  const width = 320;
  const height = 170;

  return (
    <View style={[styles.overlay, {
         left: SCREEN_W / 2 - width / 2 / editorScale,
        top: SCREEN_H / 2 - height / 2 / editorScale,
        width: width / editorScale,  
        height: height / editorScale,
    }]}>
      <Pressable
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.card,
          { transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
      >
        <LinearGradient
          colors={["#ffffff", "#f9c8ef"]}
          style={styles.gradient}
        >
          <Text numberOfLines={1} style={styles.title}>
            {quiz.data.title}
          </Text>

          <View style={styles.divider} />

          <Text numberOfLines={2} style={styles.description}>
            {quiz.data.description}
          </Text>

          <View style={styles.cta}>
            <Text style={styles.ctaText}>Long Press To Answer</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
};

export default QuizRenderComponent;
const styles = StyleSheet.create({
 overlay: {
  position: "absolute",
  
  alignItems: "center",
  justifyContent: "center",
},

  card: {
    width: 320,
    height: 170,
    borderRadius: 26,
    overflow: "hidden",
  },

  gradient: {
    flex: 1,
    padding: 16,
    borderRadius: 26,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
    marginBottom: 6,
  },

  divider: {
    height: 1,
    width: "60%",
    backgroundColor: "rgba(0,0,0,0.08)",
    alignSelf: "center",
    marginVertical: 6,
  },

  description: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 12,
  },

  cta: {
    alignSelf: "center",
    backgroundColor: "#111",
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 999,
  },

  ctaText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
