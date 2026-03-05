// App.js
import React, { useEffect, useRef, useState } from "react";
import { store, persistor } from "./src/store/store"; // ✅ import redux store
import { StatusBar, Dimensions, NativeModules, View, ActivityIndicator, NativeEventEmitter, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { PersistGate } from "redux-persist/integration/react";
import PushNotification from "react-native-push-notification";
import messaging from "@react-native-firebase/messaging";
import {uuidv4} from './src/utils/uuid'

import { ThemeProvider, useTheme } from "./src/constants/context/ThemeContext";
import { ToastProvider,useToast} from "./src/constants/context/ErrorContext";
import { Provider, useDispatch, useSelector } from "react-redux";
import AppContent from './AppContent'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setDeviceId } from "./src/store/userSlice";
import {MessageToast} from './src/components/MessageToast'
import {AuraToast} from './src/components/AuraToast'

import { GestureHandlerRootView } from "react-native-gesture-handler";
import {hydrateQueuedMessages} from './src/store/hydrateQueuedMessages'
import { addSocketMessage } from "./src/store/messageSlice";
import { navigationRef, navigate } from "./src/navigation/RootNavigation";
import { prependMessage, setAiThinking } from "./src/store/AuraChatSlice";
// App.js or appBootstrap.js
import { initStoryPollingLifecycle } from "./src/polling/storyPollingLifecycle";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { updateChatLastMessage } from "./src/store/chatSlice";
import { incrementUnreadChats } from "./src/store/unreadSlice";

initStoryPollingLifecycle();

let pendingNotificationNavigation = null;
const App = () => {
const navReadyRef = useRef(false);
const rehydratedRef = useRef(false);
const [messagetoasti, setMessageToast] = useState(null);
const [auraToast, setAuraToast] = useState(null);


const showmessageToast = (data) => {
setMessageToast(null);           // 🔥 cancel previous
setTimeout(() => setMessageToast(data), 10);
};

const showauraToast = (data) => {
setAuraToast(null);           // 🔥 cancel previous
setTimeout(() => setAuraToast(data), 10);
};
useEffect(() => {
// 1️⃣ Create a notification channel
PushNotification.createChannel(
{
  channelId: "messages", // ✅ MUST MATCH backend
channelName: "Default Channel",
importance: 4,
vibrate: true,
},
(created) => console.log("Channel created:", created)
);

// 2️⃣ Handle notification clicks
PushNotification.configure({
  onNotification: function (notification) {
    console.log("Notification clicked:", notification);

    if (notification.userInteraction && notification.data?.screen) {
      handleNotificationNavigation(notification.data);
    }
  },
  requestPermissions: true,
});

// 3️⃣ Foreground message handler
const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
console.log("Foreground FCM:", remoteMessage);
const data = remoteMessage.data || {};

// ✅ SHOW MESSAGE TOAST INSTEAD OF NOTIFICATION
if (data.screen === "Messages") {
showmessageToast({
avatar: data.senderAvatar,           // send from backend
username: data.senderUsername,       // send from backend
message: data?.message || "",
screen: data.screen,
userId:data?.senderId,
chatId:data.chatId,

});
const parsedMessage=JSON.parse(data.fullMessage)
store.dispatch(
  addSocketMessage({
    chatId: data.chatId,
    message:parsedMessage ,
  })

);
 const state = store.getState();
    const currentUserId = state.user.userData?.id;
    const chat = state.chats.chats.find(c => c.chat_id === data?.chatId);

    if (!chat) return;

    // Ignore self messages
    if (parsedMessage?.sender_id === currentUserId) return;

    const lastSeenSeq = chat.last_seen_seq ?? 0;
    const lastMessageSeq = chat.last_message_seq ?? 0;

    /**
     * ✅ Chat already had unread messages IF
     * last_message_seq > last_seen_seq
     */
    const alreadyUnread = lastMessageSeq > lastSeenSeq;
   if (!alreadyUnread) {
      store.dispatch(incrementUnreadChats());
    }
store.dispatch(
  updateChatLastMessage({  chat_id: data.chatId,
    message: parsedMessage, })

)

return;
}

if (data.screen === "AuraChat") {
showauraToast({
message: data?.message || "",

});
   const payload={id: data?.messageId, text: data.message, sender: "aura", created_at: data?.createdAt}
          store.dispatch(setAiThinking(false));
        store.dispatch(prependMessage(payload));
        const aiCreatedAt =data?.createdAt;
        
        store.dispatch(markSeenByAiUpTo({aiMessageCreatedAt:aiCreatedAt}));
return;
}

/*PushNotification.localNotification({
channelId: "default-channel",
title: remoteMessage.notification?.title || "New Notification",
message: remoteMessage.notification?.body || "You have a new message",
bigText: remoteMessage.notification?.body,
playSound: true,
soundName: "default",
importance: "high",
priority: "high",
userInfo: remoteMessage.data,
});*/

});

// 4️⃣ Handle app open from quit/background state

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (!remoteMessage) return;

      const data = remoteMessage.data;
      console.log("🚀 Opened from KILLED state:", data);

      pendingNotificationNavigation = data;
    });

return () => {
unsubscribeForeground();
};
}, []);
const handleNotificationNavigation = (data) => {
  if (!navReadyRef.current || !rehydratedRef.current) {
    pendingNotificationNavigation = data;
    return;
  }

  if (!data?.screen) return;

  switch (data.screen) {
    case "Messages":
      navigate("ChatScreen", {
        chat_id: data.chatId,
        other_user_id: data.senderId,
        other_avatar: data.avatar,
        other_username: data.username,
      });
      break;

    case "AuraChat":
      navigate("AuraChat");
      break;

    default:
      navigate("Home");
  }
};
return (
<GestureHandlerRootView style={{ flex: 1 }}>
  <SafeAreaProvider>

<Provider store={store}>
<PersistGate
  persistor={persistor}
  onBeforeLift={() => {
    store.dispatch(hydrateQueuedMessages());
    rehydratedRef.current = true;

    if (navReadyRef.current && pendingNotificationNavigation) {
      handleNotificationNavigation(pendingNotificationNavigation);
      pendingNotificationNavigation = null;
    }
  }}
>
   <BottomSheetModalProvider>

<ToastProvider>
  
<ThemeProvider>
<NavigationContainer
  ref={navigationRef}
  onReady={() => {
    navReadyRef.current = true;

    if (rehydratedRef.current && pendingNotificationNavigation) {
      handleNotificationNavigation(pendingNotificationNavigation);
      pendingNotificationNavigation = null;
    }
  }}
>
  <AppContent />
</NavigationContainer>
</ThemeProvider>

{/* 🔥 TOAST MUST BE HERE */}
<MessageToast
visible={!!messagetoasti}
avatar={messagetoasti?.avatar}
username={messagetoasti?.username}
message={messagetoasti?.message}
chatId={messagetoasti?.chatId}
onPress={() => {
// navigation.navigate(...)
}}
onHide={() => setMessageToast(null)}
/>
 
<AuraToast
visible={!!auraToast}

message={auraToast?.message}
chatId={null}
onPress={() => {
// navigation.navigate(...)
}}
duration={5000}
onHide={() => setAuraToast(null)}
/>
</ToastProvider>
   </BottomSheetModalProvider>

</PersistGate>
</Provider>
  </SafeAreaProvider>

</GestureHandlerRootView>
);
}

export default App;
