    import { ActivityIndicator, Alert, Image, Modal, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
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
    import { addToMessageQueue, markMessageFailed, markMessageSent, removeFromMessageQueue, retryMessageInQueue } from '../utils/messageQueue';
    import { addOptimisticMessage, removeMessage, retryMessage, updateMessageStatus } from '../store/messageSlice';
    import { createMessageObject } from '../utils/createMessageObject';
    import api from '../services/api';
    import { clearActiveChat, setActiveChat, updateChatLastMessage, updateChatLastReadAt } from '../store/chatSlice';
    import MessageActionOverlay from "../components/MessageActionOverlay";
    import { fetchMessages } from '../store/messageThunks';
    import { decrementUnreadChats } from '../store/unreadSlice';
    import { useAudioRecorder } from '../hooks/useAudioRecorder';
    import CircleWaveForm from '../components/CircleWaveForm';
  import Icon from "react-native-vector-icons/MaterialCommunityIcons";
    import RNFS from "react-native-fs";
    import { CameraRoll } from "@react-native-camera-roll/camera-roll";
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
    const [audioMessage, setAudioMessage] = useState(null); // NEW: holds the recorded audio message object
    const { startRecording, stopRecording, cancelRecording, isRecording } = useAudioRecorder();
    const [pendingImage, setPendingImage] = useState(null);
    const [viewerImage, setViewerImage] = useState(null);
    const [isSavingImage, setIsSavingImage] = useState(false);

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
   const handleRetry = async (message) => {
    const isMedia =
  message.message_type === "image" ||
  message.message_type === "audio";
  try {

    await retryMessageInQueue(message.local_id);

    dispatch(retryMessage({
      chatId: message.chat_id,
      local_id: message.local_id
    }));

    /**
     * TEXT / MUSIC / QUIZ / STICKER
     */
    if (
      !isMedia
    ) {

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
        replying_to: message.replying_to,
        receiver_id: other_user_id,
        quiz: message?.quiz
      };

      const res = await api.post(
        "/message/send-tiny",
        {
          message: newMessageForServer,
          retry: true
        }
      );

      if (res?.data?.success) {

        await markMessageSent(
          res.data.message.local_id
        );

        dispatch(updateMessageStatus({
          chatId: res.data.message.chat_id,
          local_id: res.data.message.local_id,
          status: "sent",
          id: res.data.message.id,
          created_at: res.data.message.created_at,
          seq: res.data.message.seq
        }));

        dispatch(updateChatLastMessage({
          chat_id: res.data.message.chat_id,
          message: res.data.message
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

      return;
    }

    /**
     * MEDIA RETRY
     */
    const formData = new FormData();

    formData.append("file", {
      uri: message.file_url,

      type:
        message.message_type === "image"
          ? "image/jpeg"
          : "audio/aac",

      name:
        message.message_type === "image"
          ? `image-${Date.now()}.jpg`
          : `audio-${Date.now()}.aac`
    });

    formData.append(
      "chat_id",
      message.chat_id
    );

    formData.append(
      "message_type",
      message.message_type
    );

    formData.append(
      "local_id",
      message.local_id
    );

    formData.append(
      "receiver_id",
      other_user_id
    );

    formData.append(
      "retry",
      "true"
    );

    if (message.waveform) {
      formData.append(
        "waveform",
        JSON.stringify(message.waveform)
      );
    }

    if (message.duration) {
      formData.append(
        "duration",
        String(message.duration)
      );
    }

    if (message.replying_to) {
      formData.append(
        "replying_to",
        message.replying_to
      );
    }

    const res = await api.post(
      "/message/send-media",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data"
        }
      }
    );

    if (res?.data?.success) {

      await markMessageSent(
        res.data.message.local_id
      );

      dispatch(updateMessageStatus({
        chatId: res.data.message.chat_id,

        local_id:
          res.data.message.local_id,

        status: "sent",

        id: res.data.message.id,

        fileUrl:
          res.data.message.file_url ||
          res.data.message.fileUrl,

        created_at:
          res.data.message.created_at,

        seq:
          res.data.message.seq,

        duration:
          res.data.message.duration
      }));

      dispatch(updateChatLastMessage({
        chat_id: res.data.message.chat_id,
        message: res.data.message
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
      fileUrl: message.file_url
      };
      dispatch(updateMessageStatus(payload));
      } 

  } catch (error) {

    await markMessageFailed(
      message.local_id
    );

    dispatch(updateMessageStatus({
      chatId: message.chat_id,
      local_id: message.local_id,
      status: "failed",
      id: null,

      // IMPORTANT:
      // keep local uri for retry
      fileUrl: message.file_url || null
    }));
  }
};


    const handleSendMesasge=async(message)=>{
    try {

    if (message.message_type === "music" || message.message_type === "text" ||message.message_type === "sticker" ||
      message.message_type === "quiz" ) {
    dispatch(addOptimisticMessage({ chatId: chat_id, message }));

    await addToMessageQueue(message);
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
    else
    {
    dispatch(addOptimisticMessage({ chatId: chat_id, message }));

    await addToMessageQueue(message);
    flatListRef.current?.scrollToOffset({
    offset: 0,
    animated: true
    });

    /**
    * 2️⃣ Build multipart form
    */
    const formData = new FormData();

    formData.append("file", {
    uri: message.file_url,
    type:
    message.message_type === "image"
    ? "image/jpeg"
    : "audio/aac",

    name:
    message.message_type === "image"
    ? `image-${Date.now()}.jpg`
    : `audio-${Date.now()}.aac`
    });

    /**
    * 3️⃣ Append metadata
    */
    formData.append("chat_id", message.chat_id);

    formData.append("message_type", message.message_type);

    formData.append("local_id", message.local_id);

    formData.append("receiver_id", other_user_id);

    if (message.waveform) {
    formData.append(
    "waveform",
    JSON.stringify(message.waveform)
    );
    }
    if (message.duration) {
    formData.append(
    "duration",
    String(message.duration)
    );
    }
    if (message.replying_to) {
    formData.append(
    "replying_to",
    message.replying_to
    );
    }

    /**
    * 4️⃣ Send multipart request
    */
    const res = await api.post(
    "/message/send-media",
    formData,
    {
    headers: {
    "Content-Type":
      "multipart/form-data"
    }
    }
    );
    if(res?.data?.success){
    await markMessageSent(
    res.data.message.local_id
    );

    dispatch(updateMessageStatus({
    chatId: res.data.message.chat_id,
    local_id: res.data.message.local_id,
    status: "sent",
    id: res.data.message.id,

    fileUrl:
    res.data.message.file_url ||
    res.data.message.fileUrl,

    created_at: res.data.message.created_at,

    seq: res.data.message.seq,

    duration: res.data.message.duration
    }));

    dispatch(updateChatLastMessage({
    chat_id: res.data.message.chat_id,
    message: res.data.message
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
    fileUrl: message.file_url
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

      const ensurePhotoPermission = async () => {
    if (Platform.OS !== "android") return true;

    try {
    if (Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
    }

    const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
    return false;
    }
    };
       const handleDownloadImage = async () => {
    if (!viewerImage || isSavingImage) return;

    setIsSavingImage(true);
    let tempFilePath = null;

    try {
    const hasPermission = await ensurePhotoPermission();
    if (!hasPermission) {
    Alert.alert("Permission needed", "Allow photo access to save this image.");
    return;
    }

    let assetUri = viewerImage;

    if (/^https?:\/\//i.test(viewerImage)) {
    tempFilePath = `${RNFS.CachesDirectoryPath}/chat-image-${Date.now()}.jpg`;
    const result = await RNFS.downloadFile({
    fromUrl: viewerImage,
    toFile: tempFilePath,
    }).promise;

    if (result.statusCode !== 200) {
    throw new Error("Image download failed");
    }

    assetUri = Platform.OS === "android" ? `file://${tempFilePath}` : tempFilePath;
    }

    await CameraRoll.save(assetUri, { type: "photo" });
    Alert.alert("Saved", "Image downloaded to your gallery.");
    } catch (error) {
    Alert.alert("Download failed", "Couldn't save this image right now.");
    } finally { 
    if (tempFilePath) {
    try {
    await RNFS.unlink(tempFilePath);
    } catch (error) {}
    }
    setIsSavingImage(false);
    }
    };
    return (
    <ScreenBackground>
    <View style={styles.container}>
    <ChatHeader  theme={theme} other_user_id={other_user_id} other_username={other_username} 
    other_avatar={other_avatar} navigation={navigation} onOpenSheet={()=>{setShowSyickerSheet(true)}}
    onOpenModal={()=>{setShowMusicModal(true)}}/>
    {isRecording?
    <View style={{position:'absolute',bottom:0,justifyContent:'center',alignItems:'center',zIndex:999}}>
      <CircleWaveForm /></View>:null}
    <MessageList
    messages={messages}
    user={user.userData}
    theme={theme}
    avatar={other_avatar}
    onRetry={(message)=>{handleRetry(message)}} 
    onLongPress={(message, event) =>
    onMessageLongPress(message, event)
    }
     onImagePress={(uri) => {
    if (uri) setViewerImage(uri);
  
    }}
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
    imageUri={pendingImage}
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
    startRecording={startRecording}
    cancelRecording={cancelRecording}
    stopRecording={async () => {
    const audio = await stopRecording();
    if (!audio) return;

    const message = createMessageObject({
    type: "audio",
    chatId: chat_id,
    senderId: user?.userData.id,
    payload: {
    fileUrl: audio.fileUrl || audio.audioUrl, // depending on your hook
    waveform: audio.waveform,
    duration: audio.duration,
    },
    replyTo,
    });
    handleSendMesasge(message);
    setReplyTo(null);
    }}
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
    onImageSelect={(uri) => {
    setPendingImage(uri);

    // handleSendMesasge(message);
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
    <Modal
    visible={Boolean(viewerImage)}
    transparent
    animationType="fade"
    onRequestClose={() => setViewerImage(null)}
    >
    <View style={styles.viewerBackdrop}>
    <Pressable
    style={StyleSheet.absoluteFill}
    onPress={() => setViewerImage(null)}
    />
    <View style={styles.viewerHeader}>
    <Pressable style={styles.viewerIconButton} onPress={() => setViewerImage(null)}>
    <Icon name="close" size={24} color="#fff" />
    </Pressable>
    <Pressable
    style={styles.viewerIconButton}
    onPress={handleDownloadImage}
    disabled={isSavingImage}
    >
    {isSavingImage ? (
    <ActivityIndicator size="small" color="#fff" />
    ) : (
    <Icon name="download" size={22} color="#fff" />
    )}
    </Pressable>
    </View>
    <View style={styles.viewerContent}>
    {viewerImage ? (
    <Image
    source={{ uri: viewerImage }}
    style={styles.viewerImage}
    resizeMode="contain"
    />
    ) : null}
    </View>
    </View>
    </Modal>
    </ScreenBackground>
    )
    }

    export default ChatScreen

   const styles = StyleSheet.create({
    container: { flex: 1 },
    viewerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
    },
    viewerHeader: {
    position: "absolute",
    top: 18,
    left: 16,
    right: 16,
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    },
    viewerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
    },
    viewerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 72,
    },
    viewerImage: {
    width: "100%",
    height: "100%",
    },
    })