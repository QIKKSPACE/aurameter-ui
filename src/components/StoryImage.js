import React from "react";
import { View, Image, ActivityIndicator, StyleSheet } from "react-native";

export default function StoryImage({ imageUrl, onLoadEnd, onError }) {
  return (
    <View style={styles.wrapper}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
          onLoadEnd={onLoadEnd}
          onError={onError}
        />
      ) : (
        <View style={styles.placeholder}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
});
