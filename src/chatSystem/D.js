import React, { useState, useRef } from "react";
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
  cancelRecording
}) => {
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [recording, setRecording] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const hasStopped = useRef(false);
  const startX = useRef(0);
  const isSwipeDetected = useRef(false);
  const { theme } = useTheme();
  const inputRef = useRef();

  const pickImage = () => {
    launchImageLibrary(
      { mediaType: "photo", quality: 0.8 },
      (response) => {
        if (!response.didCancel && !response.error && response.assets?.length > 0) {
          const imageUri = response.assets[0].uri;
          setSelectedImage(imageUri);
        }
      }
    );
  };

  const handleSendMessage = () => {
    if (inputText.trim() || selectedImage) {
        console.log(selectedImage)
      handleSend({ 
        type: selectedImage ? "image" : "text",
        text: inputText.trim(),
        fileUrl: selectedImage ? selectedImage : null
      });
      setInputText("");
      setSelectedImage(null);
    }
  };

  const handleStartRecording = (evt) => {
    startX.current = evt.nativeEvent.pageX;
    isSwipeDetected.current = false;
    hasStopped.current = false;
    setRecording(true);
    startRecording();
  };

  const handleMoveRecording = (evt) => {
    const movedX = evt.nativeEvent.pageX;
    if (startX.current - movedX > 50) {
      isSwipeDetected.current = true;
      setShowTrash(true);
    } else {
      isSwipeDetected.current = false;
      setShowTrash(false);
    }
  };

  const safeStop = async (isCancel = false) => {
    if (hasStopped.current) return;
    hasStopped.current = true;
    setRecording(false);
    setShowTrash(false);
    if (isCancel) {
      await cancelRecording();
    } else {
      await stopRecording();
    }
  };

  const handleReleaseRecording = () => {
    setTimeout(() => {
      safeStop(isSwipeDetected.current);
    }, 100);
  };

  return (
    <View style={[styles.inputContainer,   {backgroundColor: theme.components.card,}]}>
      {replyTo && (
  <View style={styles.replyContainer}>
    <View style={styles.replyBar} />
    <View style={styles.replyContent}>
      <Text style={styles.replyAuthor}>
        Replying to {replyTo.sender_id === "me" ? "You" : "User"}
      </Text>
      <Text
        style={styles.replyText}
        numberOfLines={1}
      >
        {replyTo.message_type === "text"
          ? replyTo.content
          : replyTo.message_type}
      </Text>
    </View>

    <TouchableOpacity onPress={onCancelReply}>
      <Icon name="close" size={20} color="#999" />
    </TouchableOpacity>
  </View>
)}
      {/* Image Preview */}

      {selectedImage && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeImage}>
            <Icon name="close-circle" size={20} color="red" />
          </TouchableOpacity>
        </View>
      )}

      {recording && (
        <View style={styles.iconButton}>
          <Icon name="trash-can" size={30} color="red" />
        </View>
      )}

      {!recording && (
        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
          <Icon name="image-outline" size={24} color="#E5E5E5" />
        </TouchableOpacity>
      )}
      {!recording ?<TextInput
        style={styles.input}
        value={inputText}
        ref={inputRef}
        onChangeText={setInputText}
        placeholder="Type a message..."
        placeholderTextColor="#A5A5A5"
      />: <View style={styles.swipeContainer}>
          <Icon name="chevron-left" size={20} color="#ff6b6b" />
          <Text style={styles.swipeText}>Swipe to delete</Text>
        </View>}
     

      <View
        style={styles.iconButton}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleStartRecording}
        onResponderMove={handleMoveRecording}
        onResponderRelease={handleReleaseRecording}
      >
        <Icon name={"microphone"} size={recording ? 34 : 24} color={"#00E5FF"} />
      </View>

      <TouchableOpacity onPress={handleSendMessage} style={styles.iconButton}>
        <Icon name="send" size={24} color="#00E5FF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left:10,
    right:10,
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    flexDirection: "row",
    alignItems: "center",
 
    paddingHorizontal: 10,
    height: 50,
  },
  input: {
    flex: 1,
    color: "#E5E5E5",
    fontSize: 16,
    paddingHorizontal: 10,
  },
  iconButton: {
    padding: 8,
  },
  imagePreview: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  removeImage: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "white",
    borderRadius: 10,
  },
  swipeContainer: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 10, 
  opacity: 0.8,
},

swipeText: {
  color: "#ff6b6b",
  fontSize: 14,
  marginLeft: 6,
},
replyContainer: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 10,
  paddingVertical: 6,
  backgroundColor: "#1f1f1f",
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
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

});

export default ChatInput;