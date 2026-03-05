// screens/AddStoryScreen.js
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  AppState,
  Linking,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import * as ImagePicker from "react-native-image-picker";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import CustomModal from "../components/CustomModal";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = (width - 24) / 3; // For spacing between 3 images

const AddStoryScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [endCursor, setEndCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ title: "", message: "", onConfirm: null });
  const [hasAttemptedPermission, setHasAttemptedPermission] = useState(false);
  const appStateRef = useRef(AppState.currentState);

  // Show modal
  const showModal = (title, message, onConfirm = null) => {
    setModalData({ title, message, onConfirm });
    setModalVisible(true);
  };

  // Handle permissions
  const requestFilePermission = async () => {
    const permission =
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;

    const result = await check(permission);

    if (result === RESULTS.GRANTED) {
      setHasAttemptedPermission(true);
      return;
    } else if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      if (requestResult === RESULTS.GRANTED) {
        setHasAttemptedPermission(true);
      } else {
        showModal(
          "Permission Required",
          "We need access to your photos to upload stories. Please enable it in settings.",
          () => Linking.openSettings()
        );
      }
    } else if (result === RESULTS.BLOCKED) {
      showModal(
        "Permission Required",
        "We need access to your photos to upload stories. Please enable it in settings.",
        () => Linking.openSettings()
      );
    }
  };

  // Fetch photos
  const fetchImages = async (nextCursor = null) => {
    if (loading || !hasNextPage) return;
    setLoading(true);

    try {
      const result = await CameraRoll.getPhotos({
        first: 30,
        after: nextCursor,
        assetType: "Photos",
      });

      if (!nextCursor) {
        setPhotos(result.edges);
      } else {
        setPhotos((prev) => [...prev, ...result.edges]);
      }

      setEndCursor(result.page_info.end_cursor);
      setHasNextPage(result.page_info.has_next_page);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAttemptedPermission) {
      fetchImages();
    } else {
      requestFilePermission();

      const subscription = AppState.addEventListener("change", async (nextAppState) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          const permission =
            Platform.OS === "ios"
              ? PERMISSIONS.IOS.PHOTO_LIBRARY
              : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;

          const result = await check(permission);

          if (result === RESULTS.GRANTED) {
            setPhotos([]);
            setEndCursor(null);
            setHasNextPage(true);
            setModalVisible(false);
            fetchImages();
          }
        }

        appStateRef.current = nextAppState;
      });

      return () => subscription.remove();
    }
  }, [hasAttemptedPermission]);

  const handleImageSelect = (uri) => {
    navigation.navigate("StoryUploadScreen", { imageUri: uri });
  };

  const requestCameraPermission = async () => {
  const permission =
    Platform.OS === "ios"
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

  const result = await check(permission);

  if (result === RESULTS.GRANTED) return true;

  if (result === RESULTS.DENIED) {
    const req = await request(permission);
    return req === RESULTS.GRANTED;
  }

  if (result === RESULTS.BLOCKED) {
    showModal(
      "Camera Permission Required",
      "Please enable camera access in settings.",
      () => Linking.openSettings()
    );
  }

  return false;
};
const openCamera = async () => {
  const allowed = await requestCameraPermission();
  if (!allowed) return;

  ImagePicker.launchCamera(
    { mediaType: "photo", saveToPhotos: true },
    (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        handleImageSelect(response.assets[0].uri);
      }
    }
  );
}


  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity onPress={() => handleImageSelect(item.node.image.uri)}>
      <Image source={{ uri: item.node.image.uri }} style={styles.image} />
    </TouchableOpacity>
  ), []);

  return (
    <ScreenBackground>
      <View style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="x" size={28} color={theme.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text.primary }]}>Add Story</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Buttons */}
      <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.button, { borderColor: theme.text.accent }]}
            onPress={openCamera}
          >
            <Text style={[styles.buttonText, { color: theme.text.primary }]}>
              Open Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { borderColor: theme.text.accent }]}
            onPress={() => navigation.navigate("StoryUploadScreen")}
          >
            <Text style={[styles.buttonText, { color: theme.text.primary }]}>
              Create Story
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Label */}
        <View style={styles.recentRow}>
          <Text style={[styles.recentText, { color: theme.text.primary }]}>Recent</Text>
          <Icon name="chevron-down" size={18} color={theme.text.primary} style={{ marginLeft: 4 }} />
        </View>

        {/* Image Grid */}
        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={styles.grid}
          onEndReached={() => fetchImages(endCursor)}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading && <ActivityIndicator size="small" color="#00E5FF" />}
          showsVerticalScrollIndicator={false}
        />

        <CustomModal
          visible={modalVisible}
          title={modalData.title}
          message={modalData.message}
          onClose={() => setModalVisible(false)}
          onConfirm={modalData.onConfirm}
        />
      </View>
    </ScreenBackground>
  );
};

export default AddStoryScreen;

// ----------------- Styles ---------------------

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 0 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
    paddingHorizontal: 12,
  },
  title: { fontSize: 20, fontWeight: "600" },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { fontSize: 14, fontWeight: "500" },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  recentText: { fontSize: 16, fontWeight: "600" },
  grid: { paddingBottom: 40, paddingHorizontal:4 },
  image: {
    width: IMAGE_SIZE,
    aspectRatio: 9 / 16,
    borderRadius: 6,
    marginBottom: 4,
  },
});
