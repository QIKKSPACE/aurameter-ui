  import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
  import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
  import { useDispatch, useSelector } from 'react-redux';
  import { useTheme } from '../constants/context/ThemeContext';
  import ScreenBackground from '../components/ScreenBackground';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import AppText from '../components/AppText';
  import Icon from "react-native-vector-icons/Feather";
  import { useFocusEffect, useNavigation } from '@react-navigation/native';
  import MessageBubble from "../components/chats/MessageBubble";
  import {createMessageObject} from '../utils/createMessageObject'
  import ChatInput from "../components/ChatInput";
  import MessageActionOverlay from "../components/MessageActionOverlay";

  import MusicPickerModal from "../components/SearchMusic";
  import { addOptimisticMessage, removeMessage, retryMessage, updateMessageStatus } from '../store/messageSlice';
  import { addToMessageQueue, markMessageFailed, markMessageSent, removeFromMessageQueue, retryMessageInQueue } from '../utils/messageQueue';
  import api from '../services/api';
  import { clearActiveChat, setActiveChat, updateChatLastMessage, updateChatLastReadAt } from '../store/chatSlice';
  import {makeSelectMessagesWithMeta} from '../store/messageSelector'
  import { fetchMessages } from '../store/messageThunks';
  import { decrementUnreadChats } from '../store/unreadSlice';
  const ChatScreen = ({ route }) => {
  const { theme } = useTheme();
  const { chat_id, other_user_id, other_avatar, other_username } = route?.params;
  const listRef = useRef(null);
  // Get messages for this chat
  const flatListRef = useRef();
  const user = useSelector((state) => state.user);
  const [modalVisible, setModalVisible] = useState(false);
  const [showMusicModal,setShowMusicModal]=useState(false)
  const navigation=useNavigation()
  const dispatch=useDispatch()
  const [replyTo, setReplyTo] = useState(null);
  const selectMessagesWithMeta = useMemo(makeSelectMessagesWithMeta, []);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { messages, hasMore,cursor, isLoading, hasError, syncLoading, syncError,lastSeq } = 
  useSelector(state => selectMessagesWithMeta(state, chat_id));
  const lastSeenMessageIdRef = useRef(null);

  const userData = useSelector((state) => state.user?.userData);


  const chatMeta = useSelector(state =>
  state.chats.chats.find(c => c.chat_id === chat_id)
  );
  useEffect(() => {
  if (!chatMeta) return;

  if (
  chatMeta.last_message_at &&
  messages.length === 0 &&
  !isLoading &&
  !hasError
  ) {
  console.log("[CHAT] Initial fetch → FETCH FIRST PAGE (+ preload)");
  dispatch(fetchMessages({ chatId:chat_id}));
  }
  }, [
  chat_id,
  chatMeta?.last_message_at,
  messages.length,
  isLoading,
  hasError
  ]);

  useEffect(() => {
  if (!chatMeta || !messages.length) return;

  const latestLocal = messages[0];

  const serverAhead =
  chatMeta.last_message_at &&
  new Date(chatMeta.last_message_at) >
  new Date(latestLocal.created_at);

  if (
  serverAhead &&
  !syncLoading &&
  !syncError
  ) {
  console.log("[CHAT] Sync → SYNC NEW MESSAGES");
  // dispatch(syncMessages({ chat_id }));
  }
  }, [
  chatMeta?.last_message_at,
  messages[0]?.created_at,
  syncLoading,
  syncError
  ]);

  const canPaginate =
  hasMore &&
  cursor &&
  !isLoading;

  const loadOlderMessages = () => {
  if (!canPaginate) return;
  dispatch(fetchMessages({chatId:chat_id,cursor}))
  console.log("[CHAT] Pagination → FETCH NEXT PAGE");
  // dispatch(fetchOlderMessages({ chat_id, cursor }));
  };

  useEffect(() => {
  if(!isAtBottom) return;
  if (!chatMeta?.last_read_at || !messages.length) return;

  const lastIncoming = [...messages]
  .find(m => m.sender_id !== userData?.id);

  if (!lastIncoming) return;

  // Force UTC
  const lastRead = new Date(chatMeta.last_read_at.endsWith('Z') 
  ? chatMeta.last_read_at 
  : chatMeta.last_read_at + 'Z');

  const incomingAt = new Date(lastIncoming.created_at); // usually already Z

  console.log("lastRead", lastRead.toISOString());
  console.log("incomingAt", incomingAt.toISOString());

  if (incomingAt > lastRead) {
  console.log("[CHAT] Read receipt → SEND LAST SEEN", lastIncoming.id);
  markChatAsRead(chat_id);
  }
  }, [
  chatMeta?.last_read_at,
  messages.length,
  userData?.id,isAtBottom
  ]);
  useEffect(() => {
  if (!messages.length || !userData?.id) return;

  const newestMessage = messages[0]; // 👈 because reversed / inverted
  const lastSeenId = lastSeenMessageIdRef.current;

  // First render
  if (!lastSeenId) {
  lastSeenMessageIdRef.current = newestMessage.id;
  return;
  }

  // No new realtime message
  if (newestMessage.id === lastSeenId) return;

  // New message arrived (socket)
  if (newestMessage.sender_id !== userData.id && !isAtBottom) {
  setUnreadCount(prev => prev + 1);
  }

  lastSeenMessageIdRef.current = newestMessage.id;
  }, [messages, isAtBottom, userData?.id]);
  const markChatAsRead = async (chatId) => {
  try {
  // 1️⃣ Optimistic UI update
  dispatch(updateChatLastReadAt({
  chat_id,
  last_read_at: new Date().toISOString()
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

  const avatarSource = other_avatar
  ? { uri: `${other_avatar}` }
  : require("../assets/newframe.png");

  useFocusEffect(
  useCallback(() => {
  // Screen focused
  if (chat_id) {
  dispatch(setActiveChat(chat_id));
  }

  return () => {
  // Screen unfocused / navigating away
  dispatch(clearActiveChat());
  };
  }, [chat_id, dispatch])
  );

  const handleRetry=async(message)=>{
  try {

  await retryMessageInQueue(message.local_id)
  dispatch(retryMessage({chatId:message.chat_id,local_id:message.local_id}))
  const newMessageForServer = {
  chat_id: message.chat_id,
  sender_id: message.sender_id,
  message_type: message.message_type,
  content: message.content,
  file_url: message.file_url,
  waveform: message.waveform,
  duration: message.duration,
  local_id: message.local_id,
  music: message.music,
  replying_to: message.replying_to, // 👈 keep this if it's a reply
  receiver_id: other_user_id
  };
  const res=await api.post("/message/send-tiny",{message:newMessageForServer,retry:true})
  if(res?.data?.success){
  await markMessageSent(res?.data?.message.local_id);
  const payload = {
  chatId:res?.data?.message.chat_id,
  local_id: res?.data?.message.local_id,
  status: 'sent',
  id:res?.data?.message.id,
  fileUrl: null,
  created_at:res?.data?.message?.created_at,
  seq:res?.data?.message?.seq,

  };
  dispatch(updateMessageStatus(payload));
  // 2️⃣ update chat last-message metadata
  dispatch(updateChatLastMessage({
  chat_id: res?.data?.message.chat_id,
  message:res?.data?.message
  }));
  }
  else
  {
  await markMessageFailed(message.local_id);
  const payload = {
  chatId: message.chat_id,
  local_id: message.local_id,
  status: 'failed',
  id:null,
  fileUrl: null
  };
  dispatch(updateMessageStatus(payload));
  } 
  } catch (error) {
  await markMessageFailed(message.local_id);
  const payload = {
  chatId: message.chat_id,
  local_id: message.local_id,
  status: 'failed',
  id:null,
  fileUrl: null
  };
  dispatch(updateMessageStatus(payload));
  }
  }


  const handleSendMesasge=async(message)=>{
  try {
  if (message.message_type === "music" || message.message_type === "text") {
  await addToMessageQueue(message);
  dispatch(addOptimisticMessage({ chatId: chat_id, message }));
  flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  const newmessage={...message,receiver_id:other_user_id}
  const newMessageForServer = {
  chat_id: message.chat_id,
  sender_id: message.sender_id,
  message_type: message.message_type,
  content: message.content,
  file_url: message.file_url,
  waveform: message.waveform,
  duration: message.duration,
  local_id: message.local_id,
  music: message.music,
  replying_to: message.replying_to, // 👈 keep this if it's a reply
  receiver_id: other_user_id
  };

  // 3️⃣ Send to API
  const res = await api.post("/message/send-tiny", { message: newMessageForServer });
  if(res?.data?.success){
  await markMessageSent(res?.data?.message.local_id);
  const payload = {
  chatId:res?.data?.message.chat_id,
  local_id: res?.data?.message.local_id,
  status: 'sent',
  id:res?.data?.message.id,
  fileUrl: null,
  created_at:res?.data?.message?.created_at,
  seq:res?.data?.message?.seq,
  };
  dispatch(updateMessageStatus(payload));
  // 2️⃣ update chat last-message metadata
  dispatch(updateChatLastMessage({
  chat_id: res?.data?.message.chat_id,
  message:res?.data?.message
  }));
  }
  else
  {
  await markMessageFailed(message.local_id);
  const payload = {
  chatId: message.chat_id,
  local_id: message.local_id,
  status: 'failed',
  id:null,
  fileUrl: null
  };
  dispatch(updateMessageStatus(payload));
  } 


  }
  }catch(err){
  await markMessageFailed(message.local_id);
  const payload = {
  chatId: message.chat_id,
  local_id: message.local_id,
  status: 'failed',
  id:null,
  fileUrl: null
  };
  dispatch(updateMessageStatus(payload));
  }

  }

  const handleSendMusic = (song) => {

  const message= createMessageObject({type:"music",chatId:chat_id,senderId:user?.userData.id,payload:song})
  handleSendMesasge(message)

  };

  const handleStartRecording = async () => {

  };
  const handleStopRecording = async () => {

  };

  const handleCancelRecording = async () => {

  };
  const [activeMessage, setActiveMessage] = useState(null);
  const [anchor, setAnchor] = useState(null);

  const onMessageLongPress = (message, event) => {
  const { pageX, pageY } = event;
  setActiveMessage(message);
  setAnchor({ x: pageX, y: pageY });
  };


  const renderItem = ({ item }) => (
  <MessageBubble
  item={item}
  user={user.userData}
  theme={theme}
  avatar={other_avatar}
  handleRetry={handleRetry}
  onMessageLongPress={(message, event) =>
  onMessageLongPress(message, event)
  }
  />
  );
  const PaginationLoader = () => {
  if (!isLoading) return null;

  return (
  <View style={{ paddingVertical: 16 }}>
  <ActivityIndicator size="small" color={theme.text.primary} />
  </View>
  );
  };
  if(!chat_id) 
  {
  return(
  <ScreenBackground>
  <View style={styles.container}>
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
  <View  style={styles.container}>
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
  <FlatList
  ref={flatListRef}
  data={messages}
  keyExtractor={(item) => item.local_id}
  renderItem={renderItem}
  inverted
  contentContainerStyle={{ padding: 16, paddingTop: 50 }}
  showsVerticalScrollIndicator={false}
  onScroll={handleScroll}
  scrollEventThrottle={16}
  onEndReached={loadOlderMessages}
  onEndReachedThreshold={0.3}

  ListFooterComponent={<PaginationLoader />}
  />

  <ChatInput
  replyTo={replyTo}
  onCancelReply={() => setReplyTo(null)}
  handleSend={({ type, text, fileUrl }) => {
  const message = createMessageObject({
  type,
  chatId: chat_id,
  senderId: user?.userData.id,
  payload: {
  content: text,
  fileUrl
  },
  replyTo // 👈 PASS IT HERE
  });

  handleSendMesasge(message);
  setReplyTo(null); // 👈 clear after sending
  }}
  user={user?.userData}
  startRecording={handleStartRecording}
  stopRecording={handleStopRecording}
  cancelRecording={handleCancelRecording}
  />
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

  <MusicPickerModal
  visible={showMusicModal}
  onClose={() => setShowMusicModal(false)}
  handleSend={(song)=>{

  handleSendMusic(song)
  }}
  />
  {activeMessage && anchor && (
  <MessageActionOverlay
  message={activeMessage}
  anchor={anchor}
  isMe={activeMessage.sender_id === user.userData.id}
  onClose={() => {
  setActiveMessage(null);
  setAnchor(null);
  }}
  onReply={() => {
  setReplyTo(activeMessage); // 👈 THIS IS THE KEY
  setActiveMessage(null);
  setAnchor(null);
  }}
  onDelete={async() => {
  // dispatch delete
  try {
    await removeFromMessageQueue(activeMessage.local_id)
     dispatch(removeMessage({chatId:activeMessage.chat_id,local_id:activeMessage.local_id}))
  setActiveMessage(null);
  } catch (error) {
     console.error(error) 
  }
 
  }}
  onRetry={() => {
  handleRetry(activeMessage);
  setActiveMessage(null);
  }}
  />
  )}
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

