// screens/PickCampusProfile.js

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
  Linking,
  Alert,
} from "react-native";

import firestore from "@react-native-firebase/firestore";
import Icon from "react-native-vector-icons/Feather";

import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import AppText from "../components/AppText";

import { useDispatch, useSelector } from "react-redux";
import api from "../services/api";
import { updateUserData } from "../store/userSlice";
import { useToast } from "../constants/context/ErrorContext";




const PickCampusProfile = ({ navigation }) => {
  const { theme } = useTheme();

  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.userData);

  const [campuses, setCampuses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [canUpdateCampus, setCanUpdateCampus] = useState(true);
const { showToast } = useToast();

  const fadeAnim = useRef(new Animated.Value(0)).current;

 useEffect(() => {
  fetchCampuses();

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 400,
    useNativeDriver: true,
  }).start();
}, []);

useEffect(() => {
    //console.log("Checking campus update cooldown...",user?.last_campus_updated);
  checkCampusCooldown();
}, [user?.last_campus_updated]);

  const checkCampusCooldown = () => {
    if (!user?.last_campus_updated) {
      setCanUpdateCampus(true);
      return;
    }

    const lastUpdated = new Date(user.last_campus_updated);
    const now = new Date();

    const oneYearLater = new Date(lastUpdated);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    if (now < oneYearLater) {
      setCanUpdateCampus(false);
    } else {
      setCanUpdateCampus(true);
    }
  };

  const fetchCampuses = async () => {
    try {
      setLoading(true);

     const snapshot = await firestore()
  .collection("colleges")
  .where("is_approved", "==", true)
  .get();

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCampuses(data);
      setFiltered(data);
    } catch (err) {
      console.log("Error fetching colleges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(campuses);
      return;
    }

    const lower = search.toLowerCase();

    setFiltered(
      campuses.filter(
        (item) =>
          item.name?.toLowerCase().includes(lower) ||
          item.city?.toLowerCase().includes(lower)
      )
    );
  }, [search, campuses]);

  const handleNext = async () => {
    try {
      if (!selected?.id) return;

      setUpdating(true);

      await api.post("/user/edit-campus", {
        campusId: selected.id,
      });

      dispatch(
        updateUserData({
          campus_id: selected.id,
          campus_name: selected.name,
          last_campus_updated: new Date().toISOString(),
        })
      );

      showToast("Campus updated successfully", "success");

      navigation.goBack();
    } catch (err) {
      console.log(err);
showToast( `Failed to update campus`, "error");
      
    } finally {
      setUpdating(false);
    }
  };

  const renderCampus = ({ item }) => {
    const isSelected = selected?.id === item.id;

    return (
      <TouchableOpacity
        disabled={!canUpdateCampus}
        onPress={() => setSelected(item)}
        style={[
          styles.campusCard,
          {
            backgroundColor: isSelected
              ? theme.text.accent
              : theme.components.card,

            borderColor: isSelected
              ? theme.text.accent
              : theme.components.border,

            shadowColor: isSelected
              ? theme.text.accent
              : "#000",

            opacity: canUpdateCampus ? 1 : 0.6,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <AppText
            variant="h4"
            style={[
              styles.campusName,
              {
                color: isSelected
                  ? theme.background.color
                  : theme.text.primary,
              },
            ]}
          >
            {item.name}
          </AppText>

          {item.city && (
            <AppText
              variant="caption"
              style={[
                styles.campusCity,
                {
                  color: isSelected
                    ? theme.background.color + "CC"
                    : theme.text.secondary,
                },
              ]}
            >
              {item.city}
            </AppText>
          )}
        </View>

        {isSelected && (
          <Icon
            name="check-circle"
            size={22}
            color={theme.background.color}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenBackground>
      <View style={styles.safeArea}>
        <View style={styles.container}>
          {/* Title */}
          <AppText
            style={[
              styles.title,
              { color: theme.text.primary },
            ]}
            variant="h3"
          >
            Pick Your Campus
          </AppText>

          <AppText
            style={[
              styles.subtitle,
              { color: theme.text.secondary },
            ]}
            variant="caption"
          >
            Find and vibe with your tribe 🌍
          </AppText>

          {/* WARNING */}
          {!canUpdateCampus && (
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor:
                    theme.components.card,

                  borderColor:
                    theme.components.border,
                },
              ]}
            >
              <Icon
                name="alert-circle"
                size={16} 
                color={theme.text.accent}
                style={{ marginRight: 8 }}
              />

              <AppText
                variant="caption"
                style={{
                  color: theme.text.primary,
                  flex: 1,
                }}
              >
                You can only update your campus once
                each year
              </AppText>
            </View>
          )}

          {/* Search */}
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor:
                  theme.components.card,

                borderColor:
                  theme.components.border,

                opacity: canUpdateCampus ? 1 : 0.6,
              },
            ]}
          >
            <Icon
              name="search"
              size={16}
              color={theme.text.secondary}
              style={{ marginRight: 6 }}
            />

            <TextInput
              editable={canUpdateCampus}
              placeholder="Search your campus..."
              placeholderTextColor={
                theme.text.secondary + "99"
              }
              value={search}
              onChangeText={setSearch}
              style={[
                styles.searchInput,
                { color: theme.text.primary },
              ]}
            />
          </View>

          {/* Campus List */}
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
            }}
          >
            {loading ? (
              <ActivityIndicator
                size="large"
                color={theme.text.accent}
                style={{ marginTop: 20 }}
              />
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 20,
                }}
                renderItem={renderCampus}
              />
            )}

            {/* Campus Not Listed */}
            <View
              style={{
                marginTop: 10,
                marginBottom: 80,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    "https://aurameter.in"
                  )
                }
                activeOpacity={0.7}
              >
                <AppText
                  style={[
                    styles.linkText,
                    {
                      color: theme.text.accent,
                    },
                  ]}
                  variant="button"
                >
                  List your campus on Aurameter &
                  become the campus Founder
                </AppText>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Next Button */}
          <TouchableOpacity
            disabled={
              selected === null ||
              updating ||
              !canUpdateCampus
            }
            activeOpacity={0.8}
            style={[
              styles.nextButton,
              {
                backgroundColor:
                  selected !== null &&
                  canUpdateCampus
                    ? theme.text.accent
                    : theme.components.border,

                opacity: updating ? 0.7 : 1,
              },
            ]}
            onPress={handleNext}
          >
            {updating ? (
              <ActivityIndicator
                color={theme.background.color}
              />
            ) : (
              <>
                <AppText
                  variant="button"
                  style={{
                    color:
                      selected !== null &&
                      canUpdateCampus
                        ? theme.background.color
                        : theme.text.secondary,

                    marginRight: 6,
                    fontSize: 15,
                  }}
                >
                  Next
                </AppText>

                <Icon
                  name="arrow-right"
                  size={16}
                  color={
                    selected !== null &&
                    canUpdateCampus
                      ? theme.background.color
                      : theme.text.secondary
                  }
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScreenBackground>
  );
};

export default PickCampusProfile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 30,
  },

  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 18,
  },

  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical:
      Platform.OS === "ios" ? 10 : 6,
    marginBottom: 15,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },

  campusCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },

  campusName: {
    fontSize: 15,
  },

  campusCity: {
    fontSize: 12,
    marginTop: 2,
  },

  linkText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },

  nextButton: {
    position: "absolute",
    bottom: 20,
    left: 18,
    right: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 12,
    paddingVertical: 12,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});