import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch, useSelector } from "react-redux";
import { fetchConnections } from "../../store/connectSlice";

const TEN_MIN = 10 * 60 * 1000;

export default function ConnectionModal({
  visible,
  onClose,
  theme,
  onTagUser,
  type = "connections",
}) {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.connect[type]);
  const { data, loading, error, lastFetchedAt } = state;

  const [search, setSearch] = useState("");
  const [taggedUser, setTaggedUser] = useState(null);

  // Fetch connections if older than 10 min
  useEffect(() => {
    const now = Date.now();
    const lastFetchedTime = lastFetchedAt ? new Date(lastFetchedAt).getTime() : 0;

    if (!lastFetchedAt || now - lastFetchedTime > TEN_MIN) {
      dispatch(fetchConnections({ type }));
    }
  }, [lastFetchedAt, dispatch, type]);

  // Filtered users based on search
  const filteredData = useMemo(() => {
    if (!search.trim()) return data || [];
    return (data || []).filter((user) =>
      user.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  const handleTag = (user) => {
    setTaggedUser(user);
    onTagUser && onTagUser(user);
  };

  const removeTag = () => {
    setTaggedUser(null);
    onTagUser && onTagUser(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.components.card,
          opacity: theme.opacity.light,
        },
      ]}
      onPress={() => handleTag(item)}
      disabled={!!taggedUser} // Only one tag allowed
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.username, { color: theme.text.primary }]}>
          {item.username}
        </Text>
      </View>
      <View style={styles.auraBadge}>
        <Text style={[styles.auraText, { color: theme.text.accent }]}>
          🔥 {item.aura}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.components.card }]}>
          {/* Close */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Icon name="close" size={26} color={theme.text.primary} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text.primary }]}>Tag a Friend</Text>

          {/* Tagged user pill */}
          {taggedUser && (
            <View style={[styles.tagPill, { backgroundColor: theme.components.button }]}>
              <Text style={{ color: theme.text.primary, marginRight: 8 }}>
                {taggedUser.username}
              </Text>
              <TouchableOpacity onPress={removeTag}>
                <Icon name="close-circle" size={20} color={theme.text.primary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Search bar */}
          {!taggedUser && (
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.components.input, color: theme.text.primary }]}
              placeholder="Search..."
              placeholderTextColor={theme.text.secondary}
              value={search}
              onChangeText={setSearch}
            />
          )}

          {/* Loader */}
          {loading && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={theme.text.accent} />
              <Text style={{ color: theme.text.secondary, marginTop: 10 }}>
                Loading {type}...
              </Text>
            </View>
          )}

          {/* Error */}
          {!loading && error && (
            <View style={styles.centered}>
              <Icon name="alert-circle-outline" size={40} color={theme.text.accent} />
              <Text style={{ color: theme.text.primary, marginVertical: 12 }}>
                Failed to load {type}
              </Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: theme.components.button }]}
                onPress={() => dispatch(fetchConnections({ type }))}
              >
                <Text style={{ color: theme.text.button }}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List */}
          {!loading && !error && !taggedUser && (
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 14,
    padding: 16,
    maxHeight: "80%",
  },
  closeBtn: {
    alignSelf: "flex-end",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
  },
  auraBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,140,0,0.12)",
  },
  auraText: {
    fontSize: 14,
    fontWeight: "600",
  },
  searchInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
});
