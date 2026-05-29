import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList, Image, Platform, PermissionsAndroid, ActivityIndicator } from "react-native";
import ScreenBackground from "../components/ScreenBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "../components/AppText";
import Icon from "react-native-vector-icons/Feather";

import { useDispatch, useSelector } from "react-redux";
import ChatInput from "../components/ChatInput";
import AudioMessage from "../components/AudioMessage";
import CircleWaveForm from "../components/CircleWaveForm";
import MessageBubble from "../components/MessageBubble";
import MusicPickerModal from "../components/SearchMusic";

import PermissionModal from "../components/PermissionModal";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useTheme } from "../constants/context/ThemeContext";
import {createMessageObject} from '../utils/createMessageObject'
import {makeSelectMessagesByChatId} from '../store/chatSelectors'
import { addMessage, fetchMessages, updateChatRead, updateMessageStatus } from "../store/chatSlice";

import { addToMessageQueue, markMessageFailed, markMessagePending, markMessageSent, MESSAGE_STATUS } from '../utils/messageQueue';
import api from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { decrementUnreadChats } from "../store/unreadSlice";
const ChatScreen = ({  route }) => {
  const { theme } = useTheme();
  const navigation=useNavigation()
  const { startRecording, stopRecording, cancelRecording, isRecording } = useAudioRecorder();
  const flatListRef = useRef();
  const user = useSelector((state) => state.user);
  const { chat_id, other_user_id, other_avatar, other_username } = route?.params;
  const [recording,setRecording]=useState(false)
  const dispatch=useDispatch()
  const allChat=useSelector(state=>state.chats)
const selectMessages = useMemo(  
  () => makeSelectMessagesByChatId(chat_id),
  [chat_id]
);

const messages = useSelector(selectMessages);
useEffect(() => {
  if (!chat_id) return;

  // Check if the chat still exists in the array
  const chatExists = allChat?.chats?.some(c => c.chat_id === chat_id);

  if (!chatExists) {
    const timeout = setTimeout(() => {
      navigation.goBack();
    }, 0);

    return () => clearTimeout(timeout);
  }
}, [allChat.chats, chat_id, navigation]);

useEffect(() => {
  if (!chat_id || messages.length === 0) return;

  const chat = allChat.chats.find(c => c.chat_id === chat_id);
  if (!chat) return;

  const lastReadAt = chat.last_read_at ? new Date(chat.last_read_at) : null;

  // Get latest message sent by the other user
  const latestIncoming = messages
    .filter(m => m.sender_id !== user?.userData.id && m.status === 'sent')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];

  if (!latestIncoming) {
    setUnreadCount(0);
    return;
  }

  const latestCreatedAt = new Date(latestIncoming.created_at);

  if (isAtBottom) {
    // Only mark read if needed
    if (!lastReadAt || latestCreatedAt > lastReadAt) {
      markChatAsRead(chat_id);
    }

    // Scroll to bottom
       flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

  } else {
    // Show unread pill count
    setUnreadCount(
      messages.filter(m => 
        m.sender_id !== user?.userData.id && 
        m.status === 'sent' && 
        (!lastReadAt || new Date(m.created_at) > lastReadAt)
      ).length
    );
  }
}, [messages, isAtBottom, chat_id, allChat, user]);
const markChatAsRead = async (chatId) => {
  try {
    // 1️⃣ Optimistic UI update
    dispatch(updateChatRead({
      chatId,
      lastReadAt: new Date().toISOString()
    }));
    dispatch(decrementUnreadChats())
    // 2️⃣ Sync with server
    await api.post(`/me/chats/${chatId}/mark-read`);

    // ✅ Optionally, dispatch success if needed
  } catch (err) {
    console.error('Failed to mark chat read:', err);
    // Optionally rollback optimistic update
  }
};
useEffect(()=>{

    if(chat_id && messages.length==0)
    {
        
      dispatch(fetchMessages(chat_id))
    }

},[chat_id])
const [isAtBottom, setIsAtBottom] = useState(true);
const [unreadCount, setUnreadCount] = useState(0);

const handleScroll = (event) => {
  const offsetY = event.nativeEvent.contentOffset.y;
  const contentHeight = event.nativeEvent.contentSize.height;
  const layoutHeight = event.nativeEvent.layoutMeasurement.height;

  // Consider user at bottom if they are within 60px of bottom (height of input)

  setIsAtBottom(atBottom);
 const atBottom = offsetY <= 60; // 60px tolerance from bottom
  setIsAtBottom(atBottom);

  if (atBottom){setUnreadCount(0);}  // reset unread if they scroll to bottom
};
  const [modalVisible, setModalVisible] = useState(false);
  const [showMusicModal,setShowMusicModal]=useState(false)
  const avatarSource = other_avatar
    ? { uri: `http://localhost:5001${other_avatar}` }
    : require("../assets/newframe.png");

  // Check Android microphone permission
  const requestAudioPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Microphone Permission",
          message: "We need access to your microphone to record audio messages.",
          buttonPositive: "OK",
          buttonNegative: "Cancel",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS handled elsewhere
  };

  const handleStartRecording = async () => {
    try {
         const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      setModalVisible(true);
      return;
    }

    setRecording(true)
    await startRecording();
    } catch (error) {
         setRecording(false)
    }
   
  };
  const handleRetry=async(message)=>{
   //TO DO
  //add to  json queue
  //dispatch setMessage
  //send Api for music, text
  //
   try {
  if (message.message_type === "music" || message.message_type === "text") {
   
  await markMessagePending(message.local_id);
     const payload = {
            chatId: message.chat_id,
            localId: message.local_id,
            status: 'pending',
            serverId: Date.now().toString(),
            fileUrl: null
          };
             dispatch(updateMessageStatus(payload));

    // simulate sending after 5 seconds
    const newmessage={...message,receiver_id:other_user_id}
    
   const res=await api.post("/message/send-tiny",{message:newmessage,retry:true})
    if(res?.data?.success){
   await markMessageSent(res?.data?.message.local_id);
          const payload = {
            chatId:res?.data?.message.chat_id,
            localId: res?.data?.message.local_id,
            status: 'sent',
            serverId:res?.data?.message.id,
            fileUrl: null
          };
          dispatch(updateMessageStatus(payload));
    }
    else
    {
       await markMessageFailed(message.local_id);
          const payload = {
            chatId: message.chat_id,
            localId: message.local_id,
            status: 'failed',
            serverId:null,
            fileUrl: null
          };
          dispatch(updateMessageStatus(payload));
        } 
    }
  
} catch (err) {
  console.error('Error sending message:', err);
     await markMessageFailed(message.local_id);
          const payload = {
            chatId: message.chat_id,
            localId: message.local_id,
            status: 'failed',
            serverId:null,
            fileUrl: null
          };
          dispatch(updateMessageStatus(payload));
}
  }


   const handleSendMesasge=async(message)=>{
  try {
  if (message.message_type === "music" || message.message_type === "text") {
   
await addToMessageQueue(message);
    dispatch(addMessage({ chatId: chat_id, message }));
    // simulate sending after 5 seconds
    const newmessage={...message,receiver_id:other_user_id}
   const res=await api.post("/message/send-tiny",{message:newmessage})

    if(res?.data?.success){
   await markMessageSent(res?.data?.message.local_id);
          const payload = {
            chatId:res?.data?.message.chat_id,
            localId: res?.data?.message.local_id,
            status: 'sent',
            serverId:res?.data?.message.id,
            fileUrl: null
          };
          dispatch(updateMessageStatus(payload));
    }
    else
    {
       await markMessageFailed(message.local_id);
          const payload = {
            chatId: message.chat_id,
            localId: message.local_id,
            status: 'failed',
            serverId:null,
            fileUrl: null
          };
          dispatch(updateMessageStatus(payload));
        } 
    }
  
} catch (err) {
  console.error('Error sending message:', err);
     await markMessageFailed(message.local_id);
          const payload = {
            chatId: message.chat_id,
            localId: message.local_id,
            status: 'failed',
            serverId:null,
            fileUrl: null
          };
          dispatch(updateMessageStatus(payload));
}

  }
const handleSendMusic = (song) => {
  
  const message= createMessageObject({type:"music",chatId:chat_id,senderId:user?.userData.id,payload:song})
handleSendMesasge(message)

};
const handleStopRecording = async () => {
  try {
    setRecording(false);

    const audioData = await stopRecording();
    if (!audioData) return;

    const message= createMessageObject({type:"audio",chatId:chat_id,senderId:user?.userData.id,payload:{fileUrl:audioData.audioUrl,
      duration: audioData.duration,
      waveform: audioData.waveform,

    }})
handleSendMesasge(message)
  
  } catch (error) {
    console.log("Audio stop error:", error);
    setRecording(false);
  }
};

  const handleCancelRecording = async () => {
    setRecording(false)
    await cancelRecording();
  };

 const renderItem = ({ item }) => (
  <MessageBubble item={item} user={user.userData} theme={theme} handleRetry={(message)=>{handleRetry(message)}}/>
);
  if(!chat_id) 
  {
    return(
       <ScreenBackground>
      <View edges={["top"]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={26} color={theme.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}
            onPress={() => navigation.navigate("OtherProfile", { userId: other_user_id })}
          >
            <Image source={avatarSource} style={styles.avatar} />
            <AppText
              style={{ color: theme.text.primary, fontSize: 16, marginLeft: 10 }}
              variant="h4"
            >
              {other_username}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: "auto",marginRight:20 }} onPress={()=>{
           
          }}>
    <Icon name="music" size={26} color={theme.text.primary} />
  </TouchableOpacity>
        </View>

        <ActivityIndicator size={"large"} color={theme.text.primary} />
        </View>
        </ScreenBackground>
    )
  }
  return (
    <ScreenBackground>
      <View edges={["top"]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={26} color={theme.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}
            onPress={() => navigation.navigate("OtherProfile", { userId: other_user_id })}
          >
            <Image source={avatarSource} style={styles.avatar} />
            <AppText
              style={{ color: theme.text.primary, fontSize: 16, marginLeft: 10 }}
              variant="h4"
            >
              {other_username}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: "auto",marginRight:20 }} onPress={()=>{
            setShowMusicModal(true)
          }}>
    <Icon name="music" size={26} color={theme.text.primary} />
  </TouchableOpacity>
        </View>
        <View style={{position:'absolute',bottom:10}}>
 {
          recording?<CircleWaveForm isPlaying={true} />:""
          }  
        </View>
         {allChat?.loadingMessages?.[chat_id]?
        <ActivityIndicator size={"large"} color={theme.text.primary} />
          :<FlatList
  ref={flatListRef}
  data={messages}
  keyExtractor={(item) => item.local_id}
  renderItem={renderItem}
  inverted
  contentContainerStyle={{ padding: 16, paddingTop: 80 }}
  showsVerticalScrollIndicator={false}
  onScroll={handleScroll}
  scrollEventThrottle={16}
/>}
    {!isAtBottom && unreadCount >0 && (
  <TouchableOpacity
    style={{
      position: "absolute",
      bottom: 80, // above input box
      alignSelf: "center",
      backgroundColor: theme.components.card,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      zIndex: 10,
    }}
    onPress={() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      setUnreadCount(0);
    }}
  >
    <AppText style={{ color: theme.text.primary, fontWeight: "bold" }}>
     New Message{unreadCount > 1 ? "s" : ""}
    </AppText>
  </TouchableOpacity>
)}
    

      <ChatInput
  handleSend={({ type, text, fileUrl }) => {
    const message= createMessageObject({type:type,chatId:chat_id,senderId:user?.userData.id,payload:{fileUrl,
      content: text,

    }})
handleSendMesasge(message)   

  }}
  startRecording={handleStartRecording}
  stopRecording={handleStopRecording}
  cancelRecording={handleCancelRecording}
/>

        <PermissionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Microphone Permission Denied"
          message="You need to enable microphone access to record audio."
          showSettings={true}
        />
        <MusicPickerModal
  visible={showMusicModal}
  onClose={() => setShowMusicModal(false)}
  handleSend={(song)=>{
 
handleSendMusic(song)
  }}
/>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginLeft: 15 },
});

export default ChatScreen;
