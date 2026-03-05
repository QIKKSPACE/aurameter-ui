import React, { useEffect, useCallback, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Pressable, StyleSheet, TextInput, View } from "react-native";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import StoryCanvas from "../components/story/StoryCanvas";
import TextEditorOverlay from "../components/story/TextEditorOverlay";
import MusicSearchModal from "../components/story/MusicSearchModal";
import LocationSearchModal from "../components/story/LocationSearchModal";
import ConnectionModal from "../components/story/ConnectionModal";


import StickerBottomSheet from "../components/story/StickerBottomSheet";
import { BackHandler, Alert } from "react-native";


import {
  createStory,
  addLayer,
  updateLayer,
  removeLayer,
} from "../store/storyCreatorSlice";
import { uuidv4 } from "../utils/uuid";
import { launchImageLibrary } from "react-native-image-picker";
import { useTheme } from "../constants/context/ThemeContext";
const FONTS = [
  { id: "classic", fontFamily: "System" },
  { id: "serif", fontFamily: "Georgia" },
  { id: "mono", fontFamily: "Courier" },
   { id: "poppins", fontFamily: "Inter_18pt-Regular" },
    { id: "poppins", fontFamily: "Poppins_Medium" },
  { id: "bold", fontFamily: "System", fontWeight: "900" },
];

const COLORS = [
  "#ffffff",
  "#ff3b30",
  "#ffcc00",
  "#34c759",
  "#007aff",
  "#af52de",
  "#ff2d55",
];
export default function StoryEditorScreen({ route,navigation }) {
  const dispatch = useDispatch();
  const story = useSelector((state) => state.storyCreator);
const [isAddingText, setIsAddingText] = useState(false);
const [draftText, setDraftText] =useState("");
const  { theme }=useTheme()
const [editingTextLayerId, setEditingTextLayerId] = useState(null);
const [selectedFont, setSelectedFont] = useState(FONTS[0]);
const [selectedColor, setSelectedColor] = useState(COLORS[0]);
const [showMusicPicker, setShowMusicPicker] = useState(false);


const [selectedTrack, setSelectedTrack] = useState(null);
const [showStickerSheet, setShowStickerSheet] = useState(false);
const [showLocationModal, setShowLocationModal] = useState(false);
const [location, setLocation] = useState(null);
const [showtagModal, setShowTagModal] = useState(false);
const [taggeduser, setTaggeduser] = useState(null);
useEffect(() => {
  const onBackPress = () => {
    // 1️⃣ Text editor has highest priority
    if (isAddingText) {
      setIsAddingText(false);
      setEditingTextLayerId(null);
      return true; // ⛔ stop default back behavior
    }

    // 2️⃣ Sticker bottom sheet
    if (showStickerSheet) {
      setShowStickerSheet(false);
      return true;
    }

    // 3️⃣ Other modals
    if (showMusicPicker) {
      setShowMusicPicker(false);
      return true;
    }

    if (showLocationModal) {
      setShowLocationModal(false);
      return true;
    }

    if (showtagModal) {
      setShowTagModal(false);
      return true;
    }

    // 4️⃣ Nothing open → confirm exit
    Alert.alert(
      "Exit story?",
      "Are you sure you want to exit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]
    );

    return true; // ⛔ prevent auto back
  };

  const subscription = BackHandler.addEventListener(
    "hardwareBackPress",
    onBackPress
  );

  return () => subscription.remove();
}, [
  isAddingText,
  showStickerSheet,
  showMusicPicker,
  showLocationModal,
  showtagModal,
  navigation,
]);

  // Log story state for debugging (remove in production)
  useEffect(() => {
    console.log("Story state:", story);
  }, [story]);
const editingTextLayer = useSelector(
  state =>
    editingTextLayerId
      ? state.storyCreator.layers.find(l => l.id === editingTextLayerId)
      : null,
  shallowEqual
);
  // Initialize story on mount
  useEffect(() => {
    dispatch(createStory());

    // If route param includes imageUri, add it as a layer
    if (route?.params?.imageUri) {
      addImageLayer(route.params.imageUri);
    }
  }, [dispatch, route?.params?.imageUri]);

  // Memoized callbacks for layer updates
  const handleUpdateLayer = useCallback(
    (id, changes) => {
      dispatch(updateLayer({ id, changes }));
    },
    [dispatch]
  );

  const handleDeleteLayer = useCallback(
    (id) => {
      dispatch(removeLayer(id));
    },
    [dispatch]
  );
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // Helper: add image layer (either from picker or route param)
const addImageLayer = async (uriFromParam) => {
  let imageUri = uriFromParam;

  // Open picker if not coming from params
  if (!imageUri) {
    const result = await launchImageLibrary({ mediaType: "photo", quality: 1 });
    if (!result.assets?.length) return;
    imageUri = result.assets[0].uri;
  }


  // 🔒 Fixed base size (device-based)
  const baseWidth = screenWidth * 0.8;
  const baseHeight = screenHeight * 0.8;

  dispatch(
    addLayer({
      id: uuidv4(),
      type: "image",
      x: (screenWidth - baseWidth) / 2-10,
      y: (screenHeight - baseHeight) / 2,
      scale: 1,           // 👈 user controls size
      rotation: 0,
      zIndex: story.layers.length,
      data: {
        url: imageUri,
        width: baseWidth,
        height: baseHeight,
      },
    })
  );
};

const reset = () => {
  setDraftText("");
  setEditingTextLayerId(null);
  setIsAddingText(false);
};
  return (
    <>
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StoryCanvas
     
        scene={story}
        onUpdateLayer={handleUpdateLayer}
        onDeleteLayer={handleDeleteLayer}
        onPickImage={() => addImageLayer()} // open picker
        onClose={()=>{navigation.goBack() }}
        onAddMusic={()=>{setShowMusicPicker(true)}}
        onAddLocation={()=>{setShowLocationModal(true)}}
        onAddTag={()=>{setShowTagModal(true)}}

        location={location}
        selectedTrack={selectedTrack}
        
        onRemoveTrack={()=>setSelectedTrack(null)}
          onOpenStickerSheet={() => setShowStickerSheet(true)} // 🔑 Trigger sticker sheet
        onAddText={() => {
  const { width, height } = Dimensions.get("window");

  const layer = {
    id: uuidv4(),
    type: "text",
    x: width / 2 - 100,
    y: height / 2 - 20,
    scale: 1,
    rotation: 0,
    zIndex: 1000 + story.layers.length,
    data: {
      text: "",
      color: "#ffffff",
      fontSize: 36,
      fontFamily: "System",
      fontWeight: "400",
      align: "center",
    },
  };

  dispatch(addLayer(layer));   // 👈 VERY IMPORTANT
 setEditingTextLayerId(layer.id);
  setIsAddingText(true);
}}
          onEditText={(layer) => {
    setDraftText(layer.data.text);
    setEditingTextLayerId(layer.id);
    setIsAddingText(true);
  }}
         
      />
 <TextEditorOverlay
 canvasWidth={screenWidth}
  visible={isAddingText}
layerId={editingTextLayerId}
  onClose={() => {
  setEditingTextLayerId(null);
    setIsAddingText(false);
  }}
onDone={(data) => {
  if (!editingTextLayerId) return;

  if (!data.text.trim()) {
    dispatch(removeLayer(editingTextLayerId));
  } else {
    dispatch(
      updateLayer({
        id: editingTextLayerId,
        changes: {
          data,
        },
      })
    );
  }

  setIsAddingText(false);
  setEditingTextLayerId(null);
}}

/>
<MusicSearchModal
  visible={showMusicPicker}
  onClose={() => setShowMusicPicker(false)}
  onSelectTrack={(track) => setSelectedTrack(track)}
  theme={theme}
/>
<LocationSearchModal
  visible={showLocationModal}
  onClose={() => setShowLocationModal(false)}
  onSelectLocation={(locationText) => {
    console.log("Selected location:", locationText);
    setLocation(locationText);
  }}
  theme={theme}
/>
<ConnectionModal
  visible={showtagModal}
  onClose={() => setShowTagModal(false)}
  onTaguser={(userId) => {
    console.log("taggedUser ", userId);
    setTaggeduser(userId);
  }}
  theme={theme}
/>


    </View>
    <StickerBottomSheet
  visible={showStickerSheet}
  onClose={() => setShowStickerSheet(false)}
  onStickerSelect={(sticker) => {
    // Add sticker as a new layer
    const { width, height } = Dimensions.get("window");
    dispatch(
      addLayer({
        id: uuidv4(),
        type: "sticker",
        x: width / 2 - 50,
        y: height / 2 - 50,
        scale: 1,
        rotation: 0,
        zIndex: story.layers.length + 1000,
        data: {
          uri: sticker.url,
          width: 100,
          height: 100,
        },
      })
    );
    setShowStickerSheet(false);
  }}
  onlinkselect={(link)=>{
     const { width, height } = Dimensions.get("window");

  const LINK_MIN_WIDTH = 150;
  const LINK_HEIGHT = 46;

     dispatch(
    addLayer({
      id: uuidv4(),
      type: "link",
      x: width / 2 - LINK_MIN_WIDTH / 2,
      y: height / 2 - LINK_HEIGHT / 2,
      scale: 1,
      rotation: 0,
      zIndex: story.layers.length + 1000,
      width: LINK_MIN_WIDTH,
      height: LINK_HEIGHT,
      data: {
        url: link.url,
        text: link.text,
        fontSize: 16,
        fontFamily: "System",
        backgroundColor: "#ffffff",
        color: "#000000",
      },
    })
  );

  }}
/>
    </>
    
  );
}
