import React from "react";
import { View, StyleSheet, Image, Pressable, Text } from "react-native";
import AppText from "../AppText";
import AudioMessage from "../AudioMessage";
import FullWidthImage from "../FullWidthImage";

import MessageStatus from "../MessageStatus";

import { timeAgo } from "../../utils/time";

const DUMMY_USER_PIC = require("../../assets/newframe.png");
const OTHER_PIC = require("../../assets/newframe.png");
import NativeWebPImage from "../NativeWebPImage";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
const MessageBubble = ({ item, user, theme,handleRetry,onMessageLongPress,avatar }) => {
   const navigation=useNavigation()
 
const isMe = item.sender_id === user.id;
let avatarSource;
if (isMe) {
  avatarSource = user?.avatar ? { uri: user.avatar } : DUMMY_USER_PIC;
} else {
 avatarSource = avatar ? { uri: avatar } : OTHER_PIC;
}
 
const ReplyPreview = ({ reply, isMe }) => {
  if (!reply) return null;

  const renderPreviewContent = () => {
    switch (reply.message_type) {
      case "text":
      case "text_image":
        return (
          <AppText style={styles.replyText} numberOfLines={1}>
            {reply.content}
          </AppText>
        );

      case "image":
        return (
          <View style={styles.replyMediaRow}>
            <Image
              source={{ uri: reply.file_url }}
              style={styles.replyImage}
            />
            <AppText style={styles.replyText} numberOfLines={1}>
              Photo
            </AppText>
          </View>
        );
      

      case "music":
      case "audio":
        return (
          <>
            {  reply.music?.cover?<View style={styles.replyMediaRow}>
           <Image
              source={
               { uri: reply.music.cover }
              }
              style={styles.replyImage}
            />
            <AppText style={styles.replyText} numberOfLines={1}>
              {reply.music?.title || "Audio message"}
            </AppText>
            
          </View>:""}
          </>
         
        );

      default:
        return (
          <AppText style={styles.replyText} numberOfLines={1}>
            Message
          </AppText>
        );
    }
  };

  return (
    <View style={styles.replyContainer}>
      <View
        style={[
          styles.replyBar,
          { backgroundColor: isMe ? "#4F8EF7" : "#34C759" },
        ]}
      />
      <View style={styles.replyContent}>
        <AppText style={styles.replyName} numberOfLines={1}>
          {reply.sender_id === user.id ? "You" : "Reply"}
        </AppText>

        {renderPreviewContent()}
      </View>
    </View>
  );
};

return (
  <Pressable
  onLongPress={(e) => {
    onMessageLongPress(item, e.nativeEvent);
  }}
  delayLongPress={300}
>
<View
style={[
styles.messageRow,
{ flexDirection: isMe ? "row-reverse" : "row" },
]}
>
{/* Avatar */}
<Image source={avatarSource} style={styles.avatar} />

{/* Bubble */}
<View
style={[
styles.bubble,
{
borderBottomRightRadius: isMe ? 0 : 16,
borderBottomLeftRadius: isMe ? 16 : 0,
marginLeft: isMe ? 0 : 8,
marginRight: isMe ? 8 : 0,
},
theme.background.style === "image"
? { backgroundColor: theme.background.color, opacity: theme.opacity.light }
: { backgroundColor: theme.components.box, opacity: theme.opacity.light },
]}
>
  {item.replying_to && (
  <ReplyPreview reply={item.reply} isMe={isMe} />
)}
{/* TEXT */}
{(item.message_type !== "audio" || item.message_type === "text_image") && (
<AppText style={[styles.text]} variant="body">{item.content}</AppText>
)}

{/* IMAGE */}
{(item.message_type === "image" || item.message_type === "text_image") && (
<FullWidthImage
uri={ item.file_url }

/>
)}
{(item.message_type === "sticker") && (
  <NativeWebPImage
  key={item.local_id} // force new view instance on recycling
          
  source={{ uri: item.file_url }}
  style={styles.stickerImage}
/>
)}
{item.message_type === "quiz" && (
  <View style={styles.replyMediaRow}>
    <Pressable
   
      onLongPress={() => {
        console.log(item)
        // optional: start quiz / open answer screen
          navigation.navigate('PlayQuiz',{quizId:item?.quiz?.id})
        
        console.log("Quiz long pressed", item.quiz);
      }}
    >
      <LinearGradient
        colors={["#ffffff", "#f9c8ef"]}
        style={styles.gradient}
      >
        <Text numberOfLines={1} style={styles.title}>
          {item.quiz?.quizName}
        </Text>

        <View style={styles.divider} />

        <Text numberOfLines={2} style={styles.description}>
          {item.quiz?.description}
        </Text>

        <View style={styles.cta}>
          <Text style={styles.ctaText}>
            Long Press To Answer
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  </View>
)}

{/* AUDIO */}
{(item.message_type === "audio"  || item.message_type === "music" ) && (
<AudioMessage message={item} isMe={isMe}/>
)}

{/* TIME */}
{
item.status=="sent"? <AppText style={styles.time} variant="h4">
{timeAgo(item.created_at)}
</AppText>:

<MessageStatus
status={item.status}
isMe={isMe}
onRetry={() => handleRetry(item)}
/>
}
</View>
</View>
</Pressable>
);
};

export default MessageBubble;
 

const styles = StyleSheet.create({
  messageRow: {
    width: "100%",
    marginBottom: 14,
    alignItems: "flex-end",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  bubble: {
    maxWidth: "72%",
    minWidth:150,
    paddingHorizontal: 14,
    paddingVertical:3,
    borderRadius: 18,
  },
  text: {
    fontSize: 14,
  },
  image: {
    width: 200,
   aspectRatio:3/4,
    borderRadius: 12,
 
  },
    stickerImage: {
   width: 200,
   height:200,
    borderRadius: 12,  
  },
  time: {
    fontSize: 10,
    alignSelf: "flex-end",
    opacity: 0.6,
    marginTop:2,
  },
 replyContainer: {
  flexDirection: "row",
  marginBottom: 6,
  borderRadius: 10,
  overflow: "hidden",

},

replyBar: {
  width: 4,
  borderRadius: 2,
},

replyContent: {
  flex: 1,
  paddingLeft: 8,
  paddingVertical: 4,
},

replyName: {
  fontSize: 11,
  fontWeight: "600",
  opacity: 0.8,
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
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
replyText: {
  fontSize: 12,
  opacity: 0.7,
},
replyMediaRow: {
  flexDirection: "row",
  alignItems: "center",
},

replyImage: {
  width: 34,
  height: 34,
  borderRadius: 6,
  marginRight: 8,
},

});
