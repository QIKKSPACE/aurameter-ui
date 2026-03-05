// screens/PostStoryScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome5";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import { useNavigation } from "@react-navigation/native";

const PostStoryScreen = () => {
  const { theme } = useTheme();
 const navigation=useNavigation()
  return (
    <ScreenBackground>
      <View edges={["top", "bottom"]} style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={()=>{
            navigation.goBack()
          }}>
            <Icon name="x" size={30} color={theme.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Story Image */}
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
          }}
          style={styles.storyImage}
        />

        {/* Right Side Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={[styles.toolbarText, { color: theme.text.primary }]}>T</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={[styles.toolbarText, { color: theme.text.primary }]}>Aa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="music" size={24} color={theme.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="star" size={24} color={theme.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="map-marker-alt" size={24} color={theme.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Bottom Buttons */}
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: theme.components.overlay },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.closeFriendsButton,
              { borderColor: theme.text.primary, backgroundColor: theme.background },
            ]}
          >
            <Text style={[styles.closeFriendsText, { color: theme.text.primary }]}>
              Close Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.addStoryButton,
              { backgroundColor: theme.text.accent },
            ]}
          >
            <Text style={styles.addStoryText}>Add to Story</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    position: "absolute",
    top: 10,
    left: 15,
    zIndex: 10,
  },

  storyImage: {
    flex: 1,
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },

  toolbar: {
    position: "absolute",
    top: 0, // adjusted safe area
    right: 12,
    alignItems: "center",
  },
  iconButton: {
    marginVertical: 15,
  },
  toolbarText: {
    fontSize: 24,
    fontWeight: "bold",
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 20,
  },

  closeFriendsButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  closeFriendsText: {
    fontSize: 16,
  },

  addStoryButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addStoryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PostStoryScreen;
