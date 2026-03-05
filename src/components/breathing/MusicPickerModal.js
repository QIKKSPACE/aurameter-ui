import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

const MusicPickerModal = ({
  visible,
  loading,
  query,
  setQuery,
  results,
  onSearch,
  onSelect,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <LinearGradient colors={["#0D1B2A", "#1B2C3A"]} style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Music</Text>
            <Text style={styles.subtitle}>
              Pick something gentle to breathe with
            </Text>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search calming music..."
              placeholderTextColor="#8FA3B8"
              style={styles.input}
              onSubmitEditing={onSearch}
              returnKeyType="search"
            />

            <TouchableOpacity
              style={[
                styles.searchBtn,
                !query && { opacity: 0.5 },
              ]}
              onPress={onSearch}
              disabled={!query}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#0D1B2A" />
              ) : (
                <Text style={styles.searchIcon}>🔍</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Results */}
          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#00E5FF" />
              <Text style={styles.loadingText}>
                Finding something calm…
              </Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.85}
                >
                  <View style={styles.itemDot} />
                  <Text style={styles.itemText} numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Close */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>

        </LinearGradient>
      </View>
    </Modal>
  );
};

export default MusicPickerModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },

  container: {
    height: "88%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  header: {
    marginBottom: 18,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#9FB0C3",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  input: {
    flex: 1,
    height: 48,
    borderRadius: 30,
    paddingHorizontal: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    fontSize: 15,
  },

  searchBtn: {
    marginLeft: 10,
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: "#00E5FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00E5FF",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  searchIcon: {
    fontSize: 18,
    color: "#0D1B2A",
  },

  loaderWrap: {
    marginTop: 40,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#9FB0C3",
    fontSize: 14,
  },

  list: {
    paddingBottom: 40,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00E5FF",
    marginRight: 12,
  },

  itemText: {
    color: "#FFFFFF",
    fontSize: 15,
    flex: 1,
  },

  closeBtn: {
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  closeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
