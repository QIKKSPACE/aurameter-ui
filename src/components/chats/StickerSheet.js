import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
} from "react-native";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import Icon from "react-native-vector-icons/Feather";
import debounce from "lodash.debounce";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FastImage from "react-native-fast-image";  
import NativeWebPImage from "../NativeWebPImage";
import { launchImageLibrary } from "react-native-image-picker";
import QuizPicker from "../QuizPicker";
import { useNavigation } from "@react-navigation/native";
const KLIPY_KEY = "CmOm4jKvHvOBgJCNieTLJZ6GNOSHOT01LulP7EgfRSAfWRG54I9K9Vw2mB2JJs4q"; 
const validateLink = (url) => {
  if (!url.startsWith("https://")) {
    return "Link must start with https://";
  }
  return "";
};
export default function StickerBottomSheet({ visible, onClose, onStickerSelect,onQuizSelect,  onImageSelect // ✅ NEW
 }) {
  const sheetRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState(null);

  const [stickerQuery, setStickerQuery] = useState("");
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(false);
const [mode, setMode] = useState("stickers");
const [linkUrl, setLinkUrl] = useState("");
const [linkError, setLinkError] = useState("");
  const snapPoints = useMemo(() => ["40%", "60%","75%", "90%"], []);

  const actions = [
 {
    id: "Galalry",
    icon: <Icon name="image" size={24} color="#fff" />,
    label: "Gallary",
    onPress: () => pickImage(),
  },
   {
  id: "quiz",
  icon: <Icon name="help-circle" size={24} color="#fff" />,
  label: "Quiz",
  onPress: () => setMode("quiz"),
}
  ];

  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.8 }, (res) => {
      if (!res.didCancel && res.assets?.length) {
        setSelectedImage(res.assets[0].uri);
             onImageSelect?.(res.assets[0].uri);   // ✅ SEND BACK
      sheetRef.current?.dismiss();
      }
    });
  };
  // --- Fetch stickers from KLIPY ---
  const fetchStickers = async (query = "") => {
    setLoading(true);
    try {
      const url = query
        ? `https://api.klipy.com/api/v1/${KLIPY_KEY}/stickers/search?q=${encodeURIComponent(query)}&page=1&per_page=40&locale=en&format_filter=webp`
        : `https://api.klipy.com/api/v1/${KLIPY_KEY}/stickers/trending?page=1&per_page=100&locale=en&format_filter=webp`;

      const res = await fetch(url);
      const json = await res.json();
     
      // Map stickers properly
      const stickerData = json.data.data.map(item => ({
        id: item.id,
        url: item.file.md?.webp?.url || item.file.sm?.webp?.url,
      }));

      setStickers(stickerData);
    } catch (e) {
      console.error("KLIPY fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- Debounced search ---
  const handleStickerSearch = useCallback(
    debounce((text) => fetchStickers(text), 500),
    []
  );

  const onChangeSearch = (text) => {
    setStickerQuery(text);
    handleStickerSearch(text);
  };

  // --- Show or hide sheet ---
  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  // --- Initial fetch ---
  useEffect(() => {
    fetchStickers();
  }, []);

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
  {mode === "quiz" ? (
  <View style={{ flex: 1 }}>
    {/* Header */}
    <View style={styles.linkHeader}>
      <TouchableOpacity onPress={() => setMode("stickers")}>
        <Icon name="arrow-left" size={22} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.linkTitle}>Select Quiz</Text>
      <View style={{ width: 22 }} />
    </View>

    <QuizPicker
      onSelectQuiz={(quiz) => {
       onQuizSelect(quiz)
        sheetRef.current?.dismiss();
      }}
      onCreateQuiz={() => {
        sheetRef.current?.dismiss();
        //navigation.navigate("AllQuizScreen");
      }}
    />
  </View>
)  :(
      <View style={{ flex: 1, paddingBottom: insets.bottom }}>
        {/* Horizontal Actions */}
  <View style={styles.actionsContainer}>
          <FlatList
            data={actions}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.actionItem} onPress={item.onPress}>
                {item.icon}
                <Text style={styles.actionLabel}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        {/* Sticker Search */}
        <TextInput
          value={stickerQuery}
          onChangeText={onChangeSearch}
          placeholder="Search stickers..."
          placeholderTextColor="#888"
          style={styles.stickerSearchInput}
        />

       <View style={{ flex: 1 }}>
    {loading ? (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    ) : (
       <BottomSheetFlatList
        data={stickers}
        keyExtractor={(item) => item.id}
        numColumns={4}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        contentContainerStyle={{ padding: 12 }}
        windowSize={15} // make sure enough items are kept in memory
initialNumToRender={20}
        renderItem={({ item}) => (
          <TouchableOpacity
            style={styles.stickerWrapper}
          onPress={() => {
  onStickerSelect(item);
  sheetRef.current?.dismiss();
}}
          >
          <NativeWebPImage
  key={item.id} // force new view instance on recycling
          
  source={{ uri: item.url }}
  style={styles.stickerImage}
/>
          </TouchableOpacity>
        )}
      />
    )}
  </View>
      </View>)}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: { backgroundColor: "#0f0f0f", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  indicator: { backgroundColor: "#444", width: 40 },
  actionsContainer: { paddingVertical: 12 },
  actionItem: {
    width: 64,
    height: 64,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#1c1c1c",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    color: "#fff",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  stickerSearchInput: {
    backgroundColor: "#1c1c1c",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: "#fff",
    fontSize: 14,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  stickerWrapper: {
    flex: 1 / 4,
    aspectRatio: 1,
    margin: 6,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1c1c1c",
  },
  stickerImage: {
    width: "100%",
    height: "100%",
  },
  linkContainer: {
  flex: 1,
  paddingHorizontal: 20,
  paddingTop: 16,
},

linkHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 24,
  padding:10
},

linkTitle: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "600",
},

linkInputWrapper: {
  marginBottom: 20,
},

linkInput: {
  backgroundColor: "#1c1c1c",
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 15,
  color: "#fff",
},

linkError: {
  color: "#ff4d4f",
  fontSize: 12,
  marginTop: 6,
},

linkPreview: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  borderRadius: 14,
  padding: 14,
  marginBottom: 24,
},

linkPreviewText: {
  marginLeft: 10,
  color: "#000",
  fontSize: 14,
  flex: 1,
},

linkButton: {
  backgroundColor: "#fff",
  borderRadius: 24,
  paddingVertical: 14,
  alignItems: "center",
},

linkButtonText: {
  color: "#000",
  fontSize: 16,
  fontWeight: "600",
},

});
