import React, { useMemo } from "react";
import { TouchableOpacity, View, Image, Text, StyleSheet } from "react-native";
import AppText from "../AppText";
import { timeAgo } from "../../utils/time";
import { useSelector } from "react-redux";
  import {makeSelectMessagesWithMeta} from '../../store/messageSelector'
export const getLastMessagePreview = ({
item,              // Chat row from API
localLastMessage,  // chatMessages[0]
currentUserId,
}) => {
// 🟢 No messages yet
if (!item.last_message_type) {
return "Connection started · Start chatting";
}

const isMe = item.last_message_by === currentUserId;
const type = item.last_message_type;

// --------------------------------------------------
// 👤 MESSAGE FROM OTHER USER (SERVER ONLY)
// --------------------------------------------------
if (!isMe) {
switch (type) {
case "text":
return item.last_message_content || "Sent a message";
case "audio":
return "Sent an audio 🎤";
case "video":
return "Sent a video 🎬";
case "image":
return "Sent a photo 📷";
case "music":
return "Sent music 🎵";
case "file":
return "Sent a file 📎";
case "sticker":
return "Sent a file sticker";
case "quiz":
return "Sent a Quiz";
default:
return "Sent a message";
}
}

// --------------------------------------------------
// 🙋 MY MESSAGE (CHECK LOCAL STATE)
// --------------------------------------------------
if (localLastMessage) {
if (localLastMessage.status === "failed") {
return "❌ Failed to send · Tap to retry";
}

if (localLastMessage.status === "pending") {
switch (type) {
case "text":
return "Sending message…";
case "audio":
return "Sending audio…";
case "video":
return "Sending video…";
case "image":
return "Sending photo…";
case "music":
return "Sending music…";
case "sticker":
return "Sending sticker";
case "quiz":
return "Sent a Quiz";
case "file":
return "Sending file…";
default:
return "Sending…";
}
}
}

// --------------------------------------------------
// ✅ SERVER-CONFIRMED (MY MESSAGE)
// --------------------------------------------------
switch (type) {
case "text":
return item.last_message_content || "You sent a message";
case "audio":
return "You sent an audio 🎤";
case "video":
return "You sent a video 🎬";
case "image":
return "You sent a photo 📷";
case "music":
return "You sent music 🎵";
case "file":
return "You sent a file 📎";
case "sticker":
return "You sent a sticker";
case "quiz":
return "You sent a Quiz";
default:
return "You sent a message";
}
};
const moods = [
{ emoji: "😶‍🌫️", label: "No Thoughts" },
{ emoji: "📵", label: "Don't Text" },
{ emoji: "💀", label: "Dead Inside" },
{ emoji: "🔥", label: "On It" },
{ emoji: "🧊", label: "Cold Mode" },
{ emoji: "🎧", label: "Musicfy" },
{ emoji: "👀", label: "Watching" },
{ emoji: "✈︎", label: "Flying" },
{ emoji: "😈", label: "Chaos Mode" },
{ emoji: "🥱", label: "Low Battery" },
{ emoji: "🧠", label: "Thinking Era" },
{ emoji: "📵", label: "Offline" },
{ emoji: "🤠", label: "Just Vibing" },
{ emoji: "🫶", label: "Soft Mode" },
{ emoji: "🏋️", label: "Grinding" },
{ emoji: "🚀", label: "Main Character" },
];

const getMoodEmoji = (label) => moods.find(m => m.label === label)?.emoji || "";

const ChatRow = ({ chat, navigation, theme, currentUserId }) => {
  // ✅ Memoized selector per row
  const selectMessagesWithMeta = useMemo(makeSelectMessagesWithMeta, []);
  const { lastSeq,messages } = useSelector((state) =>
    selectMessagesWithMeta(state, chat.chat_id)
  );

  // Determine unread
  const hasUnread =
    Math.max(lastSeq ?? 0, chat.last_message_seq ?? 0) >
    (chat.last_seen_seq ?? 0);

 const lastMessage = getLastMessagePreview({
item:chat,
localLastMessage:messages[0],
currentUserId: currentUserId,
});

  const timestamp = timeAgo(new Date(chat.last_message_at ?? chat.activated_at));
const moodEmoji = chat.other_mood
? getMoodEmoji(chat.other_mood)
: null;
  const avatarSource = chat.other_avatar
    ? { uri: chat.other_avatar }
    : require("../../assets/newframe.png");

  return (
   <TouchableOpacity
style={[
styles.messageCard,
{
backgroundColor: hasUnread
? theme.components.box
: theme.components.card,
opacity: theme.opacity.light,
},
]}
  onPress={()=>{
        navigation.navigate("ChatScreen",{chat_id:chat?.chat_id,
          other_user_id:chat?.other_user_id,other_avatar:chat?.other_avatar,other_username:chat?.other_username})
      }}
>
<Image source={avatarSource} style={styles.avatar} />

<View style={{ flex: 1 }}>
<View style={styles.messageHeader}>
<View style={{ maxWidth: 200 }}>
<AppText
variant="h4"
style={{ color: theme.text.primary, fontSize: 14 }}
numberOfLines={1}
>
{chat.other_name || chat.other_username}
</AppText>
</View>

<AppText
style={{
fontSize: 12,
color: theme.text.secondary,
marginLeft: 10,
}}
>
{timestamp}
</AppText>
</View>

<AppText
variant="body"
numberOfLines={1}
style={[
{ color: theme.text.secondary, fontSize: 14 },
hasUnread && { fontWeight: "800" },
]}
>
{lastMessage}
</AppText>
</View>

{moodEmoji && (
<View style={styles.streakRow}>
<Text style={{ fontSize: 18 }}>{moodEmoji}</Text>
</View>
)}
</TouchableOpacity>
  );
};

const styles = StyleSheet.create({

// MESSAGE ITEM
messageCard: {
flexDirection: "row",
borderRadius: 14,
padding: 12,
marginHorizontal: 15,
marginBottom: 10,
alignItems:'center',
justifyContent:'center'
},
avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
messageHeader: {
flexDirection: "row",
alignItems: "center",
},
name: { fontSize: 16, fontWeight: "700" },
streakRow: { flexDirection: "row", alignItems: "center",justifyContent:'center',},
streakValue: { color: "#fff", marginLeft: 4, fontWeight: "bold" },
messagePreview: { fontSize: 13, marginTop: 4 },
});

export default ChatRow;
