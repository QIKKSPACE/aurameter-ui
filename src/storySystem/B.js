import React, { useEffect, useMemo, useRef, useState } from "react";
import {
View,
Image,
StyleSheet,
Dimensions,
TouchableWithoutFeedback,
Animated,
PanResponder,
Text,
ActivityIndicator,
TouchableOpacity,
AppState,
Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from"react-native-vector-icons/FontAwesome5";
import Video from "react-native-video";
import api from "../services/api";
import { deleteStory, updateViewsAndStreak } from "../store/storySlice";
import { removeFromUploadQueue } from "../utils/UploadQueue";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { timeAgo } from "../utils/time";
import * as Animatable from "react-native-animatable";
import { useToast } from "../constants/context/ErrorContext";
import { updateUserField } from "../store/userSlice";
import AppText from "../components/AppText";
import { Blurhash } from "react-native-blurhash";
const { width, height } = Dimensions.get("window");
const STORY_DURATION = 15000; // 15 seconds
const SERVER_URL = "http://localhost:5001"; // replace with your PC IP for device

const FALLBACK_MUSIC = {
id: 1632274446,
title: "Let Me Go",
artist: "Benson Boone",
cover:
"https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/4b/c9/0b/4bc90b5e-98c9-366a-5ae8-6402dd50f774/093624867142.jpg/300x300bb.jpg",
streamUrl:
"https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/b2/a1/08/b2a10875-4ec9-3758-534e-80316d3f2b94/mzaf_2175443726341367671.plus.aac.p.m4a",
};
const StoryViewer = () => {
const navigation = useNavigation();
const route = useRoute();
const dispatch = useDispatch();
const { startUserIndex = 0 } = route.params || {};
const hasSentViewRef = useRef(false);
const insets = useSafeAreaInsets();


// ✅ final usable height
const usableHeight =
  height - insets.top - insets.bottom;
const storiesData = useSelector((state) => state.story.stories || []);
const [userIndex, setUserIndex] = useState(startUserIndex);
const [storyIndex, setStoryIndex] = useState(0);

const currentUserStories = storiesData[userIndex]?.stories || [];
const currentStory = currentUserStories[storyIndex];
const userdata = useSelector((state) => state.user.userData || {});
const currentUserGroup = storiesData[userIndex];

// --- Playback state ---
const [isPlaying, setIsPlaying] = useState(true);
const [imageReady, setImageReady] = useState(false);
const [imageError, setImageError] = useState(false);

const [musicReady, setMusicReady] = useState(false);
const [isBuffering, setIsBuffering] = useState(false);
const [musicDurationMs, setMusicDurationMs] = useState(null);
const [selectedTrack,setSelectedTrack]=useState(false)
// --- Progress/timer ---
const progress = useRef(new Animated.Value(0)).current;
const animRef = useRef(null);
const remainingMsRef = useRef(STORY_DURATION);
const lastProgressValueRef = useRef(0);
  const translateX = useRef(new Animated.Value(0)).current;

// --- Media refs ---
const videoRef = useRef(null);

const story = useMemo(() => {
if (!currentStory) return null;
return  { ...currentStory};
}, [currentStory]);
const hasMusic = !!(story?.music && (story.music.id || story.music.streamUrl));

const imageUrl = useMemo(() => {
  const uri = currentStory?.media_url;
  if (!uri) return null;

  // Local file (Android / iOS)
  if (uri.startsWith("file://")) {
    return uri;
  }

  // Android content provider (legacy / transition)
  if (uri.startsWith("content://")) {
    return uri;
  }

  // Already absolute (defensive)
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }

  // Server relative path
  return `${SERVER_URL}${uri}`;
}, [currentStory?.media_url]);

const blurhash = useMemo(() => {
  const hash = currentStory?.blurhash;

  if (!hash) return null;

  // defensive: ensure it's a non-empty string
  if (typeof hash !== "string") return null;
  if (hash.trim().length === 0) return null;

  return hash;
}, [currentStory?.blurhash]);
// ---------- TIMER HELPERS ----------
const clearAnimation = () => {
if (animRef.current) {
animRef.current.stop();
animRef.current = null;
}
};

const computeRemainingFromProgress = (value) => {
const remaining = Math.max(0, (1 - value) * getStoryDuration());
remainingMsRef.current = remaining;
};

const getStoryDuration = () => {
if (musicDurationMs && hasMusic) {
return Math.min(STORY_DURATION, musicDurationMs);
}
return STORY_DURATION;
};

const startAnimation = () => {
clearAnimation();
const currentValue = lastProgressValueRef.current;
const remaining = Math.max(0, (1 - currentValue) * getStoryDuration());

animRef.current = Animated.timing(progress, {
toValue: 1,
duration: remaining,
useNativeDriver: false,
});

animRef.current.start(({ finished }) => {
if (finished) {
handleNextStory();
}
});
};

const pauseAnimation = () => {
clearAnimation();
progress.stopAnimation((stoppedValue) => {
lastProgressValueRef.current = stoppedValue ?? lastProgressValueRef.current;
computeRemainingFromProgress(lastProgressValueRef.current);
});
};

const resetAnimation = () => {
clearAnimation();
remainingMsRef.current = getStoryDuration();
lastProgressValueRef.current = 0;
progress.setValue(0);
};

useEffect(() => {
const id = progress.addListener(({ value }) => {
lastProgressValueRef.current = value;
});
return () => progress.removeListener(id);
}, [progress]);

// ---------- NAVIGATION ----------
const handleNextStory = () => {
if (storyIndex < currentUserStories.length - 1) {
setStoryIndex((s) => s + 1);
} else {
handleNextUser();
}
};

const handlePrevStory = () => {
if (storyIndex > 0) {
setStoryIndex((s) => s - 1);
} else {
handlePrevUser();
}
};

const handleNextUser = () => {
if (userIndex < storiesData.length - 1) {
let newIndex = userIndex + 1;
while (
newIndex < storiesData.length &&
(!storiesData[newIndex]?.stories || storiesData[newIndex].stories.length === 0)
) {
newIndex++;
}
if (newIndex < storiesData.length) {
setUserIndex(newIndex);
setStoryIndex(0);
} else {
navigation.goBack();
}
} else {
navigation.goBack();
}
};

const handlePrevUser = () => {
if (userIndex > 0) {
let newIndex = userIndex - 1;
while (
newIndex >= 0 &&
(!storiesData[newIndex]?.stories || storiesData[newIndex].stories.length === 0)
) {
newIndex--;
}
if (newIndex >= 0) {
setUserIndex(newIndex);
setStoryIndex(0);
} else {
navigation.goBack();
}
} else {
navigation.goBack();
}
};

const handleTap = (evt) => {
const x = evt.nativeEvent.locationX;
if (x < width / 2) handlePrevStory();
else handleNextStory();
};



const panResponder = useRef(
PanResponder.create({
onMoveShouldSetPanResponderCapture: (_, gestureState) => {
// Disable swipe if Aura Dial is active

if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
return false;
}
return Math.abs(gestureState.dx) > 20; // Only activate for real swipes
},
onStartShouldSetPanResponder: (_, gestureState) => {
return Math.abs(gestureState.dx) > 20; // Only activate swipe gestures
},
onPanResponderMove: (_, gestureState) => {

translateX.setValue(gestureState.dx);



},
onPanResponderRelease: (_, gestureState) => {

if (gestureState.dx > 100) {
handlePrevUser();
} else if (gestureState.dx < -100) {
handleNextUser();
}   
Animated.timing(translateX, {
toValue: 0,
duration: 200,
useNativeDriver: true,
}).start();

},
})
).current;

// ---------- LIFECYCLE ----------
useEffect(() => {
setImageReady(false);
setMusicReady(false);
setIsBuffering(false);
setIsPlaying(true);
setMusicDurationMs(null);
resetAnimation();
}, [storyIndex, userIndex]);

const readyToStart = !hasMusic ? imageReady : imageReady && musicReady && !isBuffering;

useEffect(() => {
if (!currentStory) return;

if (!isPlaying) {
pauseAnimation();
return;
}

if (readyToStart) {
startAnimation();
} else {
pauseAnimation();
}
}, [readyToStart, isPlaying, currentStory]);

useEffect(() => {
const sub = AppState.addEventListener("change", (state) => {
if (state !== "active") {
setIsPlaying(false);
}
});
return () => sub.remove();
}, []);

useFocusEffect(
React.useCallback(() => {
return () => {
setIsPlaying(false);
};
}, [])
);

useEffect(() => {
return () => {
clearAnimation();
try {
if (videoRef.current) {
videoRef.current.seek(0);
}
} catch {}
};
}, []);
const sendStoryView = async (storyId) => {
if (!storyId || currentStory?.userId==userdata.id) return;
//Here i want to check if currentStory.hasViewedStreak
if(!currentUserGroup.is_streak_active)
{
dispatch(updateViewsAndStreak({ user_id:currentUserGroup.user_id }));
try {
await api.post("/story/storyView", {
storyId,storyCreator:currentUserGroup.user_id
});
console.log("Story view sent for", storyId);
} catch (err) {
console.error("Failed to send story view", err);
}
}
else
{
try {
await api.post("/story/storyView", {
storyId,storyCreator:currentUserGroup.user_id
});
console.log("Story view sent for", storyId);
} catch (err) {
console.error("Failed to send story view", err);
}
}

};
useEffect(() => {
if (!currentStory?.story_id  ) return;

// Only send once per story
if (!readyToStart || hasSentViewRef.current) return;

const timer = setTimeout(() => {
sendStoryView(currentStory.story_id);
hasSentViewRef.current = true; // mark as sent
}, 3000);



return () => clearTimeout(timer);
}, [currentStory, readyToStart]);


useEffect(() => {
hasSentViewRef.current = false; // reset for new story
}, [storyIndex, userIndex]);


const {showToast}=useToast()

const deleteStoryFn = (storyId) => {
   setIsPlaying(false)
  Alert.alert(
    "Delete Story",
    "Are you sure you want to delete this story?",
    [
      {
        text: "Cancel",
        style: "cancel",
        onPress:async()=>{
   setIsPlaying(true)

        }
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
              dispatch(deleteStory({ storyId }));
              removeFromUploadQueue(storyId);
              navigation.goBack();

            const res = await api.delete(`/story/delete/${storyId}`);

            if (res?.data?.success) {
              dispatch(updateUserField({ field: "aura", value: userdata.aura-story.geminiaura }));
              
              
              showToast("Story was deleted successfully!", "success");
            } else {
              showToast("Failed to delete story!", "error");
            }
          } catch (error) {
            console.error("Delete story error:", error);
            showToast("Failed to delete story!", "error");
          }
        },
      },
    ],
    { cancelable: true }
  );
};

// ---------- RENDER ----------
if (!currentStory) {
return (
<View style={styles.loader}>
<ActivityIndicator size="large" color="white" />
<AppText variant="h4" style={{ color: "white", marginTop: 10 }}>Loading stories...</AppText>
</View>
);
}

const musicTitle =
story?.music?.title && story?.music?.artist
? `🎵 ${story.music.title} — ${story.music.artist}`
: "🎵 Audio";

const progressWidth = progress.interpolate({
inputRange: [0, 1],
outputRange: ["0%", "100%"],
});

const isSending = currentStory?.isSending;
const isFailed = currentStory?.isFailed;

return (
<View style={styles.container} {...panResponder.panHandlers}>
{/* Progress bars */}
<View style={styles.progressBarContainer}>
{currentUserStories.map((_, i) => (
<View key={i} style={styles.track}>
<Animated.View
style={[
styles.bar,
{ width: i === storyIndex ? progressWidth : i < storyIndex ? "100%" : "0%" },
]}
/>
</View>
))}
</View>

{/* Top bar */}
<View style={styles.topBar}>
  <View style={{flexDirection:'row',alignItems:'center',marginTop:2,width:'80%'}}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight:10}}>
<Icon name="x" size={26} color="#fff" />
</TouchableOpacity>
    <View style={styles.userInfo} >
<Image source={{ uri:`${currentUserGroup?.avatar}` }} style={styles.userAvatar} />
<View style={{justifyContent:'center'}}>
  <View style={{flexDirection:'row',justifyContent:'space-evenly',flex:1,alignItems:'center'}}>
<AppText style={styles.userName} variant="h4">{currentUserGroup?.username}</AppText>
{(currentStory?.created_at || currentStory?.timestamp)?<AppText style={styles.timestamp} variant="h4">
{timeAgo(currentStory?.created_at??currentStory?.timestamp)}
</AppText>:<Text style={styles.timestamp}>Just Now</Text>}

  </View>
{!currentStory?.location?
  <Text style={{color:'white',fontSize:10,marginLeft: 10,marginVertical:2,maxWidth:150}}>
    {currentStory?.location}</Text>
:null}


</View>

</View>
  </View>

<View style={styles.topActions}>

 {currentUserGroup.user_id===userdata.id?
 <TouchableOpacity style={styles.iconBtn} onPress={()=>{
const storyId = currentStory.story_id || currentStory.storyId;
  deleteStoryFn(storyId)
}}>
<MaterialIcon name="delete" size={26} color="#fff" />
</TouchableOpacity>
:
<View style={{flexDirection:'column',alignItems:'center',justifyContent:'space-between'}}>
  <TouchableOpacity style={styles.iconBtn} onPress={()=>{
const storyId = currentStory.story_id || currentStory.storyId;


}}>
<FontAwesome5 name="ellipsis-v" size={26} color="#fff" />
</TouchableOpacity>

  </View>
 }

</View>
</View>

{/* Story Image */}
<View style={{ flex: 1 }}>
{/* Left 50 px tap zone */}
<TouchableWithoutFeedback onPress={handlePrevStory}>
<View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 50,zIndex:10 }} />
</TouchableWithoutFeedback>

{/* Right 50 px tap zone */}
<TouchableWithoutFeedback onPress={handleNextStory}>
<View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 50,zIndex:10 }} />
</TouchableWithoutFeedback>

{/* The actual story image */}
<View style={{ flex: 1 }}>
<Image
source={{ uri: imageUrl }}
style={styles.image}
resizeMode="contain"
onLoadEnd={() => {
setImageReady(true);
setImageError(false)
console.log("Image loaded");
}}
onError={() => {setImageReady(true);setImageError(true)}}
/>

{!imageReady || imageError && (
  blurhash ? (
    <Blurhash
      blurhash={blurhash}
      style={StyleSheet.absoluteFill}
      decodeWidth={16}
      decodeHeight={16}
      decodePunch={1}
    />
  ) : (
    <ActivityIndicator
      size="small"
      style={StyleSheet.absoluteFill}
    />
  )
)}

</View>
</View>

{/* Uploading indicator */}
{isSending && (
<View style={styles.overlayCenter}>
<ActivityIndicator size="large" color="#fff" />
<Text style={styles.overlayText}>Uploading...</Text>
</View>
)}

{/* Upload failed */}
{isFailed && (
<View style={styles.overlayCenter}>
<Text style={[styles.overlayText, { color: "red" }]}>Upload Failed</Text>
<TouchableOpacity
style={styles.retryBtn}
onPress={() => {
// 🔹 trigger retry via redux (dispatch action)
console.log("Retry upload", currentStory?.tempId);
}}
>
<Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
</TouchableOpacity>
</View>
)}

{/* Hidden audio */}
{hasMusic && (
  <Video
    key={story.story_id} // 🔥 FORCE REMOUNT for each story
    ref={videoRef}
    source={{ uri: story.music.streamUrl }}
    audioOnly
    paused={!isPlaying || !readyToStart} // ✅ play only when ready and not paused
    playInBackground={false}
    playWhenInactive={false}
    ignoreSilentSwitch="ignore"
    onLoad={(meta) => {
      // ✅ mark music as ready when loaded
      setMusicReady(true);
      if (meta?.duration) {
        setMusicDurationMs(meta.duration * 1000);
      }
    }}
    onBuffer={({ isBuffering }) => setIsBuffering(isBuffering)}
    onError={(err) => {
      console.error("Video error:", err);
      setMusicReady(true); // prevent blocked state
      setIsBuffering(false);
    }}
    style={{ width: 0, height: 0 }} // hidden
  />
)}

{/* Bottom Actions */}
{(!isSending && !isFailed) && (
<View style={styles.bottomActions}>
<View style={{marginBottom:100,marginRight:5}}>
  <TouchableOpacity  style={[styles.actionBtn,{marginTop:20}]}>
<Image
source={ require('../assets/aura_chat.png')
}
style={{width:40,height:40,borderRadius:20}}
resizeMode="contain"
/>
<Text style={styles.actionLabel}>Aura AI</Text>
</TouchableOpacity>
<TouchableOpacity  style={[styles.actionBtn,{marginTop:20}]}>
<Image
source={require("../assets/newframe.png")}
style={{width:40,height:40,borderRadius:20}}
resizeMode="contain"
/>
<Text style={styles.actionLabel}>Aura</Text>
</TouchableOpacity>

<TouchableOpacity style={[styles.actionBtn,{marginTop:20}]}>
<Icon name="message-circle" size={26} color="#fff" />
<Text style={styles.actionLabel}>Reply</Text>
</TouchableOpacity>
      {hasMusic ? (
        <TouchableOpacity style={[styles.actionBtn,{marginTop:20}]} onPress={()=>{
          setSelectedTrack(!selectedTrack)
         // setIsPlaying(false)
         }
          }>

        <Image
source={{uri:story.music?.cover}}
style={{width:40,height:40,borderRadius:20}}
resizeMode="contain"
/>
        </TouchableOpacity>

       
      ) : null}
</View>
</View>
)}



{/* Music mini-player */}
 {selectedTrack && (
          <Animatable.View animation="fadeInUp" style={styles.musicPreview}>
            <TouchableOpacity  style={styles.musicPreviewContent} onPress={()=>{
           
              setSelectedTrack(false)
            }}>
              <Image source={{ uri: story.music?.cover }} style={styles.musicPreviewImage} />
              <View style={styles.musicPreviewText}>
                <Text style={styles.musicPreviewTitle}>{story.music?.title}</Text>
                <Text style={styles.musicPreviewArtist}>{story.music?.artist}</Text>
              </View>
              <TouchableOpacity onPress={()=>{
              setIsPlaying(!isPlaying)
             
            }}>
              <Icon name={isPlaying ? "pause-circle" : "play-circle"} size={32} color="#fff" />

              </TouchableOpacity>
            </TouchableOpacity>

          </Animatable.View>
        )}

</View>
);
};

const { width: scrW, height: scrH } = Dimensions.get("window");

const styles = StyleSheet.create({
  userInfo: { flexDirection: "row", alignItems: "center",justifyContent:'space-around' },
userAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#FFF" },
userName: { color: "#FFF", fontSize: 14, marginLeft: 10 },
timestamp: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginLeft:10,marginTop:4},
container: {
flex: 1,
backgroundColor: "black",
justifyContent: "center",
alignItems: "center",
},
loader: {
flex: 1,
backgroundColor: "black",
justifyContent: "center",
alignItems: "center",
},
image: { width: scrW, height: scrH },
progressBarContainer: {
position: "absolute",
top: 5,
flexDirection: "row",
justifyContent: "space-between",
width: "98%",
height: 4,
alignSelf: "center",
zIndex: 10,
},
track: {
flex: 1,
height: 4,
backgroundColor: "rgba(255,255,255,0.3)",
marginHorizontal: 2,
borderRadius: 2,
overflow: "hidden",
},
bar: { height: 4, backgroundColor: "white", borderRadius: 2 },
topBar: {
position: "absolute",
top: 20,
left: 0,
right: 0,
flexDirection: "row",
justifyContent: "space-between",

paddingHorizontal: 16,
zIndex: 999,
},
topActions: { flexDirection: "row", gap: 12 },
iconBtn: {
backgroundColor: "rgba(0,0,0,0.5)",
padding: 6,
borderRadius: 30,
},
bottomActions: {
position: "absolute",
bottom: 0,
right:0,
flexDirection: "column",
justifyContent: "space-around",
alignItems: "center",
paddingHorizontal: 10,
zIndex: 20,
},
actionBtn: { alignItems: "center" },
actionLabel: { marginTop: 4, fontSize: 12, color: "#fff", fontWeight: "600" },
auraIcon: { width: 28, height: 28 },
musicPlayer: {
position: "absolute",
bottom: 100,
left: 20,
right: 20,
padding: 10,
borderRadius: 12,
backgroundColor: "rgba(0,0,0,0.5)",
flexDirection: "row",
justifyContent: "space-between",
alignItems: "center",
},
musicText: { color: "#fff", fontSize: 13, flex: 1, marginRight: 10 },
iconImage: { width: 30, height: 30 },
overlayCenter: {
position: "absolute",
top: "45%",
alignSelf: "center",
justifyContent: "center",
alignItems: "center",
padding: 16,
backgroundColor: "rgba(0,0,0,0.6)",
borderRadius: 12,
},
overlayText: { color: "#fff", marginTop: 8, fontSize: 14 },
retryBtn: {
marginTop: 10,
paddingHorizontal: 16,
paddingVertical: 8,
backgroundColor: "red",
borderRadius: 6,
},
  musicItem: { flexDirection: "row", alignItems: "center",
     marginVertical: 6, backgroundColor: "#444", padding: 10, borderRadius: 10 },
  musicImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: "#666" },
  musicTitle: { fontSize: 14, fontWeight: "bold" },
  musicArtist: { color: "#ccc", fontSize: 14 },
  musicPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 12,
    position: "absolute",
    bottom: 150,
    width: "75%",
    left:10,
    justifyContent: "space-between",
  },
  musicPreviewContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  musicPreviewImage: { width: 50, height: 50, borderRadius: 8 },
  musicPreviewText: { flex: 1, marginLeft: 10 },
  musicPreviewTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  musicPreviewArtist: { color: "#ccc", fontSize: 14 },
  closeButton: { position: "absolute", right: 10, top: 10, zIndex: 1, padding: 6 },
});

export default StoryViewer;
