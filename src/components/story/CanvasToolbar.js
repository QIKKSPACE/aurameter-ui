import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
  Dimensions,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Animatable from "react-native-animatable";
import Video from "react-native-video";
import { exportStoryWithSkia } from "../../hooks/useExportStoryToImage"; // adjust path
import AppText from "../AppText";

const ICON_SIZE = 36;
const PREVIEW_WIDTH = 240;
const SCREEN_WIDTH = Dimensions.get("window").width;
//dispatch(removeLayer(editingTextLayerId));
export default function CanvasToolbar({
  onPickImage,
  onAddText,
  onAddMusic,
  activeLayer,
  onBringToFront, 
  selectedTrack,
  onRemoveTrack,
  onOpenStickerSheet,
  onDelete,
  sortedLayers,
     editorWidth,
    editorHeight,
    onAddLocation,location,onAddTag,
    handlePreparePost,
    editorScale
}) {
  const navigation = useNavigation();
  const playerRef = useRef(null);
  const musicIconRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showMusicPreview, setShowMusicPreview] = useState(false);
  const [musicIconLayout, setMusicIconLayout] = useState(null);
  const [downlaoding,setIsDownloading]=useState(false)
  const togglePlay = () => setIsPlaying((p) => !p);
useEffect(() => {
  if (!selectedTrack) return;
  setShowMusicPreview(true);
}, [selectedTrack]);


  const openPreview = () => {
    musicIconRef.current?.measureInWindow((x, y, width, height) => {
      setMusicIconLayout({ x, y, width, height });
      setShowMusicPreview(!showMusicPreview);
    });
  };

  const closePreview = () => {
    setShowMusicPreview(false);
    setIsPlaying(false);
  };
const handleDownload = async () => {
  if (!sortedLayers) {
    console.warn("No story layers to export");
    return;
  }
  setIsDownloading(true)
  try {
    // activeLayer.storyLayers should be your story.layers array
    const uri = await exportStoryWithSkia(sortedLayers,editorHeight,editorWidth,editorScale);
    console.log("Saved story image:", uri);
  setIsDownloading(false)

  } catch (e) {
  setIsDownloading(false)

    console.error("Export failed", e);
  }
};


  return (
    <View style={styles.container} pointerEvents="box-none"> 
      {/* BACK */}
      <View  style={styles.backButton}>
        <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
 <TouchableOpacity
       
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={28} color="#fff" />
      </TouchableOpacity>
    
        </View>
         
     <TouchableOpacity style={[styles.toolButton,{backgroundColor:"#013647",borderRadius:10,marginVertical:12}]} 
     onPress={()=>{handlePreparePost(sortedLayers,editorWidth,editorHeight)}}>
   <AppText variant="caption" style={{color:'white'}}>Send Story</AppText>
</TouchableOpacity>
       
      </View>
    

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "flex-end",
    paddingTop: 40,
    paddingRight: 12,
  },

  backButton: {
    position: "absolute",
    top: 0,
    paddingHorizontal:10,
    zIndex: 10,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    width:'100%'
  
  },

  toolContainer: {
    alignItems: "center",
    paddingVertical: 20,
    zIndex:1200,marginTop:20
  },

  toolButton: {
    marginVertical: 6,
    padding: 8,
  },

  musicIconWrapper: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginVertical: 12,
    borderRadius: 8,
    overflow: "hidden",
  },

  musicIconImage: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 8,
  },

  musicPreviewWrapper: {
    position: "absolute",
    width: PREVIEW_WIDTH,
    zIndex: 3000,
  },

  musicPreview: {
    height: ICON_SIZE+6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.95)",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical:5
  },

  previewCover: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 10,
  },

  musicPreviewInfo: {
    flex: 1,
    marginRight: 8,
  },

  musicPreviewTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  musicPreviewArtist: {
    color: "#aaa",
    fontSize: 11,
  },
});
