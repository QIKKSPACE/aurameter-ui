// components/GlobalLeaderboard.js
import React from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "../constants/context/ThemeContext";
import AppText from "./AppText";
import { useSelector } from "react-redux";



const MEDALS = ["🥇", "🥈", "🥉"];

const FollowingLeaderboard = ({ navigation, isProfileCompletion }) => {
  const { theme } = useTheme();
  const { data, loading, error,lastFetched } = useSelector(
    state => state.leaderboard.following
  );

  const renderRank = (rank) => {
    if (rank <= 3) {
      return <AppText style={styles.medal}>{MEDALS[rank - 1]}</AppText>;
    }

    return (
      <AppText style={[styles.rankText, { color: theme.text.secondary }]}>
        #{rank}
      </AppText>
    );
  };

  const renderItem = ({ item, index }) => {
    const rank = index + 1;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.card,
          {
            backgroundColor: theme.components?.card,
            shadowColor: theme.shadow || "#000",
            opacity:theme?.opacity.light
          },
        ]}
        onPress={() => {
          if (!isProfileCompletion) {
            navigation.navigate("OtherProfile", { userId: item.id });
          }
        }}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>{renderRank(rank)}</View>

        {/* Avatar */}
        <Image source={{ uri: item.avatar }} style={styles.avatar} />

        {/* Username */}
        <View style={styles.infoContainer}>
          <AppText
            style={[styles.user, { color: theme.text.primary }]}
            variant="h4"
            numberOfLines={1}
          >
            {item.username}
          </AppText>
        </View>

        {/* Aura */}
        <View style={styles.auraContainer}>
              <Image
            source={require("../assets/newframe.png")}
            style={[
              styles.auraIcon,
              { tintColor: theme.text.secondary },
            ]}
          />
          <AppText
            style={[styles.auraValue, { color: theme.text.primary }]}
            variant="body"
          >
            {item.aura}
          </AppText>

        
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 14,

    // Premium depth
    elevation: 4,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  rankContainer: {
    width: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  rankText: {
    fontSize: 14,
    fontWeight: "700",
  },

  medal: {
    fontSize: 20,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginHorizontal: 12,
  },

  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },

  user: {
    fontWeight: "700",
    fontSize: 16,
  },

  auraContainer: {
    flexDirection:'row',
    alignItems: "center",
    justifyContent: "center",
  },

  auraValue: {
    fontWeight: "700",
    fontSize: 14,
  },

  auraIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    opacity: 0.85,
  },
});

export default FollowingLeaderboard;
