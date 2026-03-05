import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Modal } from "react-native";

export default function AuraCommentModal({ visible, onClose, story, user }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Start bouncing when modal is visible
  useEffect(() => {
  
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -15,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;
  
  const showAuraAI = story.userId === user?.id;
  const showComment = true;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalContent}>
          <View style={styles.actionsContainer}>
             <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Image source={require("../assets/aura_chat.png")} style={styles.icon} />
    
                </TouchableOpacity>
              </Animated.View>

            
          </View>

          {showComment && (
              <TouchableOpacity style={styles.actionBtn}>
                {showAuraAI?
                 <Text style={[styles.label,{fontSize:30}]}>{story?.geminiaura}</Text>
                :""}
                <Text style={styles.label}>{story?.geminicomment}</Text>
              </TouchableOpacity>
            )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    padding: 20,
    width:'80%',
    borderRadius: 16,
    backgroundColor: "#111",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  actionBtn: {
    alignItems: "center",
    marginHorizontal: 15,
  },
  icon: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  label: {
    color: "#fff",
    marginTop: 8,
    fontWeight: "600",
    fontSize: 14,
    textAlign:'center',

  },
});
