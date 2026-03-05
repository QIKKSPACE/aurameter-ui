// screens/EarnAuraPointsScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import NewIcon from "@react-native-vector-icons/material-icons";

const auraTasks = [
  { id: "1", title: "Relax your mind, increase your aura", icon: "meditation", points: "Get 10+ Aura points" },
  { id: "2", title: "Speed up your Aura energy", icon: "speedometer", points: "Get 10+ Aura points" },
  { id: "3", title: "Stay sharp, boost your aura", icon: "timer-sand", points: "Get 10+ Aura points" },
];

const brands = [
  { id: "1", name: "Amazon", color: "#FFB703", icon: "facebook" },
  { id: "2", name: "Nykaa", color: "#FF3EB5", icon: "flower" },
  { id: "3", name: "Paytm", color: "#00BFFF", icon: "credit-card" },
  { id: "4", name: "Amazon", color: "#FFB703", icon: "facebook" },
  { id: "5", name: "Nykaa", color: "#FF3EB5", icon: "flower" },
  { id: "6", name: "Paytm", color: "#00BFFF", icon: "credit-card" },
  { id: "7", name: "Amazon", color: "#FFB703", icon: "facebook" },
  { id: "8", name: "Nykaa", color: "#FF3EB5", icon: "flower" },
  { id: "9", name: "Paytm", color: "#00BFFF", icon: "credit-card" },
  { id: "10", name: "Amazon", color: "#FFB703", icon: "facebook" },
  { id: "11", name: "Nykaa", color: "#FF3EB5", icon: "flower" },
  { id: "12", name: "Paytm", color: "#00BFFF", icon: "credit-card" },
];

const EarnAuraPointsScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const renderAuraTask = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.taskCard,
        { borderColor: theme.text.accent, backgroundColor: theme.components.card },
      ]}
    >
      <MaterialCommunityIcons
        name={item.icon}
        size={40}
        color={theme.text.accent}
        style={{ marginBottom: 5 }}
      />
      <Text style={[styles.taskTitle, { color: theme.text.primary }]}>
        {item.title}
      </Text>
      <Text style={[styles.taskPoints, { color: theme.text.accent }]}>
        {item.points}
      </Text>
    </TouchableOpacity>
  );

  const renderBrand = ({ item }) => (
    <TouchableOpacity
      style={[styles.brandCard, { backgroundColor: `${item.color}CC` }]}
    >
      <MaterialCommunityIcons
        name={item.icon}
        size={40}
        color="#fff"
        style={{ marginBottom: 5 }}
      />
      <Text style={styles.brandOffer}>Get 19% Off</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenBackground>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 15 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Section */}
          <View style={styles.profileRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={28} color={theme.text.primary} />
            </TouchableOpacity>
            <Image
              source={{ uri: "https://picsum.photos/100" }}
              style={[styles.profilePic, { marginLeft: 5 }]}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.username, { color: theme.text.primary }]}>
                Alok
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <View style={styles.statRow}>
                    <NewIcon name="whatshot" size={16} color="#ff6347" />
                    <Text style={styles.statText}>150</Text>
                  </View>
                  <Text style={styles.statLabel}>Aura</Text>
                </View>

                <View style={styles.statBox}>
                  <View style={styles.statRow}>
                    <Icon name="star" size={16} color="#A45EE5" />
                    <Text style={styles.statText}>150</Text>
                  </View>
                  <Text style={styles.statLabel}>Redeem</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Search Bar */}
          <View
            style={[
              styles.searchBar,
              { backgroundColor: theme.components.card, opacity: theme.opacity.light },
            ]}
          >
            <Icon name="search" size={20} color={theme.text.secondary} />
            <TextInput
              placeholder="Search your favorite brand"
              placeholderTextColor={theme.text.secondary}
              style={styles.searchInput}
            />
          </View>

          {/* Earn Aura Points */}
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Earn Aura Points
          </Text>
          <FlatList
            data={auraTasks}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderAuraTask}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 10 }}
            style={{ height: 180 }} // 👈 fixed height so it won't shrink
          />

          {/* Popular Brands */}
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Popular Brands
          </Text>
          <FlatList
            data={brands}
            numColumns={3}
            renderItem={renderBrand}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 15,
            }}
            scrollEnabled={false} // 👈 let parent ScrollView handle scroll
            contentContainerStyle={{
                paddingBottom:20
            }}
          />
        </ScrollView>
      </View>
    </ScreenBackground>
  );
};

export default EarnAuraPointsScreen;

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profilePic: { width: 60, height: 60, borderRadius: 30 },
  profileInfo: { marginLeft: 10 },
  username: { fontSize: 18, fontWeight: "bold" },
  statsRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  statBox: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#222",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },
  statLabel: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 3,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchInput: { marginLeft: 8, flex: 1, color: "#fff" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  taskCard: {
    width: 160,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  taskTitle: { fontSize: 13, marginVertical: 6, textAlign: "center" },
  taskPoints: { fontSize: 12, fontWeight: "bold" },
  brandCard: {
    flex: 1,
    alignItems: "center",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
  },
  brandOffer: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
});
