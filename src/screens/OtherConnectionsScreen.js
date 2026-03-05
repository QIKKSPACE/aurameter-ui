// screens/OtherConnectionsScreen.js
import React, { useEffect, useState } from "react";
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

// Pass the userId of the target user as a prop or route param
const OtherConnectionsScreen = ({ route }) => {
  const { theme } = useTheme();
  const { userId } = route.params; // id of the user whose connections we want

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConnections = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://YOUR_API_BASE/connections?userId=${userId}`, {
        headers: {
          Authorization: `Bearer YOUR_AUTH_TOKEN_HERE`, // send auth token
        },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setConnections(data);
    } catch (err) {
      console.error("Fetch connections failed", err);
      setError(err.message || "Failed to fetch connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [userId]);

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.components.card, opacity: theme.opacity.light },
      ]}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.user, { color: theme.text.primary }]}>{item.username}</Text>
        <Text style={[styles.status, { color: theme.text.secondary }]}>Connection</Text>
      </View>
      <View style={styles.auraBadge}>
        <Text style={[styles.auraText, { color: theme.text.accent }]}>🔥 {item.aura}</Text>
      </View>
    </View>
  );

  // Loader
  if (loading && connections.length === 0) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.text.primary} />
          <Text style={{ color: theme.text.secondary, marginTop: 10 }}>Loading connections...</Text>
        </View>
      </ScreenBackground>
    );
  }

  // Error
  if (error && connections.length === 0) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <Text style={{ color: theme.text.primary, marginBottom: 12 }}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.components.button }]}
            onPress={fetchConnections}
          >
            <Text style={{ color: theme.text.button }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Connections</Text>
        </View>

        {/* List */}
        <FlatList
          data={connections}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </View>
    </ScreenBackground>
  );
};

export default OtherConnectionsScreen;

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
