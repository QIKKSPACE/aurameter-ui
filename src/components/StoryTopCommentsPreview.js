import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import Animated, {
  FadeInUp,
  FadeOutUp,
} from "react-native-reanimated";
import { makeSelectCommentsByStoryId, makeSelectCommentsWithMeta } from "../store/commentSelector";

/* -------------------- CONFIG -------------------- */

const MAX_COMMENTS = 10;
const SHOW_DELAY_MS = 2000;


/* -------------------- COMPONENT -------------------- */

const StoryTopCommentsPreview = React.memo(({ storyId }) => {
  /* -------- Redux -------- */

const selectComments = useMemo(makeSelectCommentsWithMeta, []);

const { comments:storeComments, isLoading, isError } = useSelector(state =>
  selectComments(state, storyId)
);
  /* -------- Local State -------- */

  const [visibleIndex, setVisibleIndex] = useState(-1);

  /* -------- Derived Data -------- */

  const comments = useMemo(() => {
    if (storeComments?.length > 0) {
      return storeComments.slice(0, MAX_COMMENTS);
    }
    return [];
  }, [storeComments]);

  /* -------- Sequential Display Logic -------- */

  useEffect(() => {
    if (!comments.length) return;

    let index = 0;
    setVisibleIndex(-1);

    const timer = setInterval(() => {
      setVisibleIndex(index);
      index += 1;

      if (index >= comments.length) {
        clearInterval(timer);
      }
    }, SHOW_DELAY_MS);

    return () => clearInterval(timer);
  }, [comments, storyId]);

  /* -------- Guard -------- */

  if (visibleIndex < 0 || !comments[visibleIndex]) return null;

  const comment = comments[visibleIndex];

  /* -------------------- UI -------------------- */

  return (
    <View style={styles.container}>
      <Animated.View
        key={comment.id}
        entering={FadeInUp.springify()}
        exiting={FadeOutUp.springify()}
        style={styles.commentRow}
      >
        <Image
          source={{ uri: comment.user.avatar }}
          style={styles.avatar}
        />

        <Text style={styles.text} numberOfLines={1}>
          {comment.text}
        </Text>
      </Animated.View>
    </View>
  );
});

export default StoryTopCommentsPreview;

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

commentRow: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.35)",
  borderRadius: 20,
  paddingHorizontal: 10,
  paddingVertical: 6,
  maxWidth: 260,          // ✅ IMPORTANT
},

text: {
  color: "#fff",
  fontSize: 15,
  flexShrink: 1,          // ✅ IMPORTANT
},

  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
  },


});
