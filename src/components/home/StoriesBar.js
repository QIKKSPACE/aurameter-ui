// components/home/StoriesBar.js
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import StoryItem from "./StoryItem";

const StoriesBar = ({ stories }) => {
  return (
   <FlatList
  data={stories}
  horizontal
  keyExtractor={item => item.user_id}
  renderItem={({ item, index }) => (
    <StoryItem userId={item.user_id} index={index} />
  )}

      contentContainerStyle={styles.row}
      showsHorizontalScrollIndicator={false}
/>
  );
};

export default StoriesBar;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    padding: 10,
    marginTop: 10,
    alignItems: "center",
  },
});
