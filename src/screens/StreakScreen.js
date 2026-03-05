// screens/StreakScreen.js
import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import Icon from "react-native-vector-icons/Feather";

const streaks = [
  { id: "1", type: "Chat Streak", icon: "message-circle", days: 5 },
  { id: "2", type: "Story View Streak", icon: "play-circle", days: 3 },
  { id: "3", type: "IRL Streak", icon: "map-pin", days: 2 },
  { id: "4", type: "Walk Streak", icon: "activity", days: 4 },
];

const StreakScreen = ({ route }) => {
  const { friend } = route.params;
  const { theme } = useTheme();

  const renderStreak = ({ item }) => (
    <View
      style={[
        styles.streakCard,
        { backgroundColor: theme.components.card, opacity: theme.opacity.light },
      ]}
    >
      <Icon name={item.icon} size={28} color={theme.text.accent} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={[styles.streakType, { color: theme.text.primary }]}>
          {item.type}
        </Text>
        <Text style={[styles.streakDays, { color: theme.text.secondary }]}>
          {item.days} days 🔥
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenBackground>
      <View edges={["top"]} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            Your Streaks With {friend.name} 
          </Text>
        </View>

        {/* Streak List */}
        <FlatList
          data={streaks}
          renderItem={renderStreak}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </ScreenBackground>
  );
};

export default StreakScreen;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    padding: 14,
  },
  streakType: {
    fontSize: 16,
    fontWeight: "600",
  },
  streakDays: {
    fontSize: 13,
    marginTop: 2,
  },
});
