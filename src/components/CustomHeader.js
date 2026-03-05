// components/CustomHeader.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

const TABS = ["Post", "News"];

const CustomHeader = ({ activeTab, setActiveTab }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {/* Left: Avatar -> open drawer */}
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=31" }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {/* Center */}
      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          Ahead
        </Text>

        <View style={styles.subTabs}>
          {TABS.map((tab, index) => (
            <React.Fragment key={tab}>
              <TouchableOpacity
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.subTabButton,
                  activeTab === tab && {
                    borderBottomWidth: 2,
                    borderBottomColor: theme.text.accent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.subTabText,
                    {
                      color:
                        activeTab === tab
                          ? theme.text.accent
                          : theme.text.secondary,
                    },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>

              {/* Divider between tabs */}
              {index < TABS.length - 1 && (
                <View
                  style={[
                    styles.verticalLine,
                    { backgroundColor: theme.components.border },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Right */}
      <View style={styles.headerRight}>
        <Feather
          name="message-circle"
          size={22}
          color={theme.text.primary}
          style={{ marginRight: 16 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  subTabs: { flexDirection: "row", marginTop: 5 },
  subTabButton: { marginHorizontal: 12, paddingBottom: 4 },
  subTabText: { fontSize: 16, fontWeight: "600" },
  verticalLine: {
    width: 1,
    height: 20,
    alignSelf: "center",
    marginHorizontal: 8,
  },
});

export default CustomHeader;
