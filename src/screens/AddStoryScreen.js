import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  Camera, 
  useCameraDevice, 
  useCameraPermission, 
  useCameraFormat 
} from "react-native-vision-camera";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useTheme } from "../constants/context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Explicitly calculate a stable 16:9 height for the camera container
const CAMERA_HEIGHT = (SCREEN_WIDTH * 16) / 9; 

const AddStoryScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { theme } = useTheme();
  
  const { hasPermission, requestPermission } = useCameraPermission();

  const cameraRef = useRef(null);
  const [cameraPosition, setCameraPosition] = useState("back");
  const [flash, setFlash] = useState("off");
  const [zoom, setZoom] = useState(1);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  const device = useCameraDevice(cameraPosition);

  // Explicitly query for a standard 16:9 aspect ratio from hardware
  const format = useCameraFormat(device, [
    { videoAspectRatio: 16 / 9 },
    { photoAspectRatio: 16 / 9 }
  ]);

  useEffect(() => {
    if (device) {
      setZoom(device.minZoom ?? 1);
    }
  }, [device]);

  const isFlashAvailable = device?.hasFlash ?? false;
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 8, 8);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleZoomChange = (factor) => {
    setZoom(Math.max(minZoom, Math.min(factor, maxZoom)));
  };

  const toggleCameraPosition = () => {
    setCameraPosition((prev) => (prev === "back" ? "front" : "back"));
    setFlash("off"); 
  };

  const toggleFlash = () => {
    if (!isFlashAvailable) {
      Alert.alert("Notice", "Flash is not available on this camera.");
      return;
    }
    setFlash((prev) => (prev === "off" ? "on" : "off"));
  };

  const takePhoto = async () => {
    if (!cameraRef.current || isTakingPhoto) return;

    try {
      setIsTakingPhoto(true);
      const selectedFlashMode = isFlashAvailable ? flash : "off";

      const photo = await cameraRef.current.takePhoto({
        flash: selectedFlashMode,
        enableShutterSound: true,
      });

      if (photo?.path) {
        const imageUri = `file://${photo.path}`;
        navigation.replace("StoryUploadScreen", { imageUri });
      } else {
        Alert.alert("Error", "Failed to capture image path.");
      }
    } catch (error) {
      console.error("Failed to take photo:", error);
      Alert.alert("Error", "An error occurred while taking the picture.");
    } finally {
      setIsTakingPhoto(false);
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background?.color || "#000" }]}>
        <View style={styles.permissionContent}>
          <Icon name="camera-off" size={48} color={theme.text.accent || "#ff4757"} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Camera Access Required</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            To take live photos and post them directly to your story, please enable camera access.
          </Text>
          <TouchableOpacity
            style={[styles.button, { borderColor: theme.text.accent || "#fff" }]}
            onPress={async () => {
              const accessGiven = await requestPermission();
              if (!accessGiven) {
                Linking.openSettings();
              }
            }}
          >
            <Text style={[styles.buttonText, { color: theme.text.primary }]}>Grant Access / Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: "#000" }]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Loading camera module...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Centered container with a strict 16:9 box bounding layout */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          format={format}
          isActive={isFocused}
          photo={true}
          zoom={zoom}
        />
      </View>

      {/* Top Header Overlay */}
      <SafeAreaView style={styles.headerOverlay}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Icon name="x" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.iconButton, !isFlashAvailable && styles.disabledButton]} 
          onPress={toggleFlash}
          disabled={!isFlashAvailable}
        >
          <Icon
            name={!isFlashAvailable ? "zap-off" : flash === "on" ? "zap" : "zap-off"}
            size={24}
            color={!isFlashAvailable ? "rgba(255,255,255,0.4)" : flash === "on" ? "#FFD700" : "#fff"}
          />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Interface Controls */}
      <View style={styles.bottomOverlay}>
        <View style={styles.zoomContainer}>
          <TouchableOpacity
            style={[styles.zoomButton, zoom === minZoom && styles.activeZoomButton]}
            onPress={() => handleZoomChange(minZoom)}
          >
            <Text style={styles.zoomText}>1x</Text>
          </TouchableOpacity>
          {maxZoom >= minZoom * 2 && (
            <TouchableOpacity
              style={[styles.zoomButton, zoom === minZoom * 2 && styles.activeZoomButton]}
              onPress={() => handleZoomChange(minZoom * 2)}
            >
              <Text style={styles.zoomText}>2x</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.controlRow}>
          <View style={styles.sideButtonSpacer} />

          <TouchableOpacity
            style={styles.shutterOuter}
            onPress={takePhoto}
            disabled={isTakingPhoto}
          >
            <View style={[styles.shutterInner, isTakingPhoto && styles.shutterLoading]}>
              {isTakingPhoto && <ActivityIndicator size="small" color="#000" />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraPosition}>
            <Icon name="refresh-cw" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AddStoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center", // Center the camera view box cleanly vertically
  },
  cameraContainer: {
    width: SCREEN_WIDTH,
    height: CAMERA_HEIGHT,
    overflow: "hidden",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 290,
    lineHeight: 22,
  },
  button: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  headerOverlay: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "rgba(0,0,0,0.2)",
    opacity: 0.5,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    alignItems: "center",
    zIndex: 10,
  },
  zoomContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 4,
    marginBottom: 24,
    gap: 8,
  },
  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  activeZoomButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  zoomText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  controlRow: {
    width: SCREEN_WIDTH,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  sideButtonSpacer: {
    width: 48,
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterLoading: {
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  flipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
});