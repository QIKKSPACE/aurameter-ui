import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  Dimensions,
  View,
  BackHandler,
  Alert,
  NativeModules,
  Image
} from "react-native";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import StoryCanvas from "../components/story/StoryCanvas";
import TextEditorOverlay from "../components/story/TextEditorOverlay";
import MusicSearchModal from "../components/story/MusicSearchModal";
import LocationSearchModal from "../components/story/LocationSearchModal";
import ConnectionModal from "../components/story/ConnectionModal";
import StickerBottomSheet from "../components/story/StickerBottomSheet";
import PreparingUploadModal from "../components/story/PreparingUploadModal";

import {
  createStory,
  addLayer,
  updateLayer,
  removeLayer,
  resetStory,
} from "../store/storyCreatorSlice";
import { createUploadUrl } from "../hooks/useCreateUploadUrl"; // adjust path

import { uuidv4 } from "../utils/uuid";
import { launchImageLibrary } from "react-native-image-picker";
import { useTheme } from "../constants/context/ThemeContext";
import { createStoryObject } from "../utils/createStoryObject";
import { addStoryOptimistic } from "../store/storySlice";
import { addToUploadQueue } from "../utils/UploadQueue";
const { WorkManagerModule } = NativeModules; // keep if you use it later

/* ───────────────── DESIGN CONSTANTS ───────────────── */
const DESIGN_WIDTH = 1080;
const DESIGN_HEIGHT = 1920;

/* ───────────────── COMPONENT ───────────────── */
export default function StoryEditorScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const story = useSelector((state) => state.storyCreator);
  const { theme } = useTheme();
  const accessToken = useSelector((state) => state.user.token);

  /* ───────────────── SCREEN / SCALE ───────────────── */
  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

  const editorScale = useMemo(
    () => Math.min(SCREEN_W / DESIGN_WIDTH, SCREEN_H / DESIGN_HEIGHT),
    [SCREEN_W, SCREEN_H]
  );

  /* ───────────────── LOCAL STATE ───────────────── */
  const [isAddingText, setIsAddingText] = useState(false);
  const [editingTextLayerId, setEditingTextLayerId] = useState(null);

  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const [showStickerSheet, setShowStickerSheet] = useState(false);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [location, setLocation] = useState(null);

  const [showTagModal, setShowTagModal] = useState(false);
  const [taggedUser, setTaggedUser] = useState(null);
  const [preparingUpload, setPreparingUpload] = useState(null);
  const userdata = useSelector((state) => state.user.userData || {});
const handlePreparePost = async (sortedLayers, editorHeight, editorWidth) => {
  try {
    setPreparingUpload(true);

    const uri = await createUploadUrl(
      sortedLayers,
      editorHeight,
      editorWidth
    );

    const interactiveLayers = sortedLayers.filter(
      (layer) => layer.type === "link" || layer.type === "quiz"
    );

    const layersToSend =
      interactiveLayers.length > 0 ? interactiveLayers : null;

    const type = "image";

    const payload = {
      local_id: story.local_id,
      userId: userdata?.id,
      mediaUrl: uri,
      type,
      music: selectedTrack,
      location,
      taggedUser,
      layers: layersToSend, // ✅ only link & sticker or null
    };

    const storyObject = createStoryObject(payload);
 
     const storyId = null; // unique ID
     const local_id=storyObject.local_id; // unique ID

      if(!local_id){return ;}
      const caption = "";
     const userId=userdata?.id
     const normalizedTaggedUsers = (storyObject.tagged_users || []).map(u => ({
  userId: u.id,
  hasAccepted: true,
}));
const layers = (storyObject.layers || []);
     const userDataStry={user_id:  userdata.id,
          username: userdata.username, // ensure this exists
          email: userdata.email,
          aura: userdata.aura || 0,
          avatar: userdata.avatar || null,}
          const musicUrlJson = JSON.stringify(storyObject.music);
       const filePath = uri.startsWith("file://")
  ? uri.replace("file://", "")
  : uri;

             await addToUploadQueue(storyObject);
              dispatch(
                  addStoryOptimistic({
                 
                    userData:userDataStry,
                    story: storyObject,
                  })
                );
                   navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          });
          const taggedUsersJson = JSON.stringify(normalizedTaggedUsers);
const layersJson =
  storyObject.layers && storyObject.layers.length
    ? JSON.stringify(storyObject.layers)
    : "[]";
   const result = await WorkManagerModule.scheduleStoryUpload(
        local_id,
  filePath,
    caption,
  type,
  userId,
  musicUrlJson,
  location,
  accessToken,
  taggedUsersJson,
  layersJson

);
    console.log("Saved story image:", uri);
  } catch (error) {
    console.error("Prepare upload failed", error);
  } finally {
    setPreparingUpload(false);
  }
};


  /* ───────────────── BACK HANDLER ───────────────── */
  useEffect(() => {
    const onBackPress = () => {
      if (isAddingText) {
        setIsAddingText(false);
        setEditingTextLayerId(null);
        return true;
      }

      if (showStickerSheet) {
        setShowStickerSheet(false);
        return true;
      }

      if (showMusicPicker) {
        setShowMusicPicker(false);
        return true;
      }

      if (showLocationModal) {
        setShowLocationModal(false);
        return true;
      }

      if (showTagModal) {
        setShowTagModal(false);
        return true;
      }

      Alert.alert(
        "Exit story?",
        "Are you sure you want to exit?",
        [
          { text: "Cancel", style: "cancel" },
          {
          text: "Exit",
          style: "destructive",
         onPress: () => {
  dispatch(resetStory());
  navigation?.goBack(); // ✅ invoke it
}
        },
        ]
      );

      return true;
    };

    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => sub.remove();
  }, [
    isAddingText,
    showStickerSheet,
    showMusicPicker,
    showLocationModal,
    showTagModal,
    navigation,
  ]);
const addQuizLayer = (quiz) => {
  const layerId = uuidv4();

  dispatch(
    addLayer({
      id: layerId,
      type: "quiz",
      x: DESIGN_WIDTH / 2 - 150, // assuming 300px width
      y: DESIGN_HEIGHT / 2 - 60, // adjust for total height (title+desc+button)
      scale: 1,
      rotation: 0,
      zIndex: story.layers.length + 1000,
      data: {
        quizId: quiz._id,
        title: quiz.title,
        description: quiz.description,
                userId: quiz.userId,
      },
      width: 300, // layer width
      height: 120, // approximate height for title + desc + button
    })
  );
};
  /* ───────────────── INIT ───────────────── */
  useEffect(() => {
    dispatch(createStory());

    if (route?.params?.imageUri) {
      addImageLayer(route.params.imageUri);
    }
     if (route?.params?.quiz) {
    addQuizLayer(route.params.quiz);
  }
  }, [dispatch, route?.params?.imageUri]);
 

  /* ───────────────── REDUX HELPERS ───────────────── */
  const handleUpdateLayer = useCallback(
    (id, changes) => dispatch(updateLayer({ id, changes })),
    [dispatch]
  );

  const handleDeleteLayer = useCallback(
    (id) => dispatch(removeLayer(id)),
    [dispatch]
  );

  /* ───────────────── ADD IMAGE ───────────────── */
const addImageLayer = async (uriFromParam) => {
  let imageUri = uriFromParam;

  if (!imageUri) {
    const result = await launchImageLibrary({
      mediaType: "photo",
      quality: 1,
    });

    if (!result.assets?.length) return;

    imageUri = result.assets[0].uri;
  }

  Image.getSize(
    imageUri,
    (imgWidth, imgHeight) => {
      // Max size inside canvas
      const maxWidth = DESIGN_WIDTH;
      const maxHeight = DESIGN_HEIGHT;

      // Preserve aspect ratio
      const widthRatio = maxWidth / imgWidth;
      const heightRatio = maxHeight / imgHeight;

      const ratio = Math.min(widthRatio, heightRatio);

      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      dispatch(
        addLayer({
          id: uuidv4(),
          type: "image",
          x: (DESIGN_WIDTH - finalWidth) / 2,
          y: (DESIGN_HEIGHT - finalHeight) / 2,
          scale: 1,
          rotation: 0,
          zIndex: story.layers.length,
          data: {
            url: imageUri,
            width: finalWidth,
            height: finalHeight,
            originalWidth: imgWidth,
            originalHeight: imgHeight,
          },
        })
      );
    },
    (error) => {
      console.log("Failed to get image size:", error);
    }
  );
};

  /* ───────────────── ADD TEXT ───────────────── */
  const addTextLayer = () => {
    const id = uuidv4();

    dispatch(
      addLayer({
        id,
        type: "text",
        x: DESIGN_WIDTH / 2 - 100,
        y: DESIGN_HEIGHT / 2 - 20,
        scale: 1,
        rotation: 0,
        zIndex: story.layers.length + 1000,
        data: {
          text: "",
          color: "#ffffff",
          fontSize: 36,
          fontFamily: "System",
          fontWeight: "400",
          align: "center",
        },
      })
    );

    setEditingTextLayerId(id);
    setIsAddingText(true);
  };

  /* ───────────────── RENDER ───────────────── */
  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <StoryCanvas
          scene={story}
          canvasWidth={DESIGN_WIDTH}
          canvasHeight={DESIGN_HEIGHT}
          editorScale={editorScale}
          
          onUpdateLayer={handleUpdateLayer}
          onDeleteLayer={handleDeleteLayer}
          onPickImage={()=>{addImageLayer()}}
          onClose={navigation.goBack}
          onAddMusic={() => setShowMusicPicker(true)}
          onAddLocation={() => setShowLocationModal(true)}
          onAddTag={() => setShowTagModal(true)}
          onOpenStickerSheet={() => setShowStickerSheet(true)}
          onAddText={addTextLayer}
          onEditText={(layer) => {
            setEditingTextLayerId(layer.id);
            setIsAddingText(true);
          }}
          location={location}
          selectedTrack={selectedTrack}
          onRemoveTrack={() => setSelectedTrack(null)}
          handlePreparePost={(sortedLayers,editorWidth,editorHeight)=>{handlePreparePost(sortedLayers,editorWidth,editorHeight)}}
          preparingUpload={preparingUpload}
        />

        <TextEditorOverlay
          visible={isAddingText}
          layerId={editingTextLayerId}
          canvasWidth={DESIGN_WIDTH}
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
                  changes: { data },
                })
              );
            }

            setEditingTextLayerId(null);
            setIsAddingText(false);
          }}
        />
      </View>

      {/* ───────────── MODALS ───────────── */}

      <MusicSearchModal
        visible={showMusicPicker}
        onClose={() => setShowMusicPicker(false)}
        onSelectTrack={setSelectedTrack}
        theme={theme}
      />

      <LocationSearchModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={setLocation}
        theme={theme}
      />

      <ConnectionModal
        visible={showTagModal}
        onClose={() => setShowTagModal(false)}
        onTagUser={(user)=>{setTaggedUser(user)}}
        theme={theme}
      />

      <StickerBottomSheet
        visible={showStickerSheet}
        onClose={() => setShowStickerSheet(false)}
        onStickerSelect={(sticker) => {
          dispatch(
            addLayer({
              id: uuidv4(),
              type: "sticker",
              x: DESIGN_WIDTH / 2 - 50,
              y: DESIGN_HEIGHT / 2 - 50,
              scale: 1,
              rotation: 0,
              zIndex: story.layers.length + 1000,
              data: {
                uri: sticker.url,
                width: 300,
                height: 300,
              },
            })
          );
          setShowStickerSheet(false);
        }}
        onlinkselect={(link) => {
          const LINK_MIN_WIDTH = 150;
          const LINK_HEIGHT = 46;

          dispatch(
            addLayer({
              id: uuidv4(),
              type: "link",
              x: DESIGN_WIDTH / 2 - LINK_MIN_WIDTH / 2,
              y: DESIGN_HEIGHT / 2 - LINK_HEIGHT / 2,
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
      <PreparingUploadModal visible={preparingUpload} />

    </>
  );
}
