import React, { useEffect, useRef } from "react";
import { StatusBar, Dimensions, NativeModules, View, ActivityIndicator, NativeEventEmitter, Platform, AppState } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import api from "./src/services/api";
import { getStatusBarConfig } from "./src/utils/statusBarUtils";
import { setAndroidStatusBarColor } from "./src/services/statusBarService";

import { store, persistor } from "./src/store/store"; // ✅ import redux store
import StackNavigator from "./src/navigation/StackNavigator";
import CustomDrawer from "./src/navigation/CustomDrawer";
import BackgroundWrapper from "./src/components/BackgroundWrapper";
   
import { ThemeProvider, useTheme } from "./src/constants/context/ThemeContext";
import { ToastProvider,useToast} from "./src/constants/context/ErrorContext";
     
import { lightTheme, darkTheme } from "./src/constants/themes";
import { fetchStoriesFailure, fetchStoriesStart, fetchStoriesSuccess, storyUploadFailure, storyUploadSuccess, updateStoryStatuses } from "./src/store/storySlice";
import { syncQueueWithFeed } from "./src/utils/syncQueueWithFeed";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ErrorToast from "./src/components/ErrorToast";
import { fetchAuraChats, markSeenByAiUpTo, prependMessage, setAiError, setAiThinking } from "./src/store/AuraChatSlice";
import { setDeviceId, updateUserData } from "./src/store/userSlice";
import { fetchNotifications } from "./src/store/notificationSlice";
import { getSocket, disconnectSocket, detachSocketListeners, detachSocketListener, reconnectAllSockets } from "./src/services/socketManager";
import { addMessage, addNewChat, fetchChats, markInitialMessagesFetched, removeChat, 
  selectMessageBootstrapBatch, updateChatLastMessage } from "./src/store/chatSlice";
import { fetchUnreadCounts, incrementUnreadChats } from "./src/store/unreadSlice";

import {fetchMessages, syncMessages} from './src/store/messageThunks'
import AsyncStorage from "@react-native-async-storage/async-storage";
const Drawer = createDrawerNavigator();
const { SplashModule,WorkManagerModule} = NativeModules;
const { width: screenWidth } = Dimensions.get("window");
import {uuidv4} from './src/utils/uuid'
import LogoutModal from './src/components/LogoutModal'
import { addSocketMessage } from "./src/store/messageSlice";
import { updateUploadStatus } from "./src/utils/UploadQueue";
const AppContent = () => {
const { theme } = useTheme();    
const statusBarConfig = getStatusBarConfig(theme);
const eventEmitter = new NativeEventEmitter(WorkManagerModule);
const dispatch=useDispatch();
const userdata = useSelector((state) => state.user);
const {showToast}=useToast()
const { stories, loading,  } = useSelector((state) => state.story);
 const { toast } = useToast();  // ✅ get toast state
 const notification = useSelector((state) => state.notifications);
 const userchats=useSelector(state => state.chats)
 
  useEffect(()=>{
   initDeviceId()  
   
  },[userdata?.deviceId])
  const initDeviceId = async () => {
  let deviceId = await AsyncStorage.getItem("deviceId");
    //console.error(deviceId)               
  if (!deviceId) {
    deviceId = uuidv4();
    await AsyncStorage.setItem("deviceId", deviceId);
  }

  dispatch(setDeviceId(deviceId))
};
useEffect(() => {
  let currentState = AppState.currentState;

  const sub = AppState.addEventListener("change", async (nextState) => {
    if (
      currentState.match(/inactive|background/) &&
      nextState === "active"
    ) {
    
      await reconnectAllSockets();
    }

    currentState = nextState;
  });

  return () => sub.remove();
}, []);
 
    
  // Hide splash after fetching user
useEffect(() => {
  if (!userdata?.refreshToken) return;

  let isMounted = true;

  (async () => {
    if (!isMounted) return;

    await getSocket("/aurachat", {
      "new-aura-reply": (data) => {
        console.log(data)
        if (data?.success) {
        dispatch(setAiThinking(false));
        const payload={id: data?.id, text: data.reply, sender: "aura", created_at: data?.createdAt}
        dispatch(prependMessage(payload));
        const aiCreatedAt =data?.createdAt;
        store.dispatch(markSeenByAiUpTo({aiMessageCreatedAt:aiCreatedAt}));
   
      }
      else
      {
          dispatch(setAiThinking(false));
          dispatch(setAiError(true));
      }
    }
    });

    await getSocket("/chat", {
      "receive-message": (data) => {
       if (!data?.success) return;

  const { chatId, message } = data;

  // 1️⃣ Dispatch to messages slice
  dispatch(addSocketMessage({ chatId, message }));

  // 2️⃣ Get current state
  const state = store.getState();
  const currentUserId = state.user.userData?.id;
  const chat = state.chats.chats.find(c => c.chat_id === chatId);

  if (!chat) return;

  // 3️⃣ Check if chat already has unread messages
  const hasUnread =
    chat.last_message_at &&
    (!chat.last_read_at || new Date(chat.last_message_at) > new Date(chat.last_read_at)) &&
    chat.last_message_by !== currentUserId;

  // 4️⃣ Only increment unread if no unread exists
  if (!hasUnread && message.sender_id !== currentUserId) {
    dispatch(incrementUnreadChats());
  }

  // 5️⃣ Update chat metadata
  dispatch(updateChatLastMessage({ chat_id: chatId, message }));
}
    });

    await getSocket("/follow_unfollow", {
      "follow_update": (data) => {
        if (!data?.success) return;
        if (data.baseType === "FOLLOW" && data.chat) dispatch(addNewChat({ chat: data.chat }));
        if (data.baseType === "UNFOLLOW" && data.deactivate_chat?.chat_id) dispatch(removeChat(data.deactivate_chat.chat_id));
      },
    });
  })();

  return () => {
    isMounted = false;
    
    // detach listeners if needed
  };
}, [userdata?.refreshToken]);
 const fetchUser = async () => {

    try {
        if(!userdata?.token) return;
          
      const res = await api.get('/user/refreshUser');
      if (res?.data?.success) {
        dispatch(updateUserData(res.data.user));
      } else {
        console.error("Something went wrong");
      }
    } catch (error) {
      console.error(error);
    }
  }; 
 useEffect(()=>{  
   
 if(userdata.refreshToken)
 {
fetchUser();
dispatch(fetchUnreadCounts());
dispatch(fetchNotifications());
dispatch(fetchChats());


 }
 },[userdata?.refreshToken])



// Test status bar color change on app start
useEffect(() => {
const testStatusBar = async () => {
if (Platform.OS === 'android') {
const isLightContent = statusBarConfig.barStyle === 'light-content';
const result = await setAndroidStatusBarColor(statusBarConfig.backgroundColor, isLightContent);
}    
};
        
// Test after a short delay to ensure everything is loaded
testStatusBar()    
return () => {};
}, []);

// Update Android status bar when theme changes
useEffect(() => {


if (Platform.OS === 'android') {
const isLightContent = statusBarConfig.barStyle === 'light-content';
setAndroidStatusBarColor(statusBarConfig.backgroundColor, isLightContent);
}
}, [theme, statusBarConfig]);
useEffect(() => {
const loadStories = async () => {
//dispatch(fetchStoriesStart());

try {
const { data } = await api.get("/story/getStoriesFeed");
if (data.success) {
const feed = await syncQueueWithFeed(data.feed, userdata?.userData);
dispatch(fetchStoriesSuccess(feed));
} else {
  const feed = await syncQueueWithFeed([], userdata?.userData);
dispatch(fetchStoriesFailure({message:"Failed to load stories",feed}));

}
} catch (error) {
console.error("Error fetching stories:", error);
const feed = await syncQueueWithFeed([], userdata?.userData);
dispatch(fetchStoriesFailure({message:error.message,feed}));

}
};


// ✅ Only run when user is available
if (userdata?.userData?.id) {
loadStories();
}

}, [dispatch, userdata?.userData?.id]);
/* 
useEffect(() => {
const loadStories = async () => {
//dispatch(fetchStoriesStart());

try {
const { data } = await api.get("/story/getStoriesFeed");
if (data.success) {
const feed = await syncQueueWithFeed(data.feed, userdata?.userData?.id);
dispatch(fetchStoriesSuccess(feed));
} else {
dispatch(fetchStoriesFailure("Failed to load stories"));
}
} catch (error) {
console.error("Error fetching stories:", error);
dispatch(fetchStoriesFailure(error.message));
}
};


// ✅ Only run when user is available
if (userdata?.userData?.id) {
loadStories();
}

}, [dispatch, userdata?.userData?.id]);
*/

useEffect(() => {
  const subscription = eventEmitter.addListener(
    "storyUploadEvent",
    async (event = {}) => {
      console.log("📦 storyUploadEvent:", event);

      const status = event?.status;
      const storyId = event?.story_id;
      const blurhash = event?.blurhash;
      const local_id = event?.local_id;

     const update = {
      local_id,
    }; 

      if (status === "FAILED_SERVER") {
            showToast("Unable to send story,retry again!.","error")
            update.status="FAILED"
        //dispatch(storyUploadFailure({  user_id: userdata?.userData?.id, storyId }));
      } else if (status === "PENDING") {
          update.story_id=storyId
          update.status="PENDING"
          update.blurhash=blurhash

      }
       await updateUploadStatus(update);
      dispatch(updateStoryStatuses([update]))
      
    }
  );

  // ✅ CLEANUP
  return () => {
    subscription.remove();
  };
}, []);

const chats=useSelector(state => state.auraChat)

 useEffect(()=>{

    if(userdata.userData)
    {
          

        if((userdata?.profileCompletion*100==100) && userdata?.userData?.has_accepted_chat_agreement)
        {
          
            dispatch(fetchAuraChats({cursor:chats?.lastChatId}))
        }
    }

 },[userdata?.profileCompletion,userdata?.userData?.has_accepted_chat_agreement])

 useEffect(()=>{
    NativeModules.SplashModule?.hide();
    
 },[])
 
const batch = useSelector(selectMessageBootstrapBatch);
const chatsReady = useSelector(
  state => state.chats.chatsFetchedFromServer
);

const didBootstrapRef = useRef(false);

useEffect(() => {
  if(!userdata?.userData?.id) return;
  if (!chatsReady) return;               // 🔒 WAIT FOR SERVER
  if (didBootstrapRef.current) return;
  if (!batch.length) return;
  
  didBootstrapRef.current = true;
 
  batch.forEach(item => {
   console.log(item)
   if(item.type=="FETCH")
   {
    dispatch(fetchMessages({chatId:item.chatId}))
   }
    if(item.type=="SYNC")
   {
   dispatch(syncMessages({chatId:item.chatId,afterSeq:item.since,sinceId:item?.sinceId}))
   }
  });
}, [chatsReady, batch, dispatch,userdata?.userData?.id]);
return (
<SafeAreaView style={{ flex: 1, backgroundColor: theme.background.color }} edges={['top','bottom']}>


<View style={{flex:1}}>


<LogoutModal
  visible={userdata?.isLoggingOut}
  message={userdata?.authError}
/>

<ErrorToast message={toast.message} type={toast.type} theme={theme} />
<Drawer.Navigator
drawerContent={(props) => <CustomDrawer {...props} />}
screenOptions={{
headerShown: false,
swipeEnabled: false,
drawerType: "front",
overlayColor: "transparent",
sceneContainerStyle: {
backgroundColor: theme.background.color,
},
drawerStyle: {
width: screenWidth * 0.72,    
backgroundColor: theme.components.drawer || theme.background.color,
},
}}
>
<Drawer.Screen name="HomeStack" component={StackNavigator} />
</Drawer.Navigator>
</View>
 
</SafeAreaView>

);
};
export default AppContent