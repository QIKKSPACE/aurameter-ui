// components/home/HomeTabs.js
import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import AppText from "../AppText";
import { styles } from "./styles";
import { useTheme } from "../../constants/context/ThemeContext";

const tabs = [ "Campus","Global", "Follow"];

const HomeTabs = ({ activeTab, onChange }) => {
  const { theme } = useTheme();

  return (
    <>
   
    
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
     <View style={styles.tabs}>
          <Image source={require("../../assets/promo-1.png")} style={[styles.promoBanner,{marginLeft:10}]} />

    </View>
    </>

  );
};

export default HomeTabs;
