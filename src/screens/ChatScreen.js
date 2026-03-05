      import { StyleSheet, Text, View } from 'react-native'
      import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
      import { useTheme } from '../constants/context/ThemeContext';
      import { useDispatch, useSelector } from 'react-redux';
      import MessageList from "../components/chats/MessageList";
      import ChatHeader from "../components/chats/ChatHeader";

      import { makeSelectMessagesWithMeta } from '../store/messageSelector';
      import ScreenBackground from '../components/ScreenBackground';
      import { useFocusEffect, useNavigation } from '@react-navigation/native';
      import ChatInput from "../components/ChatInput";
      import StickerSheet from "../components/chats/StickerSheet";
      import MusicPickerModal from "../components/SearchMusic";
      import { addToMessageQueue, markMessageFailed, markMessageSent, retryMessageInQueue } from '../utils/messageQueue';
      import { addOptimisticMessage, retryMessage, updateMessageStatus } from '../store/messageSlice';
      import { createMessageObject } from '../utils/createMessageObject';
      import api from '../services/api';
      import { clearActiveChat, setActiveChat, updateChatLastMessage, updateChatLastReadAt } from '../store/chatSlice';
      import MessageActionOverlay from "../components/MessageActionOverlay";
      import { fetchMessages } from '../store/messageThunks';
import { decrementUnreadChats } from '../store/unreadSlice';

      const ChatScreen = ({ route }) => {
      const { theme } = useTheme();
      const { chat_id, other_user_id, other_avatar, other_username } = route?.params;
      const listRef = useRef(null);
      const [showStickerSheet,setShowSyickerSheet]=useState(false)
      const [showMusicModal,setShowMusicModal]=useState(false)
      const [replyTo, setReplyTo] = useState(null);
      const [isAtBottom, setIsAtBottom] = useState(true);
      // Get messages for this chat
      const flatListRef = useRef();
      const user = useSelector((state) => state.user);
      const dispatch=useDispatch()
      const navigation=useNavigation()
      const [unreadCount, setUnreadCount] = useState(0);


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
      const selectMessagesWithMeta = useMemo(makeSelectMessagesWithMeta, []);
      const { messages, hasMore,cursor, isLoading, hasError, syncLoading, syncError,lastSeq } = 
      useSelector(state => selectMessagesWithMeta(state, chat_id));
      
      const seqSet = useMemo(() => {
      const set = new Set();
      for (const m of messages) {
      const seq = Number(m.seq);
      if (Number.isFinite(seq)) {
      set.add(seq);
      }
      }
      return set;
      }, [messages]);
      const highestSeq = useMemo(() => {
      return messages.length ? messages[0].seq : null;
      }, [messages.length, messages[0]?.seq]);
        const lowestSeq = useMemo(() => {
      return messages.length ? messages[messages.length-1].seq : null;
      }, [messages.length, messages[messages.length-1]?.seq]);
   function getReadableSeqMVP(lastSeenSeq) {
  // If user never read AND we don't have seq 1, don't guess
    if(lastSeenSeq>highestSeq) return;
      let next=Number(lowestSeq);
     while(seqSet)
     {
        if (!seqSet.has(next)) break;
         next=next+1
     }
    // console.log(lastSeenSeq,Number(highestSeq))
  
  return next-1;
}

      const contentHeightRef = useRef(0);
      const layoutHeightRef = useRef(0);

      const isScrollable = () =>
      contentHeightRef.current > layoutHeightRef.current + 10;
      const handleContentSizeChange = (w, h) => {
      contentHeightRef.current = h;

      // If content is NOT scrollable → user is effectively at bottom
      if (!isScrollable()) {
      setIsAtBottom(true);
      setUnreadCount(0);
      }
      };
      const handleLayout = (e) => {
      layoutHeightRef.current = e.nativeEvent.layout.height;

      if (!isScrollable()) {
      setIsAtBottom(true);
      setUnreadCount(0);
      }
      };
      const handleScroll = (event) => {
      const offsetY = event.nativeEvent.contentOffset.y;

      const atBottom = offsetY <= 60; // inverted list
      setIsAtBottom(atBottom);

      if (atBottom) {
      setUnreadCount(0);
      }
      };
      const canPaginate =
      hasMore &&
      cursor &&
      !isLoading;
      const chatMeta = useSelector(state =>
      state.chats.chats.find(c => c.chat_id === chat_id)
      );
      useEffect(() => {
      if (!isAtBottom) return;
      if (!chatMeta) return;
      if (!messages.length) return;

      const lastSeenSeq = chatMeta.last_seen_seq ?? 0;


      const readableSeq = getReadableSeqMVP(
      lastSeenSeq,
      );


      if (readableSeq == null || readableSeq <= lastSeenSeq) return;

      console.log(
      `[READ] Advancing read → seq ${readableSeq}`

      );
  markChatAsRead(chat_id,readableSeq)
      }, [
      highestSeq,                  // 🔥 real trigger
      isAtBottom,
      chatMeta?.last_seen_seq      // 🔥 server baseline
      ]);
 const markChatAsRead = async (chatId, readableSeq) => {
  if (!readableSeq || readableSeq <= 0) return;

  try {
    // 1️⃣ Optimistic UI update (monotonic)
    dispatch(updateChatLastReadAt({
      chat_id: chatId,
      last_read_at: new Date().toISOString(),
      last_seen_seq: readableSeq
    }));

    // 2️⃣ 🔥 DO NOT blindly decrement
    // unread count must be derived from seq, not events
  dispatch(decrementUnreadChats())

    // 3️⃣ Sync with server
    await api.post(`/me/chats/${chatId}/mark-read`, {
      last_seen_seq: readableSeq
    });

  } catch (err) {
    console.error("Failed to mark chat read:", err);
    // ❌ No rollback needed — server enforces GREATEST()
  }
};

      useEffect(() => {
      if (!chatMeta) return;

      if (
      chatMeta.last_message_seq &&
      messages.length === 0 &&
      !isLoading &&
      !hasError
      ) {
      console.log("[CHAT] Initial fetch → FETCH FIRST PAGE (+ preload)");
      dispatch(fetchMessages({ chatId:chat_id}));
      }
      }, [
      chat_id,
      chatMeta?.last_message_seq,
      messages.length,
      isLoading,
      hasError
      ]);

      useEffect(() => {
      if (!chatMeta || !messages.length) return;

      const latestLocal = messages[0];

      const serverAhead =
      chatMeta.last_message_seq &&
      chatMeta.last_message_seq >
      latestLocal.seq;

      if (
      serverAhead &&
      !syncLoading &&
      !syncError
      ) {
      console.log("[CHAT] Sync → SYNC NEW MESSAGES");
      // dispatch(syncMessages({ chat_id }));
      }
      }, [
      chatMeta?.last_message_seq,
      messages[0]?.seq,
      syncLoading,
      syncError
      ]);
      const loadOlderMessages = () => {
      if (!canPaginate) return;
      dispatch(fetchMessages({chatId:chat_id,cursor}))
      console.log("[CHAT] Pagination → FETCH NEXT PAGE");
      // dispatch(fetchOlderMessages({ chat_id, cursor }));
      };
      const [activeMessage, setActiveMessage] = useState(null);
      const [anchor, setAnchor] = useState(null);
      const onMessageLongPress = (message, event) => {
      const { pageX, pageY } = event;
      setActiveMessage(message);
      setAnchor({ x: pageX, y: pageY });
      };
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
      receiver_id: other_user_id,
      quiz:message?.quiz
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
      if (message.message_type === "music" || message.message_type === "text" ||message.message_type === "sticker" || message.message_type === "quiz" ) {
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
      receiver_id: other_user_id,
      quiz:message?.quiz
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

      const message= createMessageObject({type:"music",chatId:chat_id,senderId:user?.userData.id,payload:song,
        replyTo // 👈 PASS IT HERE
        })
      handleSendMesasge(message)

      };
      return (
      <ScreenBackground>
      <View style={styles.container}>
      <ChatHeader  theme={theme} other_user_id={other_user_id} other_username={other_username} 
      other_avatar={other_avatar} navigation={navigation} onOpenSheet={()=>{setShowSyickerSheet(true)}}
      onOpenModal={()=>{setShowMusicModal(true)}}/>
      <MessageList
      messages={messages}
      user={user.userData}
      theme={theme}
      avatar={other_avatar}
      onRetry={(message)=>{handleRetry(message)}} 
      onLongPress={(message, event) =>
      onMessageLongPress(message, event)
      }
      onLoadMore={()=>{loadOlderMessages()}}
      isLoading={isLoading}
      onScroll={handleScroll}
      onLayout={handleLayout}
      onContentSizeChange={handleContentSizeChange}
      ref={flatListRef}        // 👈 THIS is the key
      />
      <ChatInput
      replyTo={replyTo}
      onOpenSheet={()=>{setShowSyickerSheet(true)}}
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
      startRecording={()=>{}}
      stopRecording={()=>{}}
      cancelRecording={()=>{}}
      />
      </View>
      <StickerSheet
      visible={showStickerSheet}
      onClose={() => setShowSyickerSheet(false)}
      onQuizSelect={(quiz)=>{
        
      const message=createMessageObject(
      {
      type:'quiz',
      chatId: chat_id,
      senderId: user?.userData.id,
      payload:quiz,
      replyTo // 👈 PASS IT HERE
    }
      ) 
  
      handleSendMesasge(message);
          

      }}
      onStickerSelect={(sticker) => {

      const message=createMessageObject(
      {
      type:'sticker',
      chatId: chat_id,
      senderId: user?.userData.id,
      payload: {
      content: "",
      fileUrl:sticker?.url
      },
      replyTo // 👈 PASS IT HERE
    }
      ) 

      handleSendMesasge(message)
      // handleSendSticker(sticker.url)
      setShowSyickerSheet(false);
      }}
      onlinkselect={(link) => {
      const LINK_MIN_WIDTH = 150;
      const LINK_HEIGHT = 46;

      }}
      />
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
      </ScreenBackground>
      )
      }

      export default ChatScreen

      const styles = StyleSheet.create({
      container: { flex: 1 },
      })