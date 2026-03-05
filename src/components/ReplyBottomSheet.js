import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Platform,
} from "react-native";
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import Icon from "react-native-vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CommentItem from "./CommentItem";
import { useDispatch, useSelector } from "react-redux";
import { addCommentOptimistic } from "../store/commentSlice";
import { makeSelectCommentsByStoryId, makeSelectCommentsWithMeta } from "../store/commentSelector";
import api from "../services/api";
import { useToast } from "../constants/context/ErrorContext";


export default function ReplyBottomSheet({ visible, onClose,story }) {
  const sheetRef = useRef(null);
  const inputRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [comment, setComment] = useState("");
  const snapPoints = useMemo(() => ["60%", "80%"], []);
  const dispatch=useDispatch()
  const userData=useSelector(state=>state.user.userData)
const selectComments = useMemo(makeSelectCommentsWithMeta, []);

const { comments, isLoading, isError } = useSelector(state =>
  selectComments(state, story?.story_id)
);
 
  // Show/hide sheet
  useEffect(() => {
    
    if (visible) {
      sheetRef.current?.present();

      // Focus input after sheet fully animates
      const focusTimeout = setTimeout(() => {
        inputRef.current?.focus();

        // Android sometimes needs Keyboard.show()
        if (Platform.OS === "android") {
          //Keyboard.show();
        }
      }, 200);

      return () => clearTimeout(focusTimeout);
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);
const {showToast}=useToast()
  const submitComment = async () => {
    try {
       const fullComment={
      user:{username:userData.username,avatar:userData?.avatar},
      likeCount: 0, likedByMe: false,id:Date.now().toString(),text:comment
    }
   dispatch(addCommentOptimistic({storyId:story.story_id,comment:fullComment}))
   await api.post(`/storycomment/stories/${story.story_id}/comments`,{text:comment})
   setComment("")

    } catch (error) {
      showToast("Failed To add comment","error")
   setComment("")
      
    }
   
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      initialSnapIndex={0}
      enablePanDownToClose
      enableDynamicSizing={false}
      onDismiss={onClose}
      keyboardBehavior="extend"
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      <View style={{ flex: 1 }}>
        <BottomSheetFlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CommentItem comment={item} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 + insets.bottom }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        />

        {/* Input fixed at bottom */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom }]}>
          <BottomSheetTextInput
            ref={inputRef}
            value={comment}
            onChangeText={setComment}
            placeholder="Send a reply…"
            placeholderTextColor="#888"
            style={styles.input}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={submitComment}>
            <Icon name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: { backgroundColor: "#0f0f0f", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  indicator: { backgroundColor: "#444", width: 40 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#222",
    backgroundColor: "#0f0f0f",
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderRadius: 22,
    backgroundColor: "#1c1c1c",
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#1d9bf0",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
