// screens/SearchScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";

import debounce from "lodash.debounce";
import api from "../services/api";
import AppText from "../components/AppText";

const SearchScreen = ({navigation}) => {
  const { theme } = useTheme();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // ----------------------------
  // 🔍 API Search (Debounced)
  // ----------------------------
  const searchUsers = async (text) => {
    if (text.trim() === "") {
      setResults([]);
      return;
    }

    try {
      const res = await api.get(`/auth/searchUsers?query=${text}`);
      setResults(res.data?.users || []);
    } catch (err) {
      console.error("Search error", err);
    }
  };

  const debouncedSearch = useCallback(debounce(searchUsers, 400), []);

  const onChangeQuery = (text) => {
    setQuery(text);
    debouncedSearch(text);
  };

  // ----------------------------
  // Cancel Button
  // ----------------------------
  const onCancel = () => {
    setQuery("");
    setResults([]);
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.components.card, opacity: theme.opacity.light },
      ]}
      onPress={()=>{navigation.navigate("OtherProfile",{userId:item?.id})}}
    >
      {item.avatar?
         <Image source={{ uri: `${item.avatar}` }} style={styles.avatar} />
         :
            <Image source={require("../assets/login.png")} style={styles.avatar} />
      }
   

      <View style={{ flex: 1 }}>
        <AppText style={[styles.user, { color: theme.text.primary }]} variant="body">
          {item.username}
        </AppText>
      </View>

      {/* Aura points */}
      <View style={styles.auraContainer}>
        <Text style={[styles.auraText, { color: theme.text.primary }]}>
          {item.aura}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenBackground>
      <View style={{ flex: 1 }}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={18} color={theme.text.secondary} />

          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Search"
            placeholderTextColor={theme.text.secondary}
            style={[styles.searchInput, { color: theme.text.primary }]}
          />

          {/* Cancel Button */}
          {query.length > 0 && (
            <TouchableOpacity onPress={onCancel}>
              <Text style={{ color: theme.text.secondary, fontSize: 14, marginLeft: 6 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results */}
        <FlatList
          data={results}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </View>
    </ScreenBackground>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 12,
    margin: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
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
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  user: {
    fontSize: 16,
  },
  auraContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(128,0,255,0.1)",
  },
  auraText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
