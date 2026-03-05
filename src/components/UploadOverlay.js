import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";

/**
 * UploadOverlay
 * Props:
 *  - story: the story object (expects isSending and isFailed)
 *  - onRetry?: optional callback when pressing Retry (falls back to console.log)
 */
export default function UploadOverlay({ story = {}, onRetry }) {
  const isSending = !!story.isSending;
  const isFailed = !!story.isFailed;

  if (!isSending && !isFailed) return null;

  return (
    <View style={styles.container}>
      {isSending && (
        <>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.text}>Uploading...</Text>
        </>
      )}

      {isFailed && (
        <>
          <Text style={[styles.text, styles.failed]}>Upload Failed</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              if (typeof onRetry === "function") onRetry(story);
              else console.log("Retry upload", story?.tempId || story?.story_id);
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "42%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    zIndex: 30,
  },
  text: { color: "#fff", marginTop: 8, fontSize: 14 },
  failed: { color: "red" },
  retryBtn: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "red",
    borderRadius: 6,
  },
  retryText: { color: "#fff", fontWeight: "600" },
});
