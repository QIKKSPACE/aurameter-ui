// screens/DummyAuraChatScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
View,
Text,
StyleSheet,
TextInput,
TouchableOpacity,
FlatList,
Image,
ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenBackground from "../components/ScreenBackground";
import { useTheme } from "../constants/context/ThemeContext";
import Icon from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

//checkmark-done
import { useNavigation } from "@react-navigation/native";
import AppText from "../components/AppText";
import { useDispatch, useSelector } from "react-redux";
import { fetchAuraChats, prependMessage, setAiError, setAiThinking, setresponseError } from "../store/AuraChatSlice";
import api from "../services/api";
import { useToast } from "../constants/context/ErrorContext";
import { updateUserField } from "../store/userSlice";

const DUMMY_USER_PIC = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const OTHER_PIC = require("../assets/aura_chat.png");
const TypingIndicator = ({ theme }) => {
  return (
    <View style={[styles.messageRow, { flexDirection: "row" }]}>
      <Image source={OTHER_PIC} style={styles.avatar} />

      <View
        style={[
          styles.bubble,
          {
            backgroundColor: theme.components.box,
            opacity: theme.opacity.light,
            marginLeft: 8,
            borderBottomLeftRadius: 0,
          },
        ]}
      >
        <AppText
          variant="body"
          style={{
            color: theme.text.secondary,
            fontStyle: "italic",
          }}
        >
          Aura is typing…
        </AppText>
      </View>
    </View>
  );
};
const renderTicks = (item) => {
  if (item.sender !== "user") return null;

  return (
    <View style={{ flexDirection: "row", marginTop: 4, alignSelf: "flex-end" }}>
      {item.seen_by_ai ? (
        <Ionicons
          name="checkmark-done"
          size={14}
          color="#4B7BE5" // Aura blue
        />
      ) : (
        <Icon
          name="check"
          size={14}
          color="#999"
        />
      )}
    </View>
  );
};
const DummyAuraChatScreen = () => {
const { theme } = useTheme();
const navigation = useNavigation();
const flatListRef = useRef();
const user = useSelector((state) => state.user);
const chats=useSelector(state => state.auraChat)
const dispatch=useDispatch()
const progress = user?.profileCompletion * 100 || 0;
const [messages, setMessages] = useState([]);
const [input, setInput] = useState("");
 const { showToast }= useToast()

 useEffect(()=>{
  
   setMessages(chats.messages)
},[chats])
let chatData = messages;

if (chats.aiThinking) {
  chatData = [{ id: "__typing__", sender: "aura_typing" }, ...messages];
}

if (chats.aiError || chats.responseError) {
  chatData = [{ id: "__ai_error__", sender: "aura_error" }, ...messages];
}
const  tryRetry=async()=>{
  dispatch(setAiError(false))
dispatch(setresponseError(false))
 try {
  const res = await api.post("/aurachat/retry-aura", {
});
if(res.data.success)
{
  dispatch(setAiThinking(true))
}
   
}catch (err) {
      console.error(err)
        showToast("Something Went Wrong","error")
     
    }
}
const sendMessage = async() => {
if (!input.trim()) return;
dispatch(setAiError(false))
dispatch(setresponseError(false))

const newMsg = {
id: Date.now().toString(),
text: input,
sender:"user",
created_at:Date.now(),
seen_by_ai:false,
};
 dispatch(prependMessage(newMsg));    
setInput("");
 try {
  const res = await api.post("/aurachat/new-chat", {
  message: input
});
if(res.data.success)
{
  dispatch(setAiThinking(true))
}
   
}catch (err) {
      console.error(err)
        showToast("Something Went Wrong","error")
     
    }

};
const handleAcceptCondition=async()=>{
    try {
      
   const res = await api.post("/aurachat/accept-chat", {
  name: user.userData?.name
});
   //  showToast("Something Went Wrong","success")
    dispatch(updateUserField({ field: "has_accepted_chat_agreement", value: true }));
    
    } catch (err) {
      console.error(err)
        showToast("Something Went Wrong","error")
     
    }
}

const loadOlderMessages = () => {
  if (!chats.hasMore || chats.loading) return;
   dispatch(fetchAuraChats())

  // dispatch(fetchOlderMessages({ chat_id, cursor }));
};
const renderBubble = ({ item }) => {
const isMe = item.sender=="user";

return (
<View
style={[
styles.messageRow,
{ flexDirection: isMe ? "row-reverse" : "row" },
]}
>
 {isMe? <Image
    source={{
      uri: user?.userData?.avatar
        ? `${user.userData.avatar}`
        : DUMMY_USER_PIC, // default pic if avatar missing
    }}
    style={styles.avatar}
  />:<Image
source={OTHER_PIC}
style={styles.avatar}
/>}


<View
style={[
styles.bubble,
{  
borderBottomRightRadius: isMe ? 0 : 16,
borderBottomLeftRadius: isMe ? 16 : 0,
marginLeft: isMe ? 0 : 8,
marginRight: isMe ? 8 : 0,
},
 theme.background.style=="image"?{
    backgroundColor: theme.background.color,
                      opacity:theme.opacity.light
 }:{
      backgroundColor: theme.components.box,
              opacity:theme.opacity.light       
 }
]}
>
<AppText
variant="body"
style={[
styles.bubbleText,
{ color: isMe ? theme.text.secondary: theme.text.secondary },
]}
>
{item.text}
</AppText>
{renderTicks(item)}
</View>
</View>
);
};

const AiErrorBubble = ({ theme, onRetry }) => {
  return (
    <TouchableOpacity
      onPress={onRetry}
      activeOpacity={0.8}
      style={[styles.messageRow, { flexDirection: "row" }]}
    >
      <Image source={OTHER_PIC} style={styles.avatar} />

      <View
        style={[
          styles.bubble,
          {
            backgroundColor: theme.components.box,
            opacity: theme.opacity.light,
            marginLeft: 8,
            borderBottomLeftRadius: 0,
       
          },
        ]}
      >
        <AppText
          variant="body"
          style={{ color: theme.text.secondary }}
        >
          Aura is unavailable right now.
        </AppText>

        <AppText
          variant="caption"
          style={{
            color: "#E57373",
            marginTop: 4,
            fontWeight: "600",
          }}
        >
          Tap to retry
        </AppText>
      </View>
    </TouchableOpacity>
  );
};
const PaginationLoader = () => {
  if (!chats.loading) return null;

  return (
    <View style={{ paddingVertical: 16 }}>
      <ActivityIndicator size="small" color={theme.text.primary} />
    </View>
  );
};
// ===========================
// BEAUTIFUL BOTTOM LOCK STATE
// ===========================

const BottomLockedBar = ({ label, buttonLabel, onPress }) => (
<View
style={[
styles.bottomLocked,
{
backgroundColor: theme.surface,
borderTopColor: theme.text.secondary + "22",
},
]}
>
<AppText
variant="body"
style={{
color: theme.text.primary,
fontSize: 15,
marginBottom: 10,
textAlign: "center",
}}
>
{label}
</AppText>

<TouchableOpacity
onPress={onPress}
style={[
styles.bottomBtn,
{ backgroundColor: theme.text.accent },
]}
> 
<AppText variant ="button" style={{ color: theme.background.primary }}>{buttonLabel}</AppText>
</TouchableOpacity>
</View>
);

return (
<ScreenBackground>
<View  style={styles.container}>
{/* Header */}
<View style={styles.header}>
<TouchableOpacity onPress={() => navigation.goBack()}>
<Icon name="arrow-left" size={26} color={theme.text.primary} />
</TouchableOpacity>

<AppText
style={{
color: theme.text.primary,
fontSize: 16,
marginLeft: 10,
}}
variant="h4"
>
Your Emotional Companion
</AppText>
</View> 

{/* Chat Section */}
{progress === 100 && messages.length > 0 ? (
<FlatList
ref={flatListRef}
  data={chatData}
  keyExtractor={(item) => item.id}
renderItem={({ item }) => {
  if (item.id === "__typing__") {
    return <TypingIndicator theme={theme} />;
  }

  if (item.id === "__ai_error__") {
    return (
      <AiErrorBubble
        theme={theme}
        onRetry={tryRetry}
      />
    );
  }

  return renderBubble({ item });
}}
inverted
contentContainerStyle={{ padding: 16, paddingTop: 80 }}
showsVerticalScrollIndicator={false}
 onEndReached={loadOlderMessages}
  onEndReachedThreshold={0.3}

    ListFooterComponent={<PaginationLoader />}
/>
) : (
<View style={styles.lockedCenter}>
<Image
source={OTHER_PIC}
style={{ width: 120, height: 120, opacity: 0.5 }}
resizeMode="contain"
/>


</View>
)}

{/* BEAUTIFUL BOTTOM BAR */}
{progress !== 100 ? (
<BottomLockedBar
label="Please complete your profile to get access to AuraChat"
buttonLabel="Edit Profile"
onPress={() => navigation.navigate("EditProfile")}
/>
) : progress === 100 && !user.userData?.has_accepted_chat_agreement? (
<BottomLockedBar
label="Please accept Terms & Conditions to get started"
buttonLabel="Accept Now"
onPress={() =>
  handleAcceptCondition()
}
/>
) : (
// Actual Input Bar
<View
style={[
styles.inputBar,
{ backgroundColor: theme.background.color },
]}
>
<TextInput
value={input}
onChangeText={setInput}
placeholder="Type a message..."
placeholderTextColor={theme.text.secondary}
style={[
styles.input,
{ backgroundColor: theme.surface, color: theme.text.primary },
]}
/>

<TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
<Icon name="send" size={20} color="white" />
</TouchableOpacity>
</View>
)}
</View>
</ScreenBackground>
);
};

export default DummyAuraChatScreen;

const styles = StyleSheet.create({
container: { flex: 1 },

header: {
flexDirection: "row",
alignItems: "center",
padding: 16,
},

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
maxWidth: "70%",
minWidth:150,
paddingHorizontal: 14,
paddingVertical: 10,
borderRadius: 18,
},

bubbleText: {
fontSize: 15,
lineHeight:20,
},

lockedCenter: {
flex: 1,
justifyContent: "center",
alignItems: "center",
paddingBottom: 120,
},

bottomLocked: {
position: "absolute",
left: 0,
right: 0,
bottom: 0,
paddingHorizontal: 20,
paddingVertical: 14,
borderTopWidth: 1,
alignItems: "center",
justifyContent: "center",
},

bottomBtn: {
paddingVertical: 12,
paddingHorizontal: 30,
borderRadius: 18,
marginTop: 4,
},

inputBar: {
position: "absolute",
left: 0,
right: 0,
bottom: 0,
flexDirection: "row",
padding: 10,
alignItems: "center",
borderTopWidth: 1,
borderTopColor: "rgba(255,255,255,0.1)",
},

input: {
flex: 1,
height: 46,
borderRadius: 22,
paddingHorizontal: 14,
marginRight: 10,
},

sendBtn: {
width: 46,
height: 46,
borderRadius: 23,
alignItems: "center",
justifyContent: "center",
backgroundColor: "#4B7BE5",
},
});
