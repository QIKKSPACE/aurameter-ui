import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const IntroModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient
          colors={["#0D1B2A", "#1B2C3A"]}
          style={styles.card}
        >
          <Text style={styles.title}>Breathing Exercise</Text>

          <Text style={styles.text}>
            This space is designed to slow you down.
            {"\n\n"}
            Follow the expanding circle as you inhale,
            and the contracting circle as you exhale.
            {"\n\n"}
            Pair it with gentle music and let your breath
            guide your nervous system back to calm.
          </Text>

          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Begin</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default IntroModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    borderRadius: 24,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: "#B8C1CC",
    lineHeight: 22,
  },
  btn: {
    marginTop: 24,
    alignSelf: "center",
    backgroundColor: "#00E5FF",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 30,
  },
  btnText: {
    fontWeight: "600",
    color: "#0D1B2A",
  },
});
