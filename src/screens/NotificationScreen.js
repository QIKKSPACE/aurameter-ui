// screens/NotificationScreen.js
import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markAllAsRead } from "../store/notificationSlice"; // adjust path
import AppText from "../components/AppText";
import { timeAgo } from "../utils/time";
import { useNavigation } from "@react-navigation/native";

const getRandomAvatar = () =>
  `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`;

const NotificationScreen = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigation=useNavigation()
  const { loading, error, notifications,count} = useSelector(
    (state) => state.notifications
  );
  useEffect(()=>{
    console.log(loading)
    if(!loading && !error)
    {
      if(count>=1)
      {
      dispatch(markAllAsRead())

      }
    }
  },[notifications])
const renderNotification = ({ item }) => {

  const isProfileCompletion =
    item.type === "PROFILE_COMPLETION";

  const isAchievementUnlocked =
    item.type === "ACHIEVEMENT_UNLOCKED";

  // ---------------- NAME ----------------

  const name =
    isProfileCompletion || isAchievementUnlocked
      ? "Aurameter"
      : item.actor?.username || "Unknown";

  // ---------------- MESSAGE ----------------

  let message = "";

  if (isProfileCompletion) {
    message =
      item.metadata?.message || "Profile completed";
  }

  else if (isAchievementUnlocked) {
    message = `Unlocked achievement "${item.metadata?.title}"`;
  }

  else {
    message = "started following you";
  }

  // ---------------- ICON ----------------

  let iconName = "bell";

  if (isProfileCompletion) {
    iconName = "award";
  }

  else if (isAchievementUnlocked) {
    iconName = "zap";
  }

  else {
    iconName = "user-plus";
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.components.card,
          opacity: theme.opacity.light,
        },
      ]}
      onPress={() => {

        if (
          !isProfileCompletion &&
          !isAchievementUnlocked &&
          item.actor?.id
        ) {
          navigation.navigate("OtherProfile", {
            userId: item.actor.id,
          });
        }
      }}
    >
      {item?.actor?.avatar ? (
        <Image
          source={{ uri: item.actor.avatar }}
          style={styles.avatar}
        />
      ) : (
        <Image
          source={require("../assets/login.png")}
          style={styles.avatar}
        />
      )}

      <View style={{ flex: 1 }}>

        <AppText
          style={[
            styles.user,
            { color: theme.text.primary }
          ]}
          variant="h4"
        >
          {name}
        </AppText>

        <AppText
          style={[
            styles.message,
            { color: theme.text.secondary }
          ]}
          variant="body"
        >
          {message}
        </AppText>

        {isAchievementUnlocked && (
          <AppText
            style={{
              color: theme.text.accent,
              fontSize: 11,
              marginTop: 2,
            }}
            variant="caption"
          >
            {item.metadata?.rarity}
          </AppText>
        )}

        <AppText
          style={[
            styles.time,
            { color: theme.text.secondary }
          ]}
          variant="caption"
        >
          {timeAgo(item.created_at)}
        </AppText>
      </View>

      <Icon
        name={iconName}
        size={20}
        color={theme.text.accent}
        style={{ marginLeft: 8 }}
      />
    </TouchableOpacity>
  );
};

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.text.accent} />
        </View>
      );
    }

    if (error) {
      return (
         <View style={{width:'auto',alignSelf:'center',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <AppText style={[styles.errorText, { color: theme.text.primary,fontSize:16 }]} variant="h4">
            Something went wrong
          </AppText>

          <TouchableOpacity
            style={[
             
              { backgroundColor: theme.text.accent,width:100,marginTop:20,padding:10,borderRadius:6 },
            ]}
            onPress={() => dispatch(fetchNotifications())}
          >
            <AppText style={[styles.retryText,{textAlign:'center'}]} variant="button">Retry</AppText>
          </TouchableOpacity>
        </View>
      );
    }

    if (!notifications || notifications.length === 0) {
      return (
        <View style={{width:'auto',alignSelf:'center',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <Icon name="bell-off" size={40} color={theme.text.secondary} />
          <AppText
          variant="h3"
            style={[
              styles.emptyText,
              { color: theme.text.secondary },
            ]}
          >
            No notifications yet
          </AppText>
        </View>
      );
    }

    return (
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    );
  };

  return (
    <ScreenBackground>
   
        {/* Header */}
        <View style={styles.header}>
          <AppText style={[styles.headerTitle, { color: theme.text.primary }]} variant="h3">
            Notifications
          </AppText>

          <TouchableOpacity>
            
          </TouchableOpacity>
        </View>

        {renderContent()}
   
    </ScreenBackground>
  );
};

export default NotificationScreen;


const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
   
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
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
    borderRadius: 22,
    marginRight: 12,
  },
  user: {
    fontSize: 15,
  
  },
  message: {
    fontSize: 12,
  
  },
  time: {
    fontSize: 11,
  },
});
