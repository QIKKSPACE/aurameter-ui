// screens/InboxScreen.js
import React, { useEffect, useState } from "react";
import {
View,
Text,
StyleSheet,
Image,
TouchableOpacity,
FlatList,
Modal,
Animated,
SectionList,
TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import ScreenBackground from "../components/ScreenBackground";
import ChatRow from "../components/message/ChatRow";
import AuraChat from "../components/message/AuraChat";


import { useTheme } from "../constants/context/ThemeContext";
import AppText from "../components/AppText";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {timeAgo} from '../utils/time'
import { useToast } from "../constants/context/ErrorContext";
import { updateUserField } from "../store/userSlice";
import api from "../services/api";
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

const InboxScreen = () => {
const { theme } = useTheme();
const [selectedMood, setSelectedMood] = useState(null);
const [modalVisible, setModalVisible] = useState(false);
const navigation=useNavigation()
const [searchMode, setSearchMode] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
const chats=useSelector(state => state.auraChat.messages)
const allchats =useSelector(state => state.auraChat)
const user=useSelector(state => state.user.userData)
const userchats=useSelector(state => state.chats)
const filteredChats = userchats.chats.filter(chat =>
(chat?.other_username || "")
.toLowerCase()
.includes(searchQuery.toLowerCase())
);
useEffect(() => {
if (user?.mood) {
const moodObj = moods.find(m => m.label === user.mood);
if (moodObj) setSelectedMood(moodObj);
}
}, [user]);

const Auramessages = [
{
id: "1",
name: "Aura Chat",
streak: 5,
message:
allchats?.aiError?"Aura Ai is Unvailable":
allchats?.aiThinking?"Aura Ai replying..":
chats?.length > 0
? String(chats[0]?.text ?? "")
: allchats?.hasError?"Something Went Wrong":"",
created_at:
chats?.length > 0
? chats[0].created_at
: Date.now(),
image: require("../assets/aura_chat.png"),
},
];
// Animation scale when selecting
const scaleAnim = new Animated.Value(1);
const {showToast}=useToast()
const dispatch=useDispatch()
const handleMoodSelect = async(mood) => {
setSelectedMood(mood);

Animated.sequence([
Animated.timing(scaleAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
]).start();

setTimeout(() => setModalVisible(false), 200);
try {
const res = await api.post("/user/mood/",{mood: mood.label });
if(res.data.success)
{
dispatch(updateUserField({ field: "mood", value: mood.label }));
dispatch(updateUserField({ field: "last_mood_updated", value: Date.now() }));
showToast("Mood Updated SuccessFully!", "success");

}
else
{
showToast("Failed Updating Mood, Please Retry!", "error");

}

} catch (error) {
console.log(error)
showToast("Failed Updating Mood, Please Retry!", "error");

}
};

const renderMoodOption = ({ item }) => {
const isActive = selectedMood?.emoji === item.emoji;

return (
<TouchableOpacity
style={[
styles.moodCard,
{
backgroundColor: isActive ? theme.accent : theme.components.card,
borderColor: isActive ? theme.accent : theme.components.card,
},
]}
onPress={() => handleMoodSelect(item)}
>
<Text style={styles.emoji}>{item.emoji}</Text>
<AppText variant="body" style={[ { color: theme.text.primary,fontSize:10}]}>
{item.label}
</AppText>
</TouchableOpacity>
);  
};  



return (
<ScreenBackground>
<View style={{ flex: 1 }}>

{/* Profile + Mood */}
<View style={styles.header}>
<View style={styles.profileSection}>
{user?.avatar ? (
<Image
source={{ uri:user?.avatar }}
style={styles.profilePic}
/>
) : (
<Image
source={require("../assets/newframe.png")}
style={styles.profilePic}
/>
)}
<View>
<AppText variant="h4"style={[ { color: theme.text.primary,fontSize:18 }]}>{user?.username || user?.name}</AppText>


</View>
</View>

<TouchableOpacity onPress={() => setModalVisible(true)}>
<Animated.View
style={[
styles.moodBubble,
{ backgroundColor: theme.components.card, transform: [{ scale: scaleAnim }] },
]}
>
{selectedMood ? (
<Text style={{ fontSize: 20 }}>{selectedMood.emoji}</Text>
) : (
<Image
source={require("../assets/emoji-mashup.png")} // your emoji mashup PNG
style={{ width: 28, height: 28 }}
resizeMode="contain"
/>
)}
</Animated.View>
<AppText variant="body" style={[ { color: theme.text.primary,fontSize:12,fontWeight:800,marginTop:2 }]}>Mood</AppText>
</TouchableOpacity>
</View>

{/* Inbox Label */}
<View style={styles.inboxRow}>
{searchMode ? (
<View
style={[
styles.searchContainer,
{ backgroundColor: theme.components.card }
]}
>
<Icon
name="search"
size={18}
color={theme.text.secondary}
style={{ marginLeft: 10 }}
/>

<TextInput
placeholder="Search chats..."
placeholderTextColor={theme.text.secondary}
value={searchQuery}
onChangeText={setSearchQuery}
autoFocus
style={[
styles.searchInput,
{ color: theme.text.primary }
]}
/>

<TouchableOpacity
onPress={() => {
setSearchMode(false);
setSearchQuery("");
}}
>
<Icon
name="x"
size={20}
color={theme.text.primary}
style={{ marginHorizontal: 10 }}
/>
</TouchableOpacity>
</View>
) : (
<>
<AppText
variant="h3"
style={[
{
color: theme.text.primary,
fontSize: 24,
fontWeight: "800",
},
]}
>
Inbox
</AppText>

<TouchableOpacity
style={{ marginRight: 10 }}
onPress={() => setSearchMode(true)}
>
<Icon
name="search"
size={22}
color={theme.text.primary}
/>
</TouchableOpacity>
</>
)}
</View>
<SectionList
sections={[
{ title: "Aura", data: Auramessages, type: "aura" },
{ title: "Messages", data: filteredChats, type: "msg" },
]}
keyExtractor={(item) =>
item._sectionType === 'aura'
? `aura-${item.id}`
: `chat-${item.chat_id}`
}
renderItem={({ item, section }) =>
section.type === "aura"
? <AuraChat item={item} navigation={navigation} theme={theme} currentUserId={user?.id} />
: <ChatRow chat={item} navigation={navigation} theme={theme} currentUserId={user?.id} />
}
showsVerticalScrollIndicator={false}
contentContainerStyle={{ paddingBottom: 30 }}
/>

{/* Mood Picker Modal */}
<Modal visible={modalVisible} transparent animationType="fade">
<View style={styles.modalOverlay}>
<View style={[styles.modalBox, { backgroundColor: theme.components.card }]}>
<AppText variant="h3" style={[ { color: theme.text.primary,textAlign:'center',fontSize:22 }]}>Pick Your Mood</AppText>

<FlatList
data={moods}
numColumns={3}
renderItem={renderMoodOption}
keyExtractor={(item) => item.label}
contentContainerStyle={{ paddingBottom: 10 }}
/>

<TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
<AppText variant="button"style={{ color: "#fff" }}>Close</AppText>
</TouchableOpacity>
</View>
</View>
</Modal>

</View>
</ScreenBackground>
);
};

export default InboxScreen;

const styles = StyleSheet.create({
// HEADER
header: {
flexDirection: "row",
justifyContent: "space-between",
marginHorizontal: 18,
marginTop: 10,
alignItems: "center",
},
profileSection: { flexDirection: "row",justifyContent:'center',alignItems:'center' },
profilePic: { width: 46, height: 46, borderRadius: 22, marginRight: 10 },


streakContainer: {
flexDirection: "row",
alignItems: "center",
backgroundColor: "#202A44",
borderRadius: 8,
paddingHorizontal: 6,
paddingVertical: 3,
marginTop: 5,
},
streakNum: { color: "#fff", fontWeight: "700", marginLeft: 5, fontSize: 12 },
streakLabel: { color: "#aaa", fontSize: 10, marginLeft: 4 },

// MOOD BUTTON
moodBubble: {
width: 36,
height: 36,
borderRadius: 20,
justifyContent: "center",
alignItems: "center",

},
moodLabelText: { fontSize: 12, textAlign: "center", fontWeight: "600" },

// INBOX TITLE
inboxRow: {
flexDirection: "row",
justifyContent: "space-between",
marginHorizontal: 20,
marginVertical: 15,
},
inboxTitle: { fontSize: 26, fontWeight: "800" },

// MODAL
modalOverlay: {


flex: 1,
backgroundColor: "rgba(0,0,0,0.3)",
justifyContent: "center",
alignItems: "center",
},
modalBox: {
width: "85%",
borderRadius: 18,
padding: 20,
height:400,

},
modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 20, textAlign: "center" },

// EMOJI OPTIONS
moodCard: {
width: "30%",
alignItems: "center",
paddingVertical: 12,
borderRadius: 12,
margin: 6,
borderWidth: 1.2,
},
emoji: { fontSize: 28 },
moodText: { marginTop: 5, fontSize: 12, fontWeight: "600", textAlign: "center" },

closeButton: {
backgroundColor: "#A45EE5",
paddingVertical: 10,
borderRadius: 10,
marginTop: 15,
alignItems: "center",
},
searchContainer: {
flexDirection: "row",
alignItems: "center",
borderRadius: 14,
height: 46,
flex: 1,
},

searchInput: {
flex: 1,
fontSize: 15,
paddingHorizontal: 10,
},
});
