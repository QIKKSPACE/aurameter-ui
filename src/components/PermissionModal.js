import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
} from "react-native";

const PermissionModal = ({ visible, onClose, title, message, showSettings }) => {
  const openSettings = () => {
    if (Platform.OS === "android") {
      Linking.openSettings();
    } else if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>{title || "Permission Required"}</Text>
          <Text style={styles.message}>{message || "This feature requires permission."}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#888" }]} onPress={onClose}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>

            {showSettings && (
              <TouchableOpacity style={[styles.button, { backgroundColor: "#00E5FF" }]} onPress={openSettings}>
                <Text style={styles.buttonText}>Go to Settings</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#1B263B",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#fff",
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default PermissionModal;
