// components/home/HomeTabs.js
import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../AppText";
import { styles } from "./styles";
import { useTheme } from "../../constants/context/ThemeContext";

const tabs = ["Global", "Campus", "Follow"];

const HomeTabs = ({ activeTab, onChange }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.tabs}>
      {tabs.map(tab => (
        <TouchableOpacity key={tab} onPress={() => onChange(tab)}>
          <AppText
            style={[
              styles.tabText,
              { color: activeTab === tab ? theme.text.primary : theme.text.secondary }
            ]}
          >
            {tab.toUpperCase()}
          </AppText>
          {activeTab === tab && (
            <View
              style={[
                styles.activeTabIndicator,
                { backgroundColor: theme.text.accent }
              ]}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default HomeTabs;
