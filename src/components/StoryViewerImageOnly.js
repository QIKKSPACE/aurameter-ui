import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Text, Image, TouchableOpacity, BackHandler, Alert } from "react-native";
import Animated, { runOnJS, useAnimatedReaction } from "react-native-reanimated";
import { Blurhash } from "react-native-blurhash";

import { useStorySession } from "../storyviewer/useStorySession";
import { useStoryPlayer } from "../storyviewer/useStoryPlayer";
import { StoryProgressSegments } from "./StoryProgressSegments";
import { useDispatch, useSelector } from "react-redux";
import StoryTopBar from './StoryTopBar'
import MusicPreview from './MusicPreview'
import AuraCommentModal from './AuraCommentModal'
import StoryLayersRenderer from './StoryLayersRenderer'
import QuizRenderComponent from './StoryLayerQuiz'



import AuraDialModal from "./AuraDialModal";
import StoryTopCommentsPreview from "./StoryTopCommentsPreview";

import StoryStatusOverlay from './StoryStatusOverlay'

import ReplyBottomSheet from './ReplyBottomSheet'

import { timeAgo } from "../utils/time";
import Video from "react-native-video";
import Icon from "react-native-vector-icons/Feather";
import * as Animatable from "react-native-animatable";
import api from "../services/api";
import { markUploadAccepted } from "../utils/UploadQueue";
import { deleteStory, markSingleStoryAsSeen } from "../store/storySlice";
import { updateUserField } from "../store/userSlice";
import { useToast } from "../constants/context/ErrorContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { makeSelectCommentsByStoryId, makeSelectCommentsWithMeta } from "../store/commentSelector";
import { fetchCommentsByStoryId } from "../store/commentSlice";

const PROGRESS_THRESHOLD = 0.3; // 30%
export default function StoryViewerImageOnly({ users,onComplete,startUserIndex,startStoryIndex }) {
  const navigation=useNavigation()
  const [finished, setFinished] = useState(false);
const userdata = useSelector((state) => state.user.userData || {});
const [selectedTrack,setSelectedTrack]=useState(false)
const [activeOverlay, setActiveOverlay] = useState(null);
// "reply" | "auraAi" | "auraDial" | null
 const dispatch=useDispatch()
 
useEffect(() => {
  //
  const backAction = () => {
    // If reply overlay is open, close it instead of exiting
    if (activeOverlay === "reply" || activeOverlay === "auraDial" || activeOverlay ==="auraAi") {
      closeOverlay();
      return true; // prevent default back action
    }

 
    // Otherwise, let default back action happen
    return false;
  };

  const subscription = BackHandler.addEventListener(
    "hardwareBackPress",
    backAction
  );

  return () => subscription.remove(); // clean up on unmount
}, [activeOverlay, selectedTrack]);
  /* ---------------- SESSION ---------------- */
  const {
    activeUser,
    activeStory,
    storyIndex,
    storyCount,
    nextStory,
    prevStory,
} = useStorySession({
  users,
  startUserIndex,      // 👈 integrate
  startStoryIndex, // 👈 integrate (can be null)
  onComplete: () => setFinished(true),
});
useEffect(() => {
  if (finished) {
    onComplete?.();
  }
}, [finished]);

  /* ---------------- MEDIA STATE ---------------- */
  const [imageLoaded, setImageLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
const [audioBuffering, setAudioBuffering] = useState(false);
const pausedByBlurRef = useRef(false);

const hasAudio = !!activeStory?.music?.streamUrl;
  /* Reset per story */
useEffect(() => {
   pausedByBlurRef.current = false;
  setImageLoaded(false);
  setPaused(false);
  setAudioReady(false);
  setAudioBuffering(false);
  setSelectedTrack(false)
 
}, [activeStory?.story_id]);

useFocusEffect(
  useCallback(() => {
      pausedByBlurRef.current = false;

      setPaused(false);

    return () => {
      setPaused(true);
      pausedByBlurRef.current = true;

    };
  }, [])
);

  /* ---------------- PROGRESS ---------------- */
const canPlay =
  imageLoaded &&
  !paused &&
  (!hasAudio || (audioReady && !audioBuffering));

  const { progress, reset } = useStoryPlayer({
    durationMs: hasAudio?30000:10000,
    canPlay,
    onEnd: nextStory,
  });
useEffect(() => {
  if (!pausedByBlurRef.current) return;
  if (!imageLoaded) return;
  if (hasAudio && (!audioReady || audioBuffering)) return;

  pausedByBlurRef.current = false;
  setPaused(false);
}, [imageLoaded, audioReady, audioBuffering]);
const SEEN_AFTER_MS = 3000;

const storyDurationMs = hasAudio ? 30000 : 10000;
const seenThreshold = SEEN_AFTER_MS / storyDurationMs;
 const hasMarkedSeenRef = useRef(false);

const markSeen = async() => {
  if (hasMarkedSeenRef.current) return;
  hasMarkedSeenRef.current = true;

  if (!activeStory.seen && activeStory?.status=="sent") {
    
    dispatch(
      markSingleStoryAsSeen({
        user_id: activeUser.user_id,
        local_id: activeStory.local_id,
      })
    );
    try {
    await api.post("/story/storyView", {
storyId:activeStory?.story_id,storyCreator:activeUser?.user_id
});
    } catch (error) {
       console.log(error)
    }
  }
};
const selectComments = useMemo(makeSelectCommentsWithMeta, []);

const { comments, isLoading, isError } = useSelector(state =>
  selectComments(state, activeStory?.story_id)
);
 
  
  useEffect(()=>{
   // if(stor)
   if(isLoading || comments.length || activeStory?.status!=="sent") return
  dispatch(fetchCommentsByStoryId(activeStory?.story_id))
  },[activeStory?.story_id])

useEffect(() => {

  hasMarkedSeenRef.current = false;
}, [activeStory?.local_id]);
const seenThresholdRef = useRef(seenThreshold);
useAnimatedReaction(
  () => progress.value,
  (curr, prev) => {
    const threshold = seenThresholdRef.current;

    if (curr >= threshold && prev < threshold) {
      runOnJS(markSeen)();
    }
  }
);
  /* Reset progress on story change */
  useEffect(() => {
    reset();
  }, [activeStory?.story_id, reset]);

  /* ---------------- EMPTY ---------------- */
  if (!activeStory) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white" }}>No stories</Text>
      </View>
    );
  }

  const openOverlay = (type) => {
    pausedByBlurRef.current = false;
  setPaused(true);
  setActiveOverlay(type);
};

const closeOverlay = () => {
  setActiveOverlay(null);
  setPaused(false);
};

const {showToast}=useToast()
const deleteStoryFn = async(storyId,status) => {
  try {
    pausedByBlurRef.current = false;
      setPaused(true)  
      if(status=="ACCEPTED")
      {
        Alert.alert(
    "Delete Story",
    "Are you sure you want to delete this story?",
    [
      {  
        text: "Cancel",
        style: "cancel",
        onPress:async()=>{
   setPaused(false)

        }
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
               showToast("Deleting Story Please Wait!", "success");
              navigation.goBack();

            const res = await api.delete(`/story/delete/${storyId}`);

            if (res?.data?.success) {
              if(activeStory?.geminiaura)
              {
              dispatch(updateUserField({ field: "aura", value: userdata.aura-activeStory?.geminiaura }));

              }
              await markUploadAccepted (storyId);

                dispatch(deleteStory({ local_id:storyId }));
              
              showToast("Story was deleted successfully!", "success");
            }
              else
              {
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
      }
      else
      {
 try {
               showToast("Deleting Story Please Wait!", "success");
              navigation.goBack();

            const res = await api.delete(`/story/delete/${storyId}`);
            if (res?.data?.success) {
              if(activeStory?.geminiaura)
              {
              dispatch(updateUserField({ field: "aura", value: userdata.aura-activeStory?.geminiaura }));

              }
              await markUploadAccepted (storyId);

                dispatch(deleteStory({local_id: storyId }));
              
              showToast("Story was deleted successfully!", "success");
            } 
  
              else {
              showToast("Failed to delete story!", "error");
            }
          } catch (error) {
            console.error("Delete story error:", error);
            showToast("Failed to delete story!", "error");
          }
      }
  } catch (error) {
    
  }


}
  /* ---------------- UI ---------------- */
  return (
<View style={styles.container}>
  <StoryTopBar
    user={activeUser}
    story={activeStory}
    isOwnStory={activeUser?.user_id === userdata?.id}
    onClose={() => setFinished(true)}
    timeAgo={timeAgo(activeStory.created_at)}
    onDelete={()=>deleteStoryFn(activeStory?.local_id,activeStory?.status)}
  />

  <StoryProgressSegments
    count={storyCount}
    activeIndex={storyIndex}
    progress={progress}
  />

  <Animated.Image
    source={{ uri: activeStory.media_url }}
    style={styles.image}
    resizeMode="contain"
    onLoad={() => setImageLoaded(true)}
  />

  {!imageLoaded && activeStory.blurhash && (
    <Blurhash
      blurhash={activeStory.blurhash}
      style={StyleSheet.absoluteFill}
    />
  )}


<StoryStatusOverlay 
local_id={activeStory?.local_id}
status={activeStory?.status ?? "ACCEPTED"}
aiRejectResponse={activeStory?.ai_rejected_response?? null}
 onDelete={(local_id,status) => deleteStoryFn(local_id,status)}
/>
<View style={styles.topCommentsWrapper} pointerEvents="none">
  <StoryTopCommentsPreview storyId={activeStory?.story_id} />
</View>

 {/* PAUSE LAYER (FULL SCREEN) */}
  <Pressable
    style={StyleSheet.absoluteFill}
    onPressIn={() =>{
      pausedByBlurRef.current = false;
       setPaused(true)
    }}
    onPressOut={() => setPaused(false)}
  >
    <View style={{ flex: 1 }} />
  </Pressable>

  {/* NAVIGATION LAYER */}
  <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
    <Pressable style={styles.leftTap} onPress={prevStory} />
    <Pressable style={styles.rightTap} onPress={nextStory} />
  </View>
  {hasAudio && (
  <Video
    key={activeStory.story_id}
    source={{ uri: activeStory.music.streamUrl }}
    audioOnly
    paused={!canPlay}
    onLoad={() => setAudioReady(true)}
    onBuffer={({ isBuffering }) => setAudioBuffering(isBuffering)}
    onError={() => {
      setAudioReady(true);
      setAudioBuffering(false);
    }}
    style={{ width: 0, height: 0 }}
  />
)}

{activeStory?.status=="ACCEPTED"?
<View style={styles.bottomActions}>
<View style={{marginBottom:50,marginRight:5}}>
  <TouchableOpacity  style={[styles.actionBtn,{marginTop:20}]}
    onPress={() => openOverlay("auraComment")}>
    
<Image
source={ require('../assets/aura_chat.png')
}
style={{width:40,height:40,borderRadius:20}}
resizeMode="contain"
/>
<Text style={styles.actionLabel}>Aura AI</Text>
</TouchableOpacity>
<TouchableOpacity
  style={[styles.actionBtn, { marginTop: 20 }]}
  onPress={() => openOverlay("auraDial")}
>
<Image
source={require("../assets/newframe.png")}
style={{width:40,height:40,borderRadius:20}}
resizeMode="contain"
/>
<Text style={styles.actionLabel}>Aura</Text>
</TouchableOpacity>

<TouchableOpacity style={[styles.actionBtn,{marginTop:20}]}   onPress={() => openOverlay("reply")}>
<Icon name="message-circle" size={26} color="#fff" />
<Text style={styles.actionLabel}>Reply</Text>
</TouchableOpacity>
      {hasAudio ? (
        <TouchableOpacity style={[styles.actionBtn,{marginTop:20}]} onPress={()=>{
          setSelectedTrack(!selectedTrack)
         // setIsPlaying(false)
         }
          }>

        <Image
source={{uri:activeStory.music?.cover}}
style={{width:40,height:40,borderRadius:20}}
resizeMode="contain"
/>
        </TouchableOpacity>

       
      ) : null}
     
</View>
</View>
:""}
{hasAudio && (
  <MusicPreview
    story={activeStory}
    paused={paused}
    visible={selectedTrack}
    onClose={() => setSelectedTrack(false)}
    onTogglePause={() => {
      pausedByBlurRef.current = false;
      setPaused(!paused)
    }}
  />
)}
<ReplyBottomSheet
  visible={activeOverlay === "reply"}
  story={activeStory}
  onClose={closeOverlay}

/>
<AuraCommentModal
  visible={activeOverlay === "auraComment"}
  onClose={() => closeOverlay()}
  story={activeStory}
  user={userdata}
/>
<AuraDialModal
  visible={activeOverlay === "auraDial"}
  onClose={closeOverlay}
  onSend={(value) => {
    // SEND AURA HERE
    console.log("Aura sent:", value);

    // example payload
    // dispatch(sendAura({
    //   to_user_id: activeUser.user_id,
    //   story_id: activeStory.story_id,
    //   value
    // }));

    closeOverlay();
  }}
  onConfirmNegative={(value) => {
    // optional: custom confirm UI
    console.log("Confirm negative aura:", value);
  }}
/>
{activeStory?.layers?.length > 0 &&
  activeStory.layers.map((item, index) => {
    return (
      <View key={item.id || index} >
       {item?.type=="link"?
  <StoryLayersRenderer layers={[item]} />
       :
       <View style={{}}>
        <QuizRenderComponent quiz={item} onLongPress={()=>{
          //setPaused(!paused);
         
          navigation.navigate('PlayQuiz',{quizId:item?.data?.quizId})
          }}/>
        </View>} 
      </View>
    );
  })}

</View>
  );
}

/* ---------------- STYLES ---------------- */
const TAP_WIDTH = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  image: {
    ...StyleSheet.absoluteFillObject,
  },

  leftTap: {
    position: "absolute",
    left: 0,
    top: 0,
    width: TAP_WIDTH,
    height: "100%",
    zIndex: 10,
  },

  rightTap: {
    position: "absolute",
    right: 0,
    top: 0,
    width: TAP_WIDTH,
    height: "100%",
    zIndex: 10,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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

topCommentsWrapper: {
  position: "absolute",
  left: 0,
  bottom: 40,
  maxWidth: "70%",   // prevents covering too much of the story
  zIndex: 15,        // above media, below modals
},
});