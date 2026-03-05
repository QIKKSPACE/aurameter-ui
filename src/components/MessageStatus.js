import React from "react";
import { View, ActivityIndicator, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const MessageStatus = React.memo(({ status, onRetry, isMe }) => {
  if (!isMe) return null;

  if (status === "pending") {
    return (
      <View style={{ marginLeft: 6,alignSelf: "flex-end", }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (status === "failed") {
    return (
      <TouchableOpacity onPress={onRetry} style={{ marginLeft: 6,alignSelf: "flex-end", }}>
        <Icon name="alert-circle-outline" size={16} color="#ff5252" />
      </TouchableOpacity>
    );
  }

  return null;
});

export default MessageStatus;
