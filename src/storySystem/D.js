import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get("window");
import { Blurhash } from "react-native-blurhash";
import StoryStatusOVerlay from '../components/StoryStatusOverlay'

const StoryViewer = () => {
  const navigation = useNavigation();
const route = useRoute();
const dispatch = useDispatch();
const { startUserIndex = 0 } = route.params || {};
const hasSentViewRef = useRef(false);
const insets = useSafeAreaInsets();
const [imageReady, setImageReady] = useState(false);
const [imageError, setImageError] = useState(false);

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

const status = useMemo(() => {
  const status = currentStory?.status;

  if (!status) return null;

  // defensive: ensure it's a non-empty string
  if (typeof status !== "string") return null;
  if (status.trim().length === 0) return null;

  return status;
}, [currentStory?.status]);
  return (
    <View style={styles.container}>
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
<StoryStatusOVerlay  status={status}
  onRetry={()=>{}}
  onDelete={()=>{}}/>
    </View>
  )
}



const { width: scrW, height: scrH } = Dimensions.get("window");

const styles = StyleSheet.create({
 
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

});

export default StoryViewer;
