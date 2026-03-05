import React from "react";
import { View, StyleSheet, TouchableOpacity, Image, Text } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

export default function StoryTopBar({
  user,
  story,
  onClose,
  onDelete,
  isOwnStory,
  timeAgo,
}) {

const taggedUser =
  story?.tagged_users?.length > 0
    ? story.tagged_users[0]
    : null;

  return (
    <View style={styles.topBar}>
      {/* LEFT */}
      <View style={styles.left}>
        <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
          <Icon name="x" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.avatarStack}>
  <Image source={{ uri: user?.avatar }} style={styles.userAvatar} />

  {taggedUser && (
    <Image
      source={{ uri: taggedUser.avatar }}
      style={styles.taggedAvatar}
    />
  )}
</View>

        <View>
       <View>
  {/* ROW 1: main username + time */}
  <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
    <Text style={styles.userName}>{user?.username}</Text>

    {story?.created_at && (
      <Text style={styles.timestamp}>
        {"  "}
        {timeAgo}
      </Text>
    )}
  </View>

  {/* ROW 2: tagged user */}
  {taggedUser && (
    <View style={styles.tagRow}>
      <Text style={styles.andText}>&</Text>
      <Text style={styles.taggedUserName}>{taggedUser.username}</Text>
    </View>
  )}
</View>
          {!!story?.location && (
            <Text style={styles.location}>{story.location}</Text>
          )}
        </View>
      </View>

      {/* RIGHT */}
      <View style={styles.topActions}>
        {isOwnStory ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onDelete}>
            <MaterialIcon name="delete" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.iconBtn}>
            <FontAwesome5 name="ellipsis-v" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 999,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "80%",
  },

  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  userName: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  timestamp: {
    color: "#ccc",
    fontSize: 11,
  },

  location: {
    color: "#fff",
    fontSize: 10,
    maxWidth: 160,
  },

  topActions: {
    flexDirection: "row",
    gap: 12,
  },

  iconBtn: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 6,
    borderRadius: 30,
  },
  avatarStack: {
  width: 42,
  height: 32,
  position: "relative",
},

taggedAvatar: {
  width: 30,
  height: 30,
  borderRadius: 15,
  position: "absolute",
  right: -6,
  bottom:-15,
  borderWidth: 1.5,
  borderColor: "#000",
},
tagRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 2,
  marginLeft:10,
},

andText: {
  color: "#ccc",
  fontSize: 12,
  marginRight: 4,
},

taggedUserName: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "500",
},

});
