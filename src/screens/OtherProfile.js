import {
ActivityIndicator,
StyleSheet,
Text,
View,
TouchableOpacity,
FlatList,
Image,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ScreenBackground from "../components/ScreenBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../constants/context/ThemeContext";
import api from "../services/api";
import AppText from "../components/AppText";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "@react-native-vector-icons/material-icons";
import Ionicons from "react-native-vector-icons/Ionicons";
import  PlaylistGrid from '../components/PlaylistGrid'
import { useToast } from "../constants/context/ErrorContext";
import { addNewChat, removeChat } from "../store/chatSlice";
import { useDispatch } from "react-redux";
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
const ZODIAC = [
{ key: "aries", label: "Aries", emoji: "♈︎" },
{ key: "taurus", label: "Taurus", emoji: "♉︎" },
{ key: "gemini", label: "Gemini", emoji: "♊︎" },
{ key: "cancer", label: "Cancer", emoji: "♋︎" },
{ key: "leo", label: "Leo", emoji: "♌︎" },
{ key: "virgo", label: "Virgo", emoji: "♍︎" },
{ key: "libra", label: "Libra", emoji: "♎︎" },
{ key: "scorpio", label: "Scorpio", emoji: "♏︎" },
{ key: "sagittarius", label: "Sagittarius", emoji: "♐︎" },
{ key: "capricorn", label: "Capricorn", emoji: "♑︎" },
{ key: "aquarius", label: "Aquarius", emoji: "♒︎" },
{ key: "pisces", label: "Pisces", emoji: "♓︎" },
];

const achievements = [

];

const OtherProfile = ({ navigation, route }) => {
const { setTemporaryTheme, restoreSavedTheme, theme } = useTheme();
const didFetchRef = useRef(false);
const userId = route.params?.userId;
const {showToast}=useToast()
const [isFetchingUser, setIsFetchingUser] = useState(true);
const [hasError, setHasError] = useState(false);
const [user, setUser] = useState(null);
const [zodiac, setZodiac] = useState(null);
const stopPlayerRef = useRef(null);
const dispatch=useDispatch()
useFocusEffect(
useCallback(() => {
// on screen focus
return () => {
// screen lost focus → STOP MUSIC
if (stopPlayerRef.current) {
stopPlayerRef.current();
}
};
}, [])
);

useEffect(() => {

if (!userId) return;
fetchUser();

return () => {
restoreSavedTheme(); // revert original theme
};
}, []);

// Fetch user from backend
const fetchUser = async () => {
if (user) return; // <-- prevents duplicate fetch on theme re-render

setHasError(false);
setIsFetchingUser(true);

try {
const res = await api.get(`/auth/getUser/${userId}`);
const fetchedUser = res.data?.user;

setUser(fetchedUser);
setZodiac(fetchedUser.zodiac || null);
// Apply temporary theme only the FIRST TIME
if (fetchedUser?.theme_id) {
setTemporaryTheme(fetchedUser.theme_id);
}

setIsFetchingUser(false);
} catch (err) {
console.log("Failed to load user:", err?.response?.data || err.message);
setHasError(true);
setIsFetchingUser(false);
}
};
const [isFollowing,setIsFollowing]=useState(false)
const followUnfollow = async () => {
  try {
    setIsFollowing(true); 
   
    
    const res = await api.post("/follow/follow-user/",{following_id: user.id });

    setIsFollowing(false);
     console.log(res)
    if (res.data.success) {
      // Toggle the follow state locally
      if(res.data.baseType=="FOLLOW" && res.data.chat){
        dispatch(addNewChat({chat:res.data.chat}))
      }
      else
      {
 if(res.data.deactivate_chat?.chat_id)
 {
       dispatch(removeChat(res.data.deactivate_chat?.chat_id))
 }
      }
     setUser((prev) => ({
        ...prev,
        i_follow_them: !prev.i_follow_them,
      }));
    } else {
      showToast("Something Went Wrong", "error");
    }
     
  } catch (error) {
    console.log(err)
    setIsFollowing(false);
    showToast("Something Went Wrong", "error");
  }
};

const renderAchievement = ({ item }) => (
<View
style={[
styles.achievementCard,
{ backgroundColor: theme.components.card },
]}
>
<Icon
name={item.icon}
size={22}
color={item.color}
style={{ marginRight: 10 }}
/>
<View style={{ flex: 1 }}>
<Text style={[styles.achievementName, { color: theme.text.primary }]}>
{item.title}
</Text>
<Text style={[styles.achievementDesc, { color: theme.text.secondary }]}>
{item.subtitle}
</Text>
</View>
</View>
);

return (
<ScreenBackground>
<View edges={["top"]} style={{ flex: 1 }}>
{/* LOADING */}
{isFetchingUser && !hasError && (
<View style={styles.center}>
<ActivityIndicator size={50} color={theme.text.accent} />
</View>
)}

{/* ERROR UI */}
{!isFetchingUser && hasError && (
<View style={styles.center}>
<Text style={[styles.errorText, { color: theme.text.primary }]}>
Failed to load user.
</Text>

<TouchableOpacity
onPress={fetchUser}
style={[
  styles.retryBtn,
  { backgroundColor: theme.components.box },
]}
>
<Text
  style={{ color: theme.text.primary, fontWeight: "bold" }}
>
  Retry
</Text>
</TouchableOpacity>
</View>
)}

{/* USER LOADED */}
{!isFetchingUser && !hasError && user && (
<FlatList
showsVerticalScrollIndicator={false}
ListHeaderComponent={
<>
{/* Header */}

{/* Profile Avatar */}
<View style={styles.profileSection}>
  <View style={styles.avatarWrapper}>
  {user?.avatar ? (
    <Image
      source={{ uri:user?.avatar }}
      style={styles.avatarImage}
    />
  ) : (
    <Image
      source={require("../assets/newframe.png")}
      style={styles.avatarImage}
    />
  )}

  {/* Mood emoji overlay */}
  {user?.mood && (() => {
    const moodObj = moods.find((m) => m.label === user.mood);
    if (!moodObj) return null;
    return (
      <View style={styles.moodOverlay}>
        <Text style={styles.moodEmoji}>{moodObj.emoji}</Text>
      </View>
    );
  })()}
</View>
  {user?.name?
  <View style={[ {marginBottom:5,width:'50%',alignSelf:'center',alignItems:'center' },
            theme.background.style!=="image"?{
              backgroundColor: theme.background.color,
        opacity:theme.opacity.light,padding:4,borderRadius:5
            }:{}
        ]}>
  <AppText  variant="h4" style={[{ color: theme.text.primary,fontSize:20}]}>
    {user?.name || ""}
  </AppText>
  </View>:""}
    {user?.bio? 
  <View style={[ {width:'95%',alignSelf:'center',alignItems:'center' },
            theme.background.style!=="image"?{
              backgroundColor: theme.background.color,
        opacity:theme.opacity.light,padding:4,borderRadius:5
            }:{}
        ]}>
  <AppText variant="body" style={[ { color: theme.text.secondary,textAlign:'center',fontSize:14 }]}>
    {user?.bio || ""}
  </AppText>
  </View>
  :""}
</View>

{/* Info Row */}
<View style={styles.infoRow}>
  <View
    style={[
      styles.infoBox,
      { backgroundColor: theme.components.box },
          theme.background.style!=="image"?{
            
        opacity:theme.opacity.light
            }:{}
    ]}
  >
      <AppText style={[ { color: theme.text.primary,fontSize:10 }]} variant="caption">
                        {zodiac ? `${ZODIAC.find(z => z.key === zodiac)?.emoji ?? ""} ${ZODIAC.find(z => z.key === zodiac)?.label ?? zodiac}` : "N/A"}
                      </AppText>
  </View>
  <View
    style={[
      styles.infoBox,
      {minWidth:100,alignItems:'center',justifyContent:'center'},
      { backgroundColor: theme.components.box, },
        { backgroundColor: theme.components.box },
          theme.background.style!=="image"?{
            
        opacity:theme.opacity.light
            }:{}

    ]}
  >
    
    <Icon name="stars" size={18} color={theme.text.accent} />
   <AppText style={[{ color: theme.text.primary,marginLeft:5,fontSize:10}]} variant="caption">
                       {user?.aura}
                     </AppText>
  </View>
  <View
    style={[
      styles.infoBox,
      { backgroundColor: theme.components.box },
    { backgroundColor: theme.components.box },
          theme.background.style!=="image"?{
            
        opacity:theme.opacity.light
            }:{}
    ]}
  >
      <AppText style={[{ color: theme.text.primary,fontSize:10}]} variant="caption">
      Level {user?.level}
    </AppText>
  </View>
</View>

{/* Buttons */}
<View style={styles.buttonRow}>
  {/* Case 1: Neither follows each other → Show "Match Vibe" */}
  {!user.i_follow_them && !user.they_follow_me && (
    <TouchableOpacity
      style={[styles.vibeBtn, { borderColor: theme.text.accent }]}
      onPress={() => {
       followUnfollow()
        // handle match vibe logic
      }}
      disabled={isFollowing}
    >
      <Text style={[styles.vibeText, { color: theme.text.accent }]}>
       {isFollowing?"Matching ..":"Match Vibe"} 
      </Text>
    </TouchableOpacity>
  )}

{user.i_follow_them && !user.they_follow_me && (
    <TouchableOpacity
     disabled={isFollowing}
      style={[styles.vibeBtn, { borderColor: theme.text.accent }]}
      onPress={() => {
        console.log("Match Vibe pressed");
        followUnfollow()
        // handle match vibe logic
      }}
    >
      <Text style={[styles.vibeText, { color: theme.text.accent }]}>
      {isFollowing?"Unmatching ..":"Unmatch Vibe"}
      </Text>
    </TouchableOpacity>
  )}

  {/* Case 2: They follow me, I don't follow them → Show "Vibe Back" */}
  {!user.i_follow_them && user.they_follow_me && (
    <TouchableOpacity
     disabled={isFollowing}

      style={[styles.vibeBtn, { borderColor: theme.text.accent }]}
      onPress={() => {
        console.log("Vibe Back pressed");
        // handle vibe back logic
        followUnfollow()

      }}
    >
      <Text style={[styles.vibeText, { color: theme.text.accent }]}>
      {isFollowing?"Matching ..":"  Vibe Back"}

      
      </Text>
    </TouchableOpacity>
  )}

  {/* Case 3: Connected (both follow each other) → Show "Connections" + Chat Icon */}
  {user.i_follow_them && user.they_follow_me && (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    {/* Connections Button */}
    <TouchableOpacity
      style={[styles.vibeBtn, { borderColor: theme.text.accent, marginRight: 8 }]}
      onPress={() => {followUnfollow()}}
    >
      <Text style={[styles.vibeText, { color: theme.text.accent }]}>
       Remove Connection
      </Text>
    </TouchableOpacity>

    {/* Chat Button */}
    <TouchableOpacity
      style={[styles.vibeBtn, { borderColor: theme.text.accent, paddingHorizontal: 12 }]}
      onPress={() => navigation.navigate("Chat", { userId: user.id })}
    >
      <Icon
        name="chat"
        size={18}
        color={theme.text.accent}
      />
    </TouchableOpacity>
  </View>
)}

</View>
{/* Stats */}
<View
  style={[
    styles.statsContainer,
    { backgroundColor: theme.components.box },
      { backgroundColor: theme.components.box },
          theme.background.style!=="image"?{
            
        opacity:theme.opacity.light
            }:{}
  ]}
>
  <View style={styles.statBox}>
    <AppText style={[ { color: theme.text.primary,fontSize:18 }]} variant="h4">
      450
    </AppText>
    <AppText
      style={[ { color: theme.text.secondary,fontSize:10 }]}
      variant="body"
    >
      PROFILE VIEWS
    </AppText>
  </View>
  <View style={styles.statBox}>
    <AppText style={[ { color: theme.text.primary,fontSize:18 }]} variant="h4">
      120
    </AppText>
    <AppText
      style={[ { color: theme.text.secondary,fontSize:10 }]}
      variant="body"
    >
      GLOBAL RANK
    </AppText>
  </View>
  <View style={styles.statBox}>
  <AppText style={[ { color: theme.text.primary,fontSize:18 }]} variant="h4">
      1
    </AppText>
    <AppText
      style={[ { color: theme.text.secondary,fontSize:10 }]}
      variant="body"
    >
    CAMPUS
    </AppText>
  </View>
</View>
{user?.playlist.length?
<>
<View
style={[
{
opacity: 0.95,
width: "95%",
marginBottom: 20,
alignSelf: "center",
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
},
theme.background.style !== "image"
? {
backgroundColor: theme.background.color,
opacity: theme.opacity.light,
padding: 2,
paddingLeft:8,
borderRadius: 5,
}
: {},
]}
>
<View style={{ flexDirection: "row", alignItems: "center" }}>

<AppText style={{ color: theme.text.primary, fontSize: 14 }} variant="h3">
PLAYLIST
</AppText>
<Ionicons
name="musical-notes-outline"
size={16}
color={theme.text.primary}
style={{ marginLeft: 6 }}
/>
</View>

</View>
<View style={{paddingHorizontal:4}}>
<PlaylistGrid playlist={user?.playlist} 
onStopPlayback={(fn) => (stopPlayerRef.current = fn)} />

</View></>:""}
{/* Achievements Header */}
<View
style={[
{
opacity: 0.95,
width: "95%",
alignSelf: "center",
flexDirection: "row",
alignItems: "center",
},
theme.background.style !== "image"
? {
backgroundColor: theme.background.color,
opacity: theme.opacity.light,
padding: 2,
paddingLeft:8,
borderRadius: 5,
}
: {},
]}
>

<AppText style={{ color: theme.text.primary, fontSize: 14 }} variant="h3">
ACHIEVEMENTS
</AppText>
<Ionicons
name="trophy-outline"
size={16}
color={theme.text.primary}
style={{ marginLeft: 6 }}
/>
</View>

</>
}
data={achievements}
keyExtractor={(item) => item.id}
renderItem={renderAchievement}
contentContainerStyle={styles.scrollContent}
/>
)}
</View>
</ScreenBackground>
);
};

export default OtherProfile;

const styles = StyleSheet.create({
center: {
flex: 1,
justifyContent: "center",
alignItems: "center",
},

errorText: {
fontSize: 16,
marginBottom: 12,
},

retryBtn: {
paddingHorizontal: 22,
paddingVertical: 10,
borderRadius: 12,
},

card: {
padding: 20,
width: "85%",
borderRadius: 16,
alignItems: "center",
},
scrollContent: {
padding: 10,
},
profileSection: {
alignItems: "center",
marginBottom: 20,
},
avatarWrapper: {
position: "relative",
},
crown: {
width: 28,
height: 28,
position: "absolute",
top: -5,
right: -10,
},
username: {
marginTop: 10,
fontSize: 22,
fontWeight: "700",
},
bio: {
marginTop: 8,
fontSize: 14,
textAlign: "center",
paddingHorizontal: 20,
},
infoRow: {
flexDirection: "row",
alignSelf:'center',
justifyContent: "space-around",
marginVertical: 10,
width:'95%',
alignItems:'center',
},
infoBox: {
flexDirection: "row",
borderRadius: 10,
paddingVertical: 6,
paddingHorizontal: 12,
alignItems: "center",
},
infoText: {
fontWeight: "600",
marginLeft: 4,
},
buttonRow: {
flexDirection: "row",
justifyContent: "space-evenly",
marginVertical:10,
},
followBtn: {
paddingVertical: 10,
paddingHorizontal: 30,
borderRadius: 12,
},
followText: {
fontWeight: "700",
},
vibeBtn: {
borderWidth: 1,
paddingVertical: 10,
paddingHorizontal: 20,
borderRadius: 12,
},
vibeText: {
fontWeight: "700",
},
statsContainer: {
flexDirection: "row",
borderRadius: 14,
padding: 15,
justifyContent: "space-between",
marginVertical: 12,
},
statBox: {
alignItems: "center",
flex: 1,
},
statValue: {
fontSize: 20,
fontWeight: "700",
},
statLabel: {
fontSize: 12,
marginTop: 4,
},
achievementTitle: {
fontSize: 18,
fontWeight: "700",
marginTop: 10,
marginLeft: 10,
marginBottom: 10,
},
achievementCard: {
flexDirection: "row",
alignItems: "center",
borderRadius: 12,
padding: 12,
marginBottom: 10,
},
achievementName: {
fontSize: 15,
fontWeight: "700",
},
achievementDesc: {
fontSize: 12,
marginTop: 2,
},
avatarImage: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
avatarWrapper: {
  position: "relative",
},

avatarImage: {
  width: 96,
  height: 96,
  borderRadius: 48,
  marginBottom: 12,
},

moodOverlay: {
  position: "absolute",
  bottom: 10,
  right: 0,
  backgroundColor: "#fff", // optional: a small circle background
  borderRadius: 15,
  width: 30,
  height: 30,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#ddd",
},

moodEmoji: {
  fontSize: 20,
},
});
