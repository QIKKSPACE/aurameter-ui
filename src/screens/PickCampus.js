import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
  BackHandler,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import Icon from "react-native-vector-icons/Feather";
import { useFocusEffect } from "@react-navigation/native";
import AppText from "../components/AppText";

const PickCampus = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user, accessToken, refreshToken } = route.params;
  const [campuses, setCampuses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  

 useEffect(() => {
  fetchCampuses();

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 400,
    useNativeDriver: true,
  }).start();
}, []);
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
    if (!search.trim()) return setFiltered(campuses);
    const lower = search.toLowerCase();
    setFiltered(
      campuses.filter(
        (item) =>
          item.name?.toLowerCase().includes(lower) ||
          item.city?.toLowerCase().includes(lower)
      )
    );
  }, [search, campuses]);

  const handleNext = () => {  
    navigation.navigate("ThemeOnboarding", {
      user,
      accessToken,
      refreshToken,
      campusId: selected?.id || null,
    });
  };
useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      // Block back action
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove(); // ✅ use remove() on subscription
  }, [])
)
  const renderCampus = ({ item }) => {
    const isSelected = selected?.id === item.id;
    return (
      <TouchableOpacity
        onPress={() => setSelected(item)}
        style={[
          styles.campusCard,
          {
            backgroundColor: isSelected ? theme.text.accent : theme.components.card,
            borderColor: isSelected ? theme.text.accent : theme.components.border,
            shadowColor: isSelected ? theme.text.accent : "#000",
          },
        ]}
      >
        <View>
          <AppText
          variant="h4"
            style={[
              styles.campusName,
              { color: isSelected ? theme.background.color : theme.text.primary },
            ]}
          >
            {item.name}
          </AppText>
          {item.city && (
            <Text
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
            </Text>
          )}
        </View>
        {isSelected && <Icon name="check-circle" size={22} color={theme.background.color} />}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenBackground>
      <View style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.container}>
          {/* Title */}
          <AppText style={[styles.title, { color: theme.text.primary }]} variant="h3">
            Pick Your Campus
          </AppText>
          <AppText style={[styles.subtitle, { color: theme.text.secondary }]} variant="caption">
            Find and vibe with your tribe 🌍
          </AppText>

          {/* Search */}
          <View
            style={[
              styles.searchBox,
              { backgroundColor: theme.components.card, borderColor: theme.components.border },
            ]}
          >
            <Icon name="search" size={16} color={theme.text.secondary} style={{ marginRight: 6 }} />
            <TextInput
              placeholder="Search your campus..."
              placeholderTextColor={theme.text.secondary + "99"}
              value={search}
              onChangeText={setSearch}
              style={[styles.searchInput, { color: theme.text.primary }]}
            />
          </View>

          {/* Campus List */}
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            {loading ? (
              <ActivityIndicator size="large" color={theme.text.accent} style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={renderCampus}
              />
            )}

            {/* Checkbox-style "My campus is not listed" */}
            <View style={{ marginTop: 10, marginBottom: 80 }}>
              <TouchableOpacity
                onPress={() => setSelected({ id: null, name: "My campus is not listed" })}
                style={styles.checkboxRow}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: selected?.id === null ? theme.text.accent : theme.components.border,
                      backgroundColor: selected?.id === null ? theme.text.accent : "transparent",
                    },
                  ]}
                >
                  {selected?.id === null && <Icon name="check" size={14} color={theme.background.color} />}
                </View>
                <AppText style={[styles.checkboxLabel, { color: theme.text.primary }]} variant="h4">
                  My campus is not listed
                </AppText>
              </TouchableOpacity>

              {/* Link text */}
              <TouchableOpacity onPress={() => console.log("List your campus clicked")} activeOpacity={0.7}>
                <AppText style={[styles.linkText, { color: theme.text.accent }]} variant="button">
                  List your campus on Aurameter & become the campus Founder
                </AppText>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: selected !== null ? theme.text.accent : theme.components.border,
              },
            ]}
            disabled={selected === null}
            onPress={handleNext}
          >
            <AppText
            variant="button"
              style={{
                color: selected !== null ? theme.background.color : theme.text.secondary,
              
                marginRight: 6,
                fontSize: 15,
              }}
            >
              Next
            </AppText>
            <Icon
              name="arrow-right"
              size={16}
              color={selected !== null ? theme.background.color : theme.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScreenBackground>
  );
};

export default PickCampus;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 30 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 13, textAlign: "center", marginBottom: 18 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    marginBottom: 15,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: "500" },
  campusCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  campusName: { fontSize: 15 },
  campusCity: { fontSize: 12, marginTop: 2 },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxLabel: { marginLeft: 10, fontSize: 15, },
  linkText: { marginTop: 6, fontSize: 14, fontWeight: "500", textDecorationLine: "underline"},
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
