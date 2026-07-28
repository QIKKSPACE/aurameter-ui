// screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Platform,
  PermissionsAndroid,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import NewIcon from "@react-native-vector-icons/material-icons";
import { saveFcmToken } from '../utils/saveFcmToken';

import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux"; // Redux hook
import AppText from "../components/AppText";
import { opacity } from "react-native-reanimated/lib/typescript/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStoryPolling } from "../polling/useStoryPolling";
const hexWithOpacity = (hex, opacity) => {
  // Remove "#" if exists
  hex = hex.replace("#", "");
        
  // If already rgba, return as is
  if (hex.startsWith("rgba") || hex.length > 6) return hex;

  const alpha = Math.round(opacity * 255).toString(16).padStart(2, "0");
  return `#${hex}${alpha}`;
};
const leaderboardTop3 = [
  { id: "1", name: "Aryan", score: 237, rank: 1, color: "#00BFFF", image: "https://picsum.photos/200/300?random=1" },
  { id: "2", name: "Ravi", score: 237, rank: 2, color: "#A45EE5", image: "https://picsum.photos/200/300?random=2" },
  { id: "3", name: "Kirti", score: 237, rank: 3, color: "#FF4C7E", image: "https://picsum.photos/200/300?random=3" },
];

const others = Array.from({ length: 10 }).map((_, i) => ({
  id: `${i + 4}`,
  name: "Rikkh.justscroll",
  score: 500,
  image: `https://picsum.photos/200/200?random=${i + 5}`,
}));
const formatCount = (num) => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "k";
  return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + "M";
}
const HomeScreen = () => {
   // useStoryPolling(); // ✅ starts/stops polling automatically
  const [activeTab, setActiveTab] = useState("Following");
  const { theme } = useTheme();
  const navigation = useNavigation();
  const userData = useSelector((state) => state.user.userData); // adjust path if needed

 useEffect(() => {
    const checkNotificationPermission = async () => {
      if (Platform.OS !== 'android') return;
      
      if (!userData) return;

      try {
        let granted = true;

        if (Platform.Version >= 33) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          granted = result === PermissionsAndroid.RESULTS.GRANTED;
        }

        if (granted) {
          await saveFcmToken(userData.id);
        } else {
          let attempts = parseInt(
            await AsyncStorage.getItem(NOTIFICATION_ATTEMPTS_KEY),
            10
          );
          if (isNaN(attempts)) attempts = 0;

          if (attempts === 0 || attempts % 10 === 0) {
            showNotificationPrompt(userData?.id);
          }

          await AsyncStorage.setItem(
            NOTIFICATION_ATTEMPTS_KEY,
            (attempts + 1).toString()
          );
        }
      } catch (err) {
        console.log('Error handling notification attempts:', err);
      }
    };

    const showNotificationPrompt = (userId) => {
      Alert.alert(
        'Enable Notifications',
        'Turn on notifications to get instant updates when new cars are approved.',
        [
          { text: 'Not now', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              try {
                const result = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                if (result === PermissionsAndroid.RESULTS.GRANTED) {
                await saveFcmToken(userId);
                }
              } catch (e) {
                console.log('Notification permission denied:', e);
              }
            },
          },
        ]
      );
    };

    checkNotificationPermission();
  }, []);
  // Get stories from Redux
  const storiesData = useSelector((state) => state.story.stories); // adjust path if needed
   const storiesForRender = React.useMemo(() => {
  // Always ensure "Your Story" slot exists
  if (!storiesData || storiesData.length === 0) {
    return [
      {
        user_id: userData?.id || "me",
        stories: [],
        isSelf: true,
      },
    ];
  }
 console.log(storiesData)
  return storiesData;
}, [storiesData, userData?.id]);
  const renderStory = ({ item, index }) => {
  // first story: Your Story case
  if (index === 0) {
    const firstStory = item.stories || [];
    if (firstStory.length === 0) {
      // No story → Show "+" with "Your Story"
      return (
        <TouchableOpacity
          style={[styles.storyWrapper, { opacity: 0.9, alignItems: "center" }]}
          onPress={() => navigation.navigate("AddStory")}
     
        >
          <View style={[styles.addStory, { borderColor: theme.text.accent }]}>
            <Icon name="plus" size={30} color={theme.text.accent} />
          </View>
          <AppText variant="button" style={[ { color: theme.text.primary, marginTop: 8,fontSize:12 }]}>
            Aura Status
          </AppText>
        </TouchableOpacity>
      );
    } else {
      // Story exists → Show last story thumbnail with "Your Story"
      const lastStory = firstStory[firstStory.length - 1];
      return (
        <TouchableOpacity
  style={[styles.storyWrapper, { opacity: 0.9, alignItems: "center" }]}
  onPress={() => navigation.navigate("Storyview", { startstartUserIndex: index })}
  key={item.user_id}
>
  <Image
    source={{
      uri:
        lastStory?.media_url?.startsWith("file://") ||
        lastStory?.media_url?.startsWith("content://") ||
        lastStory?.media_url?.startsWith("https")
          ? lastStory.media_url
          : `https://api.aurameter.in${lastStory?.media_url}`,
    }}
    style={[styles.storyImage, { borderColor: theme.text.accent }]}
  />

  <TouchableOpacity
    style={styles.plusButton}
    onPress={() => navigation.navigate("AddStory")}
  >
    <Text style={styles.plusText}>+</Text>
  </TouchableOpacity>

   <AppText variant="button" style={[ { color: theme.text.primary, marginTop: 8,fontSize:12 }]}>
            Aura Status
          </AppText>
</TouchableOpacity>

      );
    }
  }

  // other users' stories
  const lastStory = item.stories[item.stories.length - 1];
  return (
    <TouchableOpacity
      style={[styles.storyWrapper, { opacity: 0.9, alignItems: "center" }]}
              onPress={() => navigation.navigate("Storyview", {startUserIndex: index })}
              onLongPress={()=>{
                navigation.navigate("OtherProfile", {userId: lastStory?.userId })
              }}
       

    >
      <Image
      source={{ uri: `${lastStory?.media_url} `}}
        style={[styles.storyImage, { borderColor: theme.text.accent }]}
      />
      {
        item?.current_streak_count?<TouchableOpacity
  style={{
    position: "absolute",
    bottom: 18,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  }}
>
  <NewIcon name="whatshot" size={36} color="#ff6347" />

 <Text
  style={{
    position: "absolute",
    fontSize: 8,
    fontWeight: "800",
    color: "white",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: "hidden",
    bottom: 6,
    right:
      (item?.current_streak_count || 0).toString().length === 1
        ? 11
        : (item?.current_streak_count || 0).toString().length === 2
        ? 9
        : (item?.current_streak_count || 0).toString().length === 3
        ? 6
        : 4,
  }}
>
  {formatCount(item?.current_streak_count)}
</Text>

</TouchableOpacity>
:""
      }



      <AppText style={[ { color: theme.text.primary, marginTop: 8,fontSize:13 }]} variant="button">
        {item.username}
      </AppText>
    </TouchableOpacity>
  );
};


  const renderOtherRank = ({ item ,index}) => (
    <></>
  );

  const renderHeader = () => (
    <>
      <FlatList
     data={storiesForRender}

        horizontal
        renderItem={renderStory}
        keyExtractor={(item) => item.user_id}  
        contentContainerStyle={styles.storiesRow}
        showsHorizontalScrollIndicator={false}
      />
      <View style={[styles.logoRow, { opacity: 0.95 }]}>
        <TouchableOpacity style={styles.actionBtn}>
             <Image
               source={require("../assets/newframe.png")}
               style={styles.auraIcon}
               resizeMode="contain"
             />
           
           </TouchableOpacity>
           {theme.background.type!=="image"? <AppText variant="h2" style={[ { color: theme.text.primary }]}>
            AURAVERSE
          </AppText>
          :
        <View
  style={[
    styles.logoGradient,
    {
      backgroundColor: theme.background.color,
      opacity:theme.opacity.light
    },
  ]}
>
  <AppText variant="h2" style={{ color: theme.text.primary }}>
    AURAVERSE
  </AppText>
</View>
           }
       
        <TouchableOpacity onPress={()=>{navigation.navigate('Search')}}>
          <Icon name="search" size={26} color={theme.text.primary} />
        </TouchableOpacity>
      </View>
      <View style={[styles.tabs, { opacity: 0.95,marginBottom:30,width:'95%',alignSelf:'center',paddingVertical:8 },
         theme.background.style!=="image"?{
            backgroundColor: theme.background.color,
      opacity:theme.opacity.light,padding:4,borderRadius:5
          }:{}
      ]}>
        {["Global", "Following", "College"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} >
            <AppText
            variant="button"
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab
                      ? theme.text.primary
                      : theme.text.secondary,
                },
                activeTab === tab && { fontWeight: "bold" },
               
              ]}
            >
              {tab.toUpperCase()}
            </AppText>
            {activeTab === tab && (
              <View
                style={[
                  styles.activeTabIndicator,
                  { backgroundColor: theme.text.accent },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
     
    </>
  );
  return (
    <ScreenBackground>
     
        <FlatList
          data={others}
          renderItem={renderOtherRank}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 0 }}
        />
  
    </ScreenBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  storiesRow: { flexDirection: "row", padding: 10, alignItems: "center", marginTop: 10 },
  addStory: {
    width: 70,
    height: 70,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  storyWrapper: { marginRight: 10, position: "relative" },
  storyImage: { width: 70, height: 70, borderRadius: 350, borderWidth: 2 },
  usernameText: { fontSize: 12, textAlign: "center",fontWeight:800 },
 logoText: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
    textAlign: "center",
    color: "#fff",
    paddingHorizontal: 10,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  tabText: {  fontSize: 14, textAlign: "right" },
  activeTabText: { color: "#fff", fontWeight: "bold" },
  activeTabIndicator: {
    height: 2,
   
    borderRadius: 3,
    marginTop: 2,
  },
  leaderboardTop: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    marginBottom: 10,
    marginTop: 10,
  },
  leaderItem: {
    alignItems: "center",
    position: "relative",
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1B263B",
  },
  leaderName: { color: "#fff", marginTop: 5, fontWeight: "600" },
  leaderScore: { color: "#A45EE5", marginTop: 2 },
  rankBadge: {
    position: "absolute",
    top: -6,
    left: -10,
    backgroundColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#fff",
  },
  rankText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B263B",
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 12,
    padding: 10,
  },
  rankNumber: { color: "#fff", width: 30, textAlign: "center" },
  rankImage: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 10 },
  rankName: { color: "#fff", flex: 1 },
  rankScore: { color: "#A45EE5", fontWeight: "bold" },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  pageBtn: {
    backgroundColor: "#1B263B",
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 10,
  },
  pageText: { color: "#fff", fontSize: 14 },
  logoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    marginTop: 20,
    marginHorizontal: 15,
  },
  logoGradient: {
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  fireBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    justifyContent: "center",
    alignItems: "center",
  },
  storyBadgeText: {
    position: "absolute",
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 5,
    marginLeft: 5,
  },
  leaderbordimg: {
  width: "100%",         // Fill the parent avatar circle
  height: "100%",        // Fill the parent avatar circle
  borderRadius: 999,     // Ensures perfect circle
  resizeMode: "cover",   // Image covers the circle without distortion
},
plusButton: {
position: 'absolute',
bottom:20, // 👈 positions it overlapping the bottom center
right: 0,
width: 24,
height: 24,
borderRadius: 12,
backgroundColor: '#00E5FF',
justifyContent: 'center',
alignItems: 'center',
borderWidth: 1,
borderColor: '#fff',
zIndex: 10,
},

plusText: {
color: '#fff',
fontSize: 16,
fontWeight: 'bold',
},
containerAurabattle:{
 
},
  actionBtn: { alignItems: "center" },
  actionLabel: { marginTop: 4, fontSize: 12, color: "#fff", fontWeight: "600" },
  auraIcon: { width: 36, height: 36 },
});
