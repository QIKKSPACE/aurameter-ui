// screens/EditProfileScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
// Date picker
import DateTimePicker from "@react-native-community/datetimepicker";
// Image picker (install react-native-image-picker)
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api";
import {  useToast } from "../constants/context/ErrorContext";
import { updateUserData } from "../store/userSlice";
const ZODIAC = [
  { key: "aries", label: "Aries", emoji: "♈︎" },
  { key: "taurus", label: "Taurus", emoji: "♉︎" },
  { key: "gemini", label: "Gemini", emoji: "♊︎" },
  { key: "cancer", label: "Cancer", emoji: "♋︎" },
  { key: "leo", label: "Leo", emoji: "♌︎" },
  { key: "virgo", label: "Virgo", emoji: "♍︎" },
  { key: "libra", label: "Libra", emoji: "♎︎" },
  { key: "scorpio", label: "Scorpio", emoji: "♏︎" },
  { key: "sagittarius", label: "Sagittarius", emoji: "♐︎" },
  { key: "capricorn", label: "Capricorn", emoji: "♑︎" },
  { key: "aquarius", label: "Aquarius", emoji: "♒︎" },
  { key: "pisces", label: "Pisces", emoji: "♓︎" },
];

const genders = ["Male", "Female", "N/A"];

/** Helper: convert hex color like "#0f2a2a" to rgba using opacity 0..1 */
function hexToRgba(hex = "#000000", opacity = 1) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const EditProfileScreen = ({ navigation }) => {
  const dispatch=useDispatch()
  const { theme } = useTheme();
const { showToast } = useToast();
  //const { showError } = useError(); --- form state (you'll probably wire this to redux later) ---
  const [name, setName] = useState("");
  const [vibe, setVibe] = useState("");
  const [gender, setGender] = useState("N/A");
  const [dob, setDob] = useState(null); // Date object
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [institute, setInstitute] = useState("");
  const [profileLink, setProfileLink] = useState("");
  const [avatarUri, setAvatarUri] = useState(null);
  const [isSelected,setIsselected]=useState()
  const [zodiac, setZodiac] = useState(null);
  const [originalAvatar, setOriginalAvatar] = useState(null); // avatar from user.userData
  const user=useSelector(state=>state.user)

 useEffect(() => {
  if (user.userData) {
     
    setName(user.userData?.name || "");
    setVibe(user.userData?.bio || "");
    setGender(user.userData.gender || "N/A");
 setDob(user.userData.dob ? new Date(user.userData.dob) : null);

    setInstitute(user.userData.campus_id || "");
    setProfileLink(user.userData.profile_url || "");
    setZodiac(user.userData.zodiac || null);
    setAvatarUri(user.userData.avatar || null);
    setOriginalAvatar(user.userData.avatar || null);

  }
}, [user]);
  // zodiac modal
  const [zodiacModalVisible, setZodiacModalVisible] = useState(false);

  // Save feedback
  const [saving, setSaving] = useState(false);

  // Derived theme colors
  const inputBg = useMemo(
    () => hexToRgba(theme.components.box || "#ffffff", theme.opacity?.light ?? 1),
    [theme]
  );
  const cardBg = useMemo(
    () => hexToRgba(theme.components.card || "#ffffff", 1),
    [theme]
  );
 
  const borderCol = theme.components?.primary || "#cccccc";

  // calculate profile completion
  const progress = user.profileCompletion;

  // --- image picker (opens library then camera option) ---
  const openImagePicker = async () => {
    // Simple prompt: choose gallery or camera
    try {
        const res = await launchImageLibrary({
              mediaType: "photo",
              selectionLimit: 1,
              maxWidth: 800,
              maxHeight: 800,
              quality: 0.8,
            });
            if (!res.didCancel && res.assets && res.assets.length) {
              setAvatarUri(res.assets[0].uri);
              setIsselected(true)
            }
    } catch (error) {
      
    }
  
     
  };

  // Date change handler
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  // Save handler (calls localhost endpoint placeholder)
 const onSave = async () => {
  setSaving(true);

  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", vibe);
    formData.append("gender", gender);
if (dob) {
  formData.append("dob", dob.toISOString().slice(0, 10));
}
    formData.append("institute", institute);
    formData.append("profile_url", profileLink);
    formData.append("zodiac", zodiac);
if (avatarUri && avatarUri !== originalAvatar) {
  formData.append("avatar", {
    uri: avatarUri,
    type: "image/jpeg",
    name: "avatar.jpg",
  });
}

    const res = await api.post("/edit/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
 dispatch(updateUserData(res.data.user));
    setSaving(false);
   showToast("Profile Updated Successfully!", "success");
    navigation.goBack();
  } catch (err) {
    console.log("Profile update error:", err);
    setSaving(false);
    
showToast("Failed to update profile", "error");
   console.error("Error", err);
  }
};



  return (
    <ScreenBackground>
      <View  style={{ flex: 1 }}>
        <View style={[styles.header, { paddingHorizontal: 20 }]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={22} color={theme.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text.primary, marginLeft: 12 }]}>
              Edit Profile
            </Text>
          </View>

          <TouchableOpacity
            onPress={onSave}
            style={[styles.saveBtn, { backgroundColor: theme.gradients?.tab?.[0] || "#A45EE5" }]}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* progress card */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={[styles.cardTitle, { color: theme.text.primary }]}>Profile Progress</Text>
                <Text style={[styles.cardSub, { color: theme.text.secondary }]}>
                  {Math.round(progress * 100)}% completed
                </Text>
              </View>
              <View style={styles.progressOuter}>
                <View style={[styles.progressInner, { width: `${Math.round(progress * 100)}%`, backgroundColor: theme.gradients?.tab?.[0] || "#A45EE5" }]} />
              </View>
            </View>
          </View>

          {/* avatar + badges */}
          <View style={[styles.avatarSection]}>
            <View style={[styles.avatarCard, { backgroundColor: inputBg, borderColor: borderCol }]}>
              <TouchableOpacity onPress={openImagePicker} activeOpacity={0.8}>
                <View style={styles.avatarWrapper}>
                  {isSelected?
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  :
                  avatarUri ? (
                    <Image source={{ uri:avatarUri }} style={styles.avatarImage} />
                  ) : (
                    <Image   source={require("../assets/newframe.png")} style={styles.avatarImage} />
                  )}
                  {}
                  <View style={[styles.cameraFab, { backgroundColor: theme.gradients?.tab?.[0] || "#A45EE5" }]}>
                    <Icon name="camera" size={16} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Zodiac & Verified badges */}
              <View style={styles.badgeRow}>
                <TouchableOpacity
                  style={[styles.zodiacBadge, { backgroundColor: theme.polygonGradient?.[0] ? hexToRgba(theme.components.box || "#000", 0.12) : "#2D1B4E" }]}
                  onPress={() => setZodiacModalVisible(true)}
                >
                  <Text style={[styles.badgeText, { color: theme.text.primary }]}>
                    {zodiac ? `${ZODIAC.find(z => z.key === zodiac)?.emoji ?? ""} ${ZODIAC.find(z => z.key === zodiac)?.label ?? zodiac}` : "Select Zodiac"}
                  </Text>
                  <MaterialIcon name="star" size={14} color={theme.text.accent || "#A45EE5"} />
                </TouchableOpacity>
                  {user.userData?.is_verified?   <TouchableOpacity onPress={()=>{
                  navigation.navigate("UpdateEmail")
                }}
                  style={[styles.verifiedBadge, { backgroundColor: hexToRgba("#1B263B", 0.18) }]}>
                  <Text style={[styles.verifiedText, { color: theme.text.primary }]}>Verified</Text>
                  <MaterialIcon name="verified" size={14} color="green" />
                </TouchableOpacity>
                :<TouchableOpacity style={[styles.verifiedBadge, { backgroundColor: hexToRgba("#1B263B", 0.18) }]} onPress={()=>{
                  navigation.navigate("UpdateEmail")
                }}>
                  <Text style={[styles.verifiedText, { color: theme.text.primary }]}>Verify Email</Text>
                  <MaterialIcon name="cancel" size={14} color="red" />
                </TouchableOpacity>}
             
              </View>
            </View>
          </View>

          {/* form */}
          <View style={{ paddingHorizontal: 20 }}>
            <View style={[styles.fieldCard, { backgroundColor: inputBg, borderColor: borderCol }]}>
              <Text style={[styles.label, { color: theme.text.primary }]}>Name</Text>
              <TextInput
                placeholder="Enter your name"
                placeholderTextColor={theme.text.secondary}
                value={name}
                onChangeText={setName}
                style={[styles.input, { color: theme.text.primary, backgroundColor: inputBg }]}
              />

              <Text style={[styles.label, { color: theme.text.primary }]}>My Vibe</Text>
              <TextInput
                placeholder="Describe your vibe!"
                placeholderTextColor={theme.text.secondary}
                value={vibe}
                onChangeText={setVibe}
                multiline
                numberOfLines={3}
                maxLength={104}
                style={[styles.inputMultiline, { color: theme.text.primary, backgroundColor: inputBg,borderColor:
                  theme.text.primary
                 }]}
              />

              <Text style={[styles.label, { color: theme.text.primary }]}>Gender</Text>
              <View style={styles.segmentRow}>
                {genders.map(g => {
                  const active = g === gender;
                  return (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGender(g)}
                      style={[
                        styles.segmentBtn,
                        {
                          backgroundColor: active ? (theme.gradients?.tab?.[0] || "#A45EE5") : hexToRgba(theme.components.box || "#fff", 0.06),
                          borderColor: active ? theme.gradients?.tab?.[0] : hexToRgba(borderCol, 0.2),
                        },
                      ]}
                    >
                      <Text style={[styles.segmentText, { color: active ? "#fff" : theme.text.primary }]}>{g}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.label, { color: theme.text.primary, marginTop: 14 }]}>Date of Birth</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View style={[styles.input, { justifyContent: "center", backgroundColor: inputBg,borderColor:
                  theme.text.primary }]}>
                  <Text style={{ color: dob ? theme.text.primary : theme.text.secondary }}>
                    {dob ? dob.toDateString() : "Select Date of Birth"}
                  </Text>
                </View>
              </TouchableOpacity>

              <Text style={[styles.label, { color: theme.text.primary }]}>Campus Name</Text>
              <TouchableOpacity onPress={()=>{
                navigation.navigate("PickCampusProfile")
              }}>

              <TextInput
                placeholder="Enter Campus name"
                placeholderTextColor={theme.text.secondary}
                value={institute}
                editable={false}
                onChangeText={setInstitute}
                style={[styles.input, { color: theme.text.primary, backgroundColor: inputBg,borderColor:
                  theme.text.primary }]}
              />
              </TouchableOpacity>


              <Text style={[styles.label, { color: theme.text.primary }]}>Profile Link</Text>
              <TextInput
                placeholder="Enter profile link"
                placeholderTextColor={theme.text.secondary}
                value={profileLink}
                onChangeText={setProfileLink}
                style={[styles.input, { color: theme.text.primary, backgroundColor: inputBg,borderColor:
                  theme.text.primary }]}
              />
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Zodiac modal */}
        <Modal visible={zodiacModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Choose your Zodiac</Text>
                <TouchableOpacity onPress={() => setZodiacModalVisible(false)}>
                  <Icon name="x" size={22} color={theme.text.primary} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={ZODIAC}
                numColumns={3}
                keyExtractor={(item) => item.key}
                contentContainerStyle={{ paddingVertical: 10 }}
                renderItem={({ item }) => {
                  const selected = zodiac === item.key;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.zodiacItem,
                        { borderColor: selected ? theme.gradients?.tab?.[0] : hexToRgba(borderCol, 0.12), 
                          backgroundColor: selected ? hexToRgba(theme.gradients?.tab?.[0] || "#A45EE5", 0.12) : "transparent" },
                      ]}
                      onPress={() => {
                        setZodiac(item.key);
                        setZodiacModalVisible(false);
                      }}
                    >
                      <Text style={[styles.zodiacEmoji, { color: theme.text.primary }]}>{item.emoji}</Text>
                      <Text style={[styles.zodiacLabel, { color: theme.text.primary }]}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </Modal>

        {/* DateTimePicker */}
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={dob || new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={new Date()} // cannot pick future DOB
            onChange={onChangeDate}
          />
        )}
      </View>
    </ScreenBackground>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  header: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  saveBtnText: { color: "#fff", fontWeight: "700" },

  card: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 14, fontWeight: "700" },
  cardSub: { fontSize: 12, marginTop: 4 },

  progressOuter: {
    width: 120,
    height: 10,
    backgroundColor: "#222",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressInner: {
    height: "100%",
    borderRadius: 999,
  },

  avatarSection: { marginTop: 20, alignItems: "center" },
  avatarCard: {
    width: "90%",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
    borderWidth: 1,
  },
  avatarWrapper: { alignItems: "center", justifyContent: "center" },
  avatarImage: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cameraFab: {
    position: "absolute",
    right: -6,
    bottom: -6,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  badgeRow: { flexDirection: "row", marginTop: 6, alignItems: "center" },
  zodiacBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  badgeText: { marginRight: 6, fontWeight: "600" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  verifiedText: { marginRight: 6, fontWeight: "600" },

  fieldCard: {
    marginTop: 18,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },

  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 0,
  },
  inputMultiline: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
    minHeight: 84,
    textAlignVertical: "top",
    borderWidth: 1,
  },

  segmentRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  segmentBtn: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  segmentText: { fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "70%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
    borderWidth: 1,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  modalTitle: { fontSize: 16, fontWeight: "700" },

  zodiacItem: {
    flexBasis: "30%",
    margin: "1.5%",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  zodiacEmoji: { fontSize: 22, marginBottom: 6 },
  zodiacLabel: { fontSize: 12, fontWeight: "600" },
});
