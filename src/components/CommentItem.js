import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function CommentItem({ comment }) {
  return (
    <View style={styles.container}>
      {/* Avatar */}
      <Image
        source={{ uri: comment.user.avatar }}
        style={styles.avatar}
      />

      {/* Comment bubble */}
      <View style={styles.bubble}>
        <Text style={styles.username}>{comment.user.username}</Text>
        <Text style={styles.text}>{comment.text}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.time}>2m</Text>

          <TouchableOpacity style={styles.likeBtn}>
            {comment?.likedByMe?
              <Icon
              name="heart"
              size={14}
              color={comment.likedByMe ? "#e0245e" : "#888"}
            />:  <Icon
              name="heart-outline"
              size={14}
              color={comment.likedByMe ? "#e0245e" : "#888"}
            />}
          
            <Text style={styles.likeCount}>
              {comment.likeCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 14,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  bubble: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    borderRadius: 14,
    padding: 10,
  },
  username: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  text: {
    color: "#eee",
    fontSize: 14,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  time: {
    color: "#777",
    fontSize: 11,
    marginRight: 12,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeCount: {
    color: "#888",
    fontSize: 11,
    marginLeft: 4,
  },
});
