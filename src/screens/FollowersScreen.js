// screens/FollowersScreen.js
import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import { useSelector, useDispatch } from "react-redux";
import { fetchConnections } from "../store/connectSlice";
import { SafeAreaView } from "react-native-safe-area-context";

const TEN_MIN = 10 * 60 * 1000;

const FollowersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const followersState = useSelector((state) => state.connect.followers);
  const { data: followers, loading, error, lastFetchedAt } = followersState;

  // Decide if we need to fetch
  useEffect(() => {
    const now = Date.now();
    const lastFetchedTime = lastFetchedAt ? new Date(lastFetchedAt).getTime() : 0;

    if (!lastFetchedAt || now - lastFetchedTime > TEN_MIN) {
      dispatch(fetchConnections({ type: "followers" }));
    }
  }, [lastFetchedAt, dispatch]);

  const renderFollower = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.components.card, opacity: theme.opacity.light },
      ]}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.user, { color: theme.text.primary }]}>{item.username}</Text>
      </View>
      {/* Aura points badge */}
      <View style={styles.auraBadge}>
        <Text style={[styles.auraText, { color: theme.text.accent }]}>🔥 {item.aura}</Text>
      </View>
    </TouchableOpacity>
  );

  // Loader state
  if (loading && (!followers || followers.length === 0)) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.text.primary} />
          <Text style={{ color: theme.text.secondary, marginTop: 10 }}>Loading followers...</Text>
        </View>
      </ScreenBackground>
    );
  }

  // Error state
  if (error && (!followers || followers.length === 0)) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <Text style={{ color: theme.text.primary, marginBottom: 12 }}>
            Failed to load followers
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.components.button }]}
            onPress={() => dispatch(fetchConnections({ type: "followers" }))}
          >
            <Text style={{ color: theme.text.button }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View  style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Followers</Text>
        </View>

        {/* Followers List */}
        <FlatList
          data={followers}
          renderItem={renderFollower}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </View>
    </ScreenBackground>
  );
};

export default FollowersScreen;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  user: {
    fontSize: 16,
    fontWeight: "600",
  },
  status: {
    fontSize: 13,
    marginTop: 2,
  },
  auraBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,140,0,0.1)",
  },
  auraText: {
    fontSize: 14,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
