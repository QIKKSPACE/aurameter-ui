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
      <Text style={{color:'white',fontSize:16,marginLeft:10}}>Send Story</Text>
        </View>
         
     <TouchableOpacity style={[styles.toolButton,{backgroundColor:"#013647",borderRadius:10,marginVertical:12}]} 
     onPress={()=>{handlePreparePost(sortedLayers,editorWidth,editorHeight)}}>
   <AppText variant="caption" style={{color:'white'}}>Aura + +</AppText>
</TouchableOpacity>
       
      </View>
    

      {/* TOOLBAR */}
      <View style={styles.toolContainer}>
        <TouchableOpacity style={styles.toolButton} onPress={onPickImage}>
          <Icon name="image-outline" size={28} color="#fff" />
        </TouchableOpacity>

        {selectedTrack ? (
          <TouchableOpacity
            ref={musicIconRef}
            style={styles.musicIconWrapper}
            onPress={()=>{openPreview();
              togglePlay()}}
          >
            <Image
              source={{ uri: selectedTrack.cover }}
              style={styles.musicIconImage}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.toolButton} onPress={onAddMusic}>
            <Icon name="music" size={28} color="#fff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.toolButton} onPress={onAddText}>
          <Icon name="format-text" size={28} color="#fff" />
        </TouchableOpacity>

        
 {location?<TouchableOpacity style={styles.toolButton}  onPress={onAddLocation}>
  <Icon name="earth" size={28} color="white" />
</TouchableOpacity>: <TouchableOpacity style={styles.toolButton}  onPress={onAddLocation}>
          <Icon name="map-marker-outline" size={28} color="white" />
        </TouchableOpacity>}
       

        

        <TouchableOpacity style={styles.toolButton} onPress={onOpenStickerSheet}>
          <Icon name="sticker-emoji" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton}  onPress={onAddTag}>
          <Icon name="account-multiple-outline" size={28} color="white" />
        </TouchableOpacity>
       {downlaoding?"":<TouchableOpacity style={styles.toolButton} onPress={()=>{handleDownload()}}>
<Icon name="download" size={28} color="#fff" />
</TouchableOpacity>
}

      <TouchableOpacity style={styles.toolButton} onPress={onBringToFront}>
            <Icon name="arrow-up-bold-box-outline" size={28} color="#fff" />
          </TouchableOpacity>
         {activeLayer && ( 
          <TouchableOpacity style={styles.toolButton} onPress={onDelete}>
            <Icon name="delete" size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
     
      {/* OVERLAY CLICK TO DISMISS */}
      {showMusicPreview && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closePreview}
        />
      )}

      {/* MUSIC PREVIEW */}
      {showMusicPreview && selectedTrack && musicIconLayout && (
        <Animatable.View
          animation="fadeInLeft"
          duration={200}
          style={[
            styles.musicPreviewWrapper,
            {
              top:
                musicIconLayout.y +
                musicIconLayout.height / 2 -
                ICON_SIZE / 2,
              right:
                SCREEN_WIDTH -
                musicIconLayout.x +
                10,
            },
          ]}
        >
          <View style={styles.musicPreview}>
            <TouchableOpacity  onPress={onAddMusic}>
<Image
              source={{ uri: selectedTrack.cover }}
              style={styles.previewCover}
             
            />
            </TouchableOpacity>
            

            <View style={styles.musicPreviewInfo}>
              <Text
                style={styles.musicPreviewTitle}
                numberOfLines={1}
              >
                {selectedTrack.title}
              </Text>
              <Text
                style={styles.musicPreviewArtist}
                numberOfLines={1}
              >
                {selectedTrack.artist}
              </Text>
            </View>

            <TouchableOpacity onPress={togglePlay}>
              <Icon
                name={isPlaying ? "pause-circle" : "play-circle"}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                closePreview();
                onRemoveTrack?.();
              }}
            >
              <Icon name="delete-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

         
        </Animatable.View>
      )}

        {showMusicPreview && selectedTrack && (
 <Video
            ref={playerRef}
            source={{ uri: selectedTrack.streamUrl }}
            paused={!isPlaying}
            audioOnly
            style={{ height: 0, width: 0 }}
            onEnd={() => setIsPlaying(false)}
          />
        )}
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
