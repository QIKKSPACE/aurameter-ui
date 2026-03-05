// src/components/quiz/QuizRequestModal.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useTheme } from "../../constants/context/ThemeContext";

export default function QuizRequestModal({
  visible,
  topics,
  onSelect,
  onClose,
}) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.components.card },
          ]}
        >
          <Text
            style={[
              styles.title,
              { color: theme.text.primary },
            ]}
          >
            Select a Topic
          </Text>

          {topics.map((topic, i) => (
            <TouchableOpacity
              key={i}
              style={styles.topic}
              onPress={() => onSelect(topic)}
            >
              <Text
                style={{
                  color: theme.text.primary,
                  fontWeight: "600",
                }}
              >
                {topic}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={onClose}>
            <Text
              style={{
                marginTop: 10,
                textAlign: "center",
                color: theme.text.secondary,
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 18,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  topic: {
    paddingVertical: 14,
  },
});
