import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

/**
 * Props:
 * - status: story.status
 * - aiRejectResponse: string | null
 */

const StoryStatusOverlay = ({
  local_id,
  status,
  aiRejectResponse,
  onRetry,
  onDelete,
}) => {
  if (!status || status === "ACCEPTED") return null;
  const isAIRejected =
    status === "FAILED" && Boolean(aiRejectResponse);

  let text = "";
  let loading = false;
  let showRetry = false;
  let showDelete = false;

  switch (status) {
    case "LOCAL_QUEUED":
      text = "Sending story...";
      loading = true;
      break;

    case "PENDING":
      text = "Almost there, your story is being uploaded...";
      loading = true;
      break;

    case "AI_ACCEPTED":
      text = "Aura AI approved your story, processing final upload...";
      break;
     case "AI_FAILED":
      text = "Final processing..";
      break;
    case "UPLOADING":
      text = "Final processing..";
      break;
    case "FAILED":
      if (isAIRejected) {
        text =
          aiRejectResponse ||
          "Aura AI rejected this image.";
        showDelete = true;
      } else {
        text = "Something went wrong. Try again.";
        showRetry = true;
        showDelete = true;
      }
      break;

    default:
      return null;
  }

  return (
    <View style={styles.overlay}>
      {loading && (
        <ActivityIndicator size="small" color="#fff" />
      )}

      <Text style={styles.text}>{text}</Text>

      {(showRetry || showDelete) && (
        <View style={styles.actions}>
          {showRetry && (
            <TouchableOpacity onPress={onRetry}>
              <Text style={styles.retry}>Retry</Text>
            </TouchableOpacity>
          )}

          {showDelete && (
          <TouchableOpacity onPress={() =>{
console.log("delete")

onDelete(local_id, status)

}
          } >
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default StoryStatusOverlay;

const styles = StyleSheet.create({
 overlay: {
  position: "absolute",
  bottom: 40,
  alignSelf: "center",
  backgroundColor: "rgba(0,0,0,0.65)",
  paddingVertical: 12,
  paddingHorizontal: 18,
  borderRadius: 12,
  alignItems: "center",
  maxWidth: "80%",
  zIndex: 1000,        // ✅
  elevation: 1000,     // ✅ Android
},
  text: {
    color: "#fff",
    marginTop: 6,
    fontSize: 14,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
  },
  retry: {
    color: "#4da6ff",
    fontWeight: "600",
  },
  delete: {
    color: "#ff5c5c",
    fontWeight: "600",
  },
});
