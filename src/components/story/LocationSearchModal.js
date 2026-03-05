import React, { useEffect, useState, useRef } from "react";
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
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function LocationSearchModal({
  visible,
  onClose,
  onSelectLocation,
  theme,
}) {
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchTimeout = useRef(null);

  useEffect(() => {
    if (!locationQuery) {
      setLocationResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://api.aurameter.in/places/autocomplete?query=${encodeURIComponent(
            locationQuery
          )}`
        );

        if (!res.ok) throw new Error("Failed to fetch locations");

        const data = await res.json();
        setLocationResults(data || []);
      } catch (e) {
        console.log("Location search error", e);
        setLocationResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [locationQuery]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.components.card },
          ]}
        >
          {/* Close */}
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={26} color={theme.text.primary} />
          </TouchableOpacity>

          <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
            Search Location
          </Text>

          {/* Selected location pill */}
          {selectedLocation && (
            <View
              style={[
                styles.selectedLocation,
                { backgroundColor: theme.components.cardAlt },
              ]}
            >
              <Icon
                name="map-marker"
                size={18}
                color={theme.text.accent}
                style={{ marginRight: 8 }}
              />

              <Text
                style={[
                  styles.selectedLocationText,
                  { color: theme.text.primary },
                ]}
                numberOfLines={1}
              >
                {selectedLocation}
              </Text>

              <TouchableOpacity
              onPress={() => {
  setSelectedLocation(null);
  setLocationQuery("");
  setLocationResults([]);
  onSelectLocation(null); // 🔥 notify parent
}}
                style={styles.clearButton}
              >
                <Icon name="close" size={18} color={theme.text.muted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Search input */}
          {!selectedLocation && (
            <TextInput
              value={locationQuery}
              onChangeText={setLocationQuery}
              placeholder="Search city, place, address"
              placeholderTextColor="#999"
              style={[
                styles.searchInput,
                {
                  color: theme.text.primary,
                  borderColor: theme.text.muted,
                },
              ]}
            />
          )}

          {/* Results */}
          {!selectedLocation && (
            <>
              {isLoading ? (
                <ActivityIndicator color={theme.text.accent} />
              ) : (
                <FlatList
                  data={locationResults}
                  keyExtractor={(item) =>
                    item.place_id ?? Math.random().toString()
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.locationItem}
                      onPress={() => {
                        setSelectedLocation(item.description);
                        setLocationQuery("");
                        setLocationResults([]);
                      }}
                    >
                      <Icon
                        name="map-marker"
                        size={18}
                        color={theme.text.muted}
                        style={{ marginRight: 10 }}
                      />
                      <Text
                        style={[
                          styles.locationText,
                          { color: theme.text.primary },
                        ]}
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </>
          )}

          {/* Confirm */}
          {selectedLocation && (
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: theme.text.accent },
              ]}
              onPress={() => {
                onSelectLocation(selectedLocation);
                onClose();
              }}
            >
              <Text style={styles.confirmText}>Confirm location</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  locationText: {
    fontSize: 16,
    flex: 1,
  },
  selectedLocation: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  selectedLocationText: {
    flex: 1,
    fontSize: 15,
  },
  clearButton: {
    padding: 4,
  },
  confirmButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
