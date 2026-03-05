// components/home/StoryItem.js
import React from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import NewIcon from "@react-native-vector-icons/material-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../constants/context/ThemeContext";
import AppText from "../AppText";
import { styles } from "./styles";
import StoryRing from './StoryRing'
import { useSelector } from "react-redux";
const formatCount = (num) => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + "k";
  return (num / 1000000).toFixed(1) + "M";
};

const StoryItem = ({ userId, index }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const item = useSelector(
    state => state.story.stories.find(u => u.user_id === userId)
  );

  
  if (!item) return (
     <TouchableOpacity
          style={styles.storyWrapper}
          onPress={() => navigation.navigate("AddStory")}
        >
          <View style={[styles.addStory, { borderColor: theme.text.accent }]}>
            <Icon name="plus" size={30} color={theme.text.accent} />
          </View>
          <AppText style={styles.storyLabel}>Aura Status</AppText>
        </TouchableOpacity>
  );
    const stories = item.stories || [];
const hasPendingStory = stories.some(
  s => s.status !== "ACCEPTED" && s.status !== "FAILED"
);


const isLastFailed = lastStory?.status === "FAILED";

  const firstUnseenIndex = stories.findIndex(story => !story.seen);
  const hasUnseen = firstUnseenIndex !== -1;
   //console.log(hasUnseen,firstUnseenIndex)
  // YOUR STORY 
if (index === 0) {
const lastStory = stories[stories.length - 1];

  if (stories.length === 0) {
    return (
      <TouchableOpacity
        style={styles.storyWrapper}
        onPress={() => navigation.navigate("AddStory")}
      >
        <View style={[styles.addStory, { borderColor: theme.text.accent }]}>
          <Icon name="plus" size={30} color={theme.text.accent} />
        </View>
        <AppText style={styles.storyLabel}>Aura Status</AppText>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.storyWrapper}
      onPress={() =>
        navigation.navigate("Storyview", {
          startUserIndex: index,
          startStoryIndex: hasUnseen ? firstUnseenIndex : null,
        })
      }
    >
      <View style={styles.avatarContainer}>
        {/* ✅ Ring only if pending story exists */}
        {hasPendingStory && <StoryRing active />}

        <Image
          source={{ uri: lastStory.media_url }}
          style={[styles.storyImage, { borderColor: theme.text.accent }]}
        />

        {/* ❌ Error only if LAST is failed */}
        {isLastFailed && (
          <View style={styles.failedOverlay}>
            <Icon name="alert-circle" size={40} color="#ff4d4d" />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.plusButton}
        onPress={() => navigation.navigate("AddStory")}
      >
        <Text style={styles.plusText}>+</Text>
      </TouchableOpacity>

      <AppText style={styles.storyLabel}>Aura Status</AppText>
    </TouchableOpacity>
  );
}


  // OTHER USERS
  const lastStory = item.stories[item.stories.length - 1];

  return (
    <TouchableOpacity
      style={styles.storyWrapper}
      onPress={() =>
  navigation.navigate("Storyview", {
    startUserIndex: index,
    startStoryIndex: hasUnseen ? firstUnseenIndex : null,
  })}
      onLongPress={() =>
        navigation.navigate("OtherProfile", { userId: lastStory?.userId })
      }
    >
       <View style={styles.avatarContainer}>
 <Image
        source={{ uri: lastStory.media_url }}
        style={[styles.storyImage, {   borderColor: hasUnseen
        ? theme.text.accent   // 👈 unseen color
        : theme.text.primary,   // 👈 seen color
    }]}
      />
       </View>
     

      {item.current_streak_count && (
        <View style={styles.fireBadge}>
          <NewIcon name="whatshot" size={36} color="#ff6347" />
          <Text style={styles.fireText}>
            {formatCount(item.current_streak_count)}
          </Text>
        </View>
      )}

      <AppText style={styles.storyUsername}>{item.username}</AppText>
    </TouchableOpacity>
  );
};

export default StoryItem;

