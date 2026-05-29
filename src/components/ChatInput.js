import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary } from "react-native-image-picker";
import { useTheme } from "../constants/context/ThemeContext";

const ChatInput = ({
  handleSend,
  replyTo,
  onCancelReply,
  startRecording,
  stopRecording,
  cancelRecording,
  user,
  onOpenSheet,
  imageUri
}) => {
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState( null);
  const [recording, setRecording] = useState(false);
useEffect(() => {
  if (imageUri) {
    setSelectedImage(imageUri);
  }
}, [imageUri]);
  const hasStopped = useRef(false);
  const startX = useRef(0);
  const isSwipeDetected = useRef(false);
  const inputRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);

  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.8 }, (res) => {
      if (!res.didCancel && res.assets?.length) {
        setSelectedImage(res.assets[0].uri);
      }
    });
  };

  const handleSendMessage = () => {
    if (!inputText.trim() && !selectedImage) return;

    handleSend({
      type: selectedImage ? "image" : "text",
      text: inputText.trim(),
      fileUrl: selectedImage,
    });

    setInputText("");
    setSelectedImage(null);
  };

  /* 🎙 Recording logic */
  const handleStartRecording = (e) => {
    startX.current = e.nativeEvent.pageX;
    hasStopped.current = false;
    isSwipeDetected.current = false;
    setRecording(true);
    startRecording();
  };

  const handleMoveRecording = (e) => {
    if (startX.current - e.nativeEvent.pageX > 50) {
      isSwipeDetected.current = true;
    }
  };

  const stopSafe = async (cancel = false) => {
    if (hasStopped.current) return;
    hasStopped.current = true;
    setRecording(false);
    cancel ? cancelRecording() : stopRecording();
  };

  const handleReleaseRecording = () => {
    setTimeout(() => stopSafe(isSwipeDetected.current), 100);
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.components.card }]}>
      
      {/* 🔁 Reply Preview */}
      {replyTo && (
        <View style={styles.replyContainer}>
          <View style={styles.replyBar} />
          <View style={styles.replyContent}>
            <Text style={styles.replyAuthor}>
              Replying to {replyTo.sender_id !== user?.id?"Their message":"self message"}
            </Text>
            <Text numberOfLines={1} style={styles.replyText}>
              {replyTo.message_type === "text"
                ? replyTo.content
                : replyTo.message_type}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply}>
            <Icon name="close" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>
      )}

      {/* 🖼 Image Preview */}
      {selectedImage && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.removeImage}
            onPress={() => setSelectedImage(null)}
          >
            <Icon name="close-circle" size={18} color="red" />
          </TouchableOpacity>
        </View>
      )}

      {/* ⌨ Input Row */}
      <View style={styles.inputRow}>
        {!recording && (
          <TouchableOpacity onPress={onOpenSheet} style={styles.iconButton}>
            <Icon name="image-outline" size={24} color="#E5E5E5" />
          </TouchableOpacity>
        )}

        {!recording ? (
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#A5A5A5"
          />
        ) : (
          <View style={styles.swipeContainer}>
            <Icon name="chevron-left" size={20} color="#ff6b6b" />
            <Text style={styles.swipeText}>Swipe to delete</Text>
          </View>
        )}

        <View
          style={styles.iconButton}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleStartRecording}
          onResponderMove={handleMoveRecording}
          onResponderRelease={handleReleaseRecording}
        >
          <Icon
            name="microphone"
            size={recording ? 34 : 24}
            color="#00E5FF"
          />
        </View>

        <TouchableOpacity onPress={handleSendMessage} style={styles.iconButton}>
          <Icon name="send" size={24} color="#00E5FF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatInput;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 10,
    right: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },

  inputRow: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#E5E5E5",
    paddingHorizontal: 10,
  },

  iconButton: {
    padding: 8,
  },

  /* Reply */
  replyContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1f1f1f",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },

  replyBar: {
    width: 3,
    height: "100%",
    backgroundColor: "#00E5FF",
    borderRadius: 2,
    marginRight: 8,
  },

  replyContent: {
    flex: 1,
  },

  replyAuthor: {
    fontSize: 12,
    color: "#00E5FF",
    fontWeight: "600",
  },

  replyText: {
    fontSize: 13,
    color: "#ccc",
  },

  /* Image Preview */
  imagePreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    width:60,
  },

  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },

  removeImage: {
    position: "absolute",
    top:0,
    right: -4,
    backgroundColor: "#fff",
    borderRadius: 10,
  },

  /* Recording */
  swipeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.8,
  },

  swipeText: {
    color: "#ff6b6b",
    marginLeft: 6,
    fontSize: 14,
  },
});
