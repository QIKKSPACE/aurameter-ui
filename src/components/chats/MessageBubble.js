import React from "react";
import { View, StyleSheet, Image, Pressable, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import AppText from "../AppText";
import AudioMessage from "../AudioMessage";
import FullWidthImage from "../FullWidthImage";
import MessageStatus from "../MessageStatus";
import NativeWebPImage from "../NativeWebPImage";
import { timeAgo } from "../../utils/time";

const DUMMY_USER_PIC = require("../../assets/newframe.png");
const OTHER_PIC = require("../../assets/newframe.png");
const MAX_MEDIA_WIDTH = 238;

const MessageBubble = ({
  item,
  user,
  theme,
  handleRetry,
  onMessageLongPress,
  onImagePress,
  avatar,
}) => {
  const navigation = useNavigation();
  const isMe = item.sender_id === user.id;

  const avatarSource = isMe
    ? user?.avatar
      ? { uri: user.avatar }
      : DUMMY_USER_PIC
    : avatar
      ? { uri: avatar }
      : OTHER_PIC;

  const bubbleBackground = isMe
    ? theme?.background?.gradient || ["#7C3AED", "#4F46E5"]
    : ["rgba(17,24,39,0.92)", "rgba(30,41,59,0.88)"];

  const bubbleTextColor = isMe ? "#FFFFFF" : theme?.text?.primary || "#FFFFFF";
  const bubbleSubtleText = isMe
    ? "rgba(255,255,255,0.76)"
    : theme?.text?.secondary || "rgba(255,255,255,0.72)";

  const renderReplyPreview = (reply) => {
    if (!reply) return null;

    let preview = "Message";
    if (reply.message_type === "text" || reply.message_type === "text_image") {
      preview = reply.content;
    } else if (reply.message_type === "image") {
      preview = "Photo";
    } else if (reply.message_type === "audio") {
      preview = "Voice note";
    } else if (reply.message_type === "music") {
      preview = reply.music?.title || "Music";
    } else if (reply.message_type === "sticker") {
      preview = "Sticker";
    }

    return (
      <View style={styles.replyContainer}>
        <View
          style={[
            styles.replyBar,
            { backgroundColor: isMe ? "rgba(255,255,255,0.9)" : "#A855F7" },
          ]}
        />
        <View style={styles.replyContent}>
          <AppText
            style={[styles.replyName, { color: bubbleTextColor }]}
            numberOfLines={1}
          >
            {reply.sender_id === user.id ? "You" : "Reply"}
          </AppText>
          <AppText
            style={[styles.replyText, { color: bubbleSubtleText }]}
            numberOfLines={1}
          >
            {preview}
          </AppText>
        </View>
      </View>
    );
  };

  return (
    <Pressable
      onLongPress={(e) => onMessageLongPress(item, e.nativeEvent)}
      delayLongPress={300}
      style={styles.pressable}
    >
      <View
        style={[
          styles.messageRow,
          { flexDirection: isMe ? "row-reverse" : "row" },
        ]}
      >
        <Image source={avatarSource} style={styles.avatar} />

        <View
          style={[
            styles.bubbleWrap,
            isMe ? styles.bubbleWrapMe : styles.bubbleWrapOther,
          ]}
        >
          <LinearGradient
            colors={bubbleBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.bubble,
              isMe ? styles.bubbleMe : styles.bubbleOther,
              !isMe && {
                borderColor:
                  theme?.components?.stroke || "rgba(255,255,255,0.08)",
              },
            ]}
          >
            {item.replying_to ? renderReplyPreview(item.reply) : null}

            {(item.message_type === "text" || item.message_type === "text_image") &&
            item.content ? (
              <AppText
                style={[styles.text, { color: bubbleTextColor }]}
                variant="body"
              >
                {item.content}
              </AppText>
            ) : null}

            {(item.message_type === "image" || item.message_type === "text_image") && (
              <Pressable
                style={styles.mediaFrame}
                onPress={() => onImagePress?.(item.file_url)}
              >
                <FullWidthImage uri={item.file_url} maxWidth={MAX_MEDIA_WIDTH} />
                {item?.content?  <AppText
                style={[styles.textImage, { color: bubbleTextColor }]}
                variant="body"
              >
                {item.content}
              </AppText>:<></>}
              </Pressable>
            )}

            {item.message_type === "sticker" && (
              <View style={styles.mediaFrame}>
                <NativeWebPImage
                  key={item.local_id}
                  source={{ uri: item.file_url }}
                  style={styles.stickerImage}
                />
              </View>
            )}

            {item.message_type === "quiz" && (
              <View style={styles.quizRow}>
                <Pressable
                  onLongPress={() =>
                    navigation.navigate("PlayQuiz", { quizId: item?.quiz?.id })
                  }
                >
                  <LinearGradient
                    colors={["#FFFFFF", "#F5D0FE"]}
                    style={styles.quizCard}
                  >
                    <Text numberOfLines={1} style={styles.title}>
                      {item.quiz?.quizName}
                    </Text>
                    <View style={styles.divider} />
                    <Text numberOfLines={2} style={styles.description}>
                      {item.quiz?.description}
                    </Text>
                    <View style={styles.cta}>
                      <Text style={styles.ctaText}>Long press to answer</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              </View>
            )}

            {(item.message_type === "audio" || item.message_type === "music") && (
              <AudioMessage message={item} isMe={isMe} />
            )}

            {item.status === "sent" ? (
              <AppText style={[styles.time, { color: bubbleSubtleText }]} variant="h4">
                {timeAgo(item.created_at)}
              </AppText>
            ) : (
              <MessageStatus
                status={item.status}
                isMe={isMe}
                onRetry={() => handleRetry(item)}
              />
            )}
          </LinearGradient>
        </View>
      </View>
    </Pressable>
  );
};

export default MessageBubble;

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
  },
  messageRow: {
    width: "100%",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 2,
  },
  bubbleWrap: {
    maxWidth: "78%",
  },
  bubbleWrapMe: {
    marginRight: 8,
  },
  bubbleWrapOther: {
    marginLeft: 8,
  },
  bubble: {
    minWidth: 110,
    paddingHorizontal:8,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  bubbleMe: {
    borderBottomRightRadius: 10,
    borderColor: "rgba(255,255,255,0.12)",
  },
  bubbleOther: {
    borderBottomLeftRadius: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft:10,marginTop:10
  },

  textImage: {
    fontSize: 14,
    lineHeight: 20,
    marginTop:5,
    marginLeft:8
  },
  mediaFrame: {

    borderRadius:0,
    overflow: "hidden",
    alignSelf: "flex-start",
    maxWidth: MAX_MEDIA_WIDTH,
  },
  stickerImage: {
    width: 180,
    height: 180,
    borderRadius: 18,
  },
  time: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 8,
  },
  replyContainer: {
    flexDirection: "row",
    marginBottom: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  replyBar: {
    width: 3,
    borderRadius: 999,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
    minWidth: 0,
  },
  replyName: {
    fontSize: 11,
  },
  replyText: {
    fontSize: 12,
    marginTop: 1,
  },
  quizRow: {
    marginTop: 4,
  },
  quizCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
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
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 12,
  },
  cta: {
    alignSelf: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 999,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
