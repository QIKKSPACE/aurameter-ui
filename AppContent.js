    import { Dimensions, NativeModules, StyleSheet, Text, View } from 'react-native'
    import React, { useEffect, useRef } from 'react'
    import { SafeAreaView } from 'react-native-safe-area-context'
    import LogoutModal from './src/components/LogoutModal'
    import { useToast } from './src/constants/context/ErrorContext'
    import { createDrawerNavigator } from "@react-navigation/drawer";
    import { useTheme } from './src/constants/context/ThemeContext'
    import ErrorToast from "./src/components/ErrorToast";
    import { useDispatch, useSelector } from 'react-redux'
    const { width: screenWidth } = Dimensions.get("window");    
    import StackNavigator from "./src/navigation/StackNavigator";
    import CustomDrawer from "./src/navigation/CustomDrawer";
    import {useDeviceId} from './src/hooks/useDeviceId'
    import {useStoryUploadEvents} from './src/hooks/useStoryUploadEvents'

    import {useAppStateReconnect} from './src/hooks/useAppStateReconnect'
    import {useStories} from './src/hooks/useStories'
    import {useSockets} from './src/hooks/useSockets'

    import { fetchUnreadCounts } from './src/store/unreadSlice'
    import { fetchNotifications } from './src/store/notificationSlice'
    import { fetchChats, selectMessageBootstrapBatch } from './src/store/chatSlice'
    import api from './src/services/api'
    import { setAchievements, updateUserData } from './src/store/userSlice'
    import { fetchAuraChats } from './src/store/AuraChatSlice'
    import { fetchMessages, syncMessages } from './src/store/messageThunks'
    import { syncWordLevel } from './src/store/wordGameSlice'
    import { setLevel } from './src/store/ballSortSlice'


    const AppContent = () => {
    const {showToast,toast}=useToast()
    const Drawer = createDrawerNavigator();
    const userdata = useSelector((state) => state.user);
    const dispatch=useDispatch()
    const chats=useSelector(state => state.auraChat)

    const { theme } = useTheme();
    useDeviceId();

const fetchUser = async () => {
  try {
    if (!userdata?.token) return;

    const res = await api.get("/user/refreshUser");

    if (res?.data?.success) {

      // Update user
      dispatch(updateUserData(res.data.user));

      // Update achievements
      dispatch(setAchievements(res.data.achievements || []));
  dispatch(
        syncWordLevel(
          res.data.user
            ?.word_level || 1
        )
      );
    
   dispatch(
        setLevel(
          res.data.user
            ?.ball_sort_level+1 || 1
        )
      );
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

    useEffect(()=>{

    if(userdata.userData)
    {
      

    if((userdata?.profileCompletion*100==100) && userdata?.userData?.has_accepted_chat_agreement)
    {
      
        dispatch(fetchAuraChats({cursor:chats?.lastChatId}))
    }
    }

    },[userdata?.profileCompletion,userdata?.userData?.has_accepted_chat_agreement])
    useStoryUploadEvents()
     useAppStateReconnect()
    useSockets();
    useStories();

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
  )
}

export default AppContent

const styles = StyleSheet.create({})