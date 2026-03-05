// src/screens/ProfileScreen.js
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,  
  FlatList,
} from "react-native";
import { Avatar } from "react-native-paper";
import Icon from "@react-native-vector-icons/material-icons";
import Ionicons from "react-native-vector-icons/Ionicons";
import  PlaylistGrid from '../components/PlaylistGrid'

import { SafeAreaView } from "react-native-safe-area-context";

import ScreenBackground from "../components/ScreenBackground";
import CustomProfileHeader from "../components/CustomProfileHeader";
import { useTheme } from "../constants/context/ThemeContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import AppText from "../components/AppText";
const ZODIAC = [
  { key: "aries", label: "Aries", emoji: "♈︎" },
  { key: "taurus", label: "Taurus", emoji: "♉︎" },
  { key: "gemini", label: "Gemini", emoji: "♊︎" },
  { key: "cancer", label: "Cancer", emoji: "♋︎" },
  { key: "leo", label: "Leo", emoji: "♌︎" },
  { key: "virgo", label: "Virgo", emoji: "♍︎" },
  { key: "libra", label: "Libra", emoji: "♎︎" },
  { key: "scorpio", label: "Scorpio", emoji: "♏︎" },
  { key: "sagittarius", label: "Sagittarius", emoji: "♐︎" },
  { key: "capricorn", label: "Capricorn", emoji: "♑︎" },
  { key: "aquarius", label: "Aquarius", emoji: "♒︎" },
  { key: "pisces", label: "Pisces", emoji: "♓︎" },
];

const achievements = [
  
];
 
const ProfileScreen = () => {
  const { theme } = useTheme();
  const navigation=useNavigation()
  const user=useSelector(state=>state.user)
    const [zodiac, setZodiac] = useState(null);
    const stopPlayerRef = useRef(null);

useFocusEffect(
  useCallback(() => {
    // on screen focus
    return () => {
      // screen lost focus → STOP MUSIC
      if (stopPlayerRef.current) {
        stopPlayerRef.current();
      }
    };
  }, [])
);

const { selfRank } = useSelector(
    state => state.leaderboard.campus
  );
  const { selfRank:selfrankGlobal } = useSelector(
    state => state.leaderboard.campus
  );
  useEffect(() => {
    if (user.userData) {
       
    
      setZodiac(user.userData.zodiac || null);
   
  
    }
  }, [user]);
  const renderAchievement = ({ item }) => (
    <View
      style={[
        styles.achievementCard,
        { backgroundColor: theme.components.card },
      ]}
    >
      <Icon
        name={item.icon}
        size={22}
        color={item.color}
        style={{ marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.achievementName, { color: theme.text.primary }]}>
          {item.title}
        </Text>
        <Text style={[styles.achievementDesc, { color: theme.text.secondary }]}>
          {item.subtitle}
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenBackground>
      <View  style={{ flex: 1 }}>
        <FlatList
          ListHeaderComponent={
            <>
              {/* Header */}
              <CustomProfileHeader />

              {/* Profile Avatar */}
              <View style={styles.profileSection}>
                <View style={styles.avatarWrapper}>
                 

                   {user?.userData?.avatar ? (
                                      <Image source={{ uri: user?.userData?.avatar}} style={styles.avatarImage} />
                                    ) : (
                                      <Image   source={require("../assets/newframe.png")} style={styles.avatarImage} />
                                    )}
                 
                </View>
                {user?.userData?.name?
                <View style={[ {marginBottom:5,width:'50%',alignSelf:'center',alignItems:'center' },
                         theme.background.style!=="image"?{
                            backgroundColor: theme.background.color,
                      opacity:theme.opacity.light,padding:4,borderRadius:5
                          }:{}
                      ]}>
                <AppText  variant="h4" style={[{ color: theme.text.primary,fontSize:20}]}>
                  {user?.userData?.name || ""}
                </AppText>
                </View>:""}
                 {user?.userData?.bio? 
                <View style={[ {width:'95%',alignSelf:'center',alignItems:'center' },
                         theme.background.style!=="image"?{
                            backgroundColor: theme.background.color,
                      opacity:theme.opacity.light,padding:4,borderRadius:5
                          }:{}
                      ]}>
                <AppText variant="body" style={[ { color: theme.text.secondary,textAlign:'center',fontSize:14 }]}>
                 {user?.userData?.bio || ""}
                </AppText>
                </View>
                :""}
              </View>

              {/* Info Row */}
              <View style={styles.infoRow}>
                <View
                  style={[
                    styles.infoBox,
                    { backgroundColor: theme.components.box },
                       theme.background.style!=="image"?{
                          
                      opacity:theme.opacity.light
                          }:{}
                  ]}
                >
                   <AppText style={[ { color: theme.text.primary,fontSize:10 }]} variant="caption">
                                      {zodiac ? `${ZODIAC.find(z => z.key === zodiac)?.emoji ?? ""} ${ZODIAC.find(z => z.key === zodiac)?.label ?? zodiac}` : "N/A"}
                                    </AppText>
                </View>
                <View
                  style={[
                    styles.infoBox,
                    { backgroundColor: theme.components.box, },
                     { backgroundColor: theme.components.box },
                       theme.background.style!=="image"?{
                          
                      opacity:theme.opacity.light
                          }:{}
           
                  ]}
                >
                  <Icon name="stars" size={18} color={theme.text.accent} />
                  <AppText style={[{ color: theme.text.primary,marginLeft:5,fontSize:10}]} variant="caption">
                    {user.userData?.aura}
                  </AppText>
                </View>
                <View
                  style={[
                    styles.infoBox,
                    { backgroundColor: theme.components.box },
                  { backgroundColor: theme.components.box },
                       theme.background.style!=="image"?{
                          
                      opacity:theme.opacity.light
                          }:{}
                  ]}
                >
                   <AppText style={[{ color: theme.text.primary,fontSize:10 }]} variant="caption">
                    Level {user?.userData?.level}
                  </AppText>
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
               
                <TouchableOpacity
                  style={[styles.vibeBtn, { borderColor: theme.text.accent }]}
                >

                  <AppText style={[ { color: theme.text.accent,fontSize:12 }]} variant="h4" onPress={()=>{
                    navigation.navigate("Connections")
                  }}>
                    Connections
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* Stats */}
              <View
                style={[
                  styles.statsContainer,
                  { backgroundColor: theme.components.box },
                   { backgroundColor: theme.components.box },
                       theme.background.style!=="image"?{
                          
                      opacity:theme.opacity.light
                          }:{}
                ]}
              >
                <View style={styles.statBox}>
                  <AppText style={[ { color: theme.text.primary,fontSize:18 }]} variant="h4">
                    450
                  </AppText>
                  <AppText
                    style={[ { color: theme.text.secondary,fontSize:8 }]}
                    variant="body"
                  >
                    PROFILE VIEWS
                  </AppText>
                </View>
                <View style={styles.statBox}>
                 <AppText style={[ { color: theme.text.primary,fontSize:18 }]} variant="h4">
                    
                   
                  {selfrankGlobal?selfrankGlobal:'N/A'}
                    
                  </AppText>
                 <AppText
                    style={[ { color: theme.text.secondary,fontSize:8 }]}
                    variant="body"
                  >
                    GLOBAL RANK
                  </AppText>
                </View>
                <View style={styles.statBox}>
                <AppText style={[ { color: theme.text.primary,fontSize:18 }]} variant="h4">
                  {selfRank?selfRank:'N/A'}
                  </AppText>
                 <AppText
                    style={[ { color: theme.text.secondary,fontSize:8 }]}
                    variant="body"
                  >
                  CAMPUS
                  </AppText>
                </View>
              </View>
    <View
  style={[
    {
      opacity: 0.95,
      width: "95%",
      marginBottom: 20,
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    theme.background.style !== "image"
      ? {
          backgroundColor: theme.background.color,
          opacity: theme.opacity.light,
          padding: 2,
          paddingLeft:8,
          borderRadius: 5,
        }
      : {},
  ]}
>
  <View style={{ flexDirection: "row", alignItems: "center" }}>
  
    <AppText style={{ color: theme.text.primary, fontSize: 14 }} variant="h3">
      PLAYLIST
    </AppText>
      <Ionicons
      name="musical-notes-outline"
      size={16}
      color={theme.text.primary}
      style={{ marginLeft: 6 }}
    />
  </View>

 <TouchableOpacity onPress={() => {navigation.navigate("AddPlaylist")}}>
    <Ionicons
      name="pencil"
      size={22}
      color={theme.text.primary}
      style={{ marginRight: 6 }}
    />
  </TouchableOpacity>
</View>
<View style={{paddingHorizontal:4}}>
<PlaylistGrid playlist={user?.userData?.playlist} 
 onStopPlayback={(fn) => (stopPlayerRef.current = fn)} />

</View>
{/* Achievements Header */}
<View
  style={[
    {
      opacity: 0.95,
      width: "95%",
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
    },
    theme.background.style !== "image"
      ? {
          backgroundColor: theme.background.color,
          opacity: theme.opacity.light,
          padding: 2,
          paddingLeft:8,
          borderRadius: 5,
        }
      : {},
  ]}
>
 
  <AppText style={{ color: theme.text.primary, fontSize: 14 }} variant="h3">
    ACHIEVEMENTS
  </AppText>
   <Ionicons
    name="trophy-outline"
    size={16}
    color={theme.text.primary}
    style={{ marginLeft: 6 }}
  />
</View>
            
            </>
          }
          data={achievements}
          keyExtractor={(item) => item.id}
          renderItem={renderAchievement}
          contentContainerStyle={styles.scrollContent}
        />
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 10,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
  },
  crown: {
    width: 28,
    height: 28,
    position: "absolute",
    top: -5,
    right: -10,
  },
  username: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "700",
  },
  bio: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  infoBox: {
    flexDirection: "row",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    minWidth:100,
    alignSelf:'center',
    justifyContent:'center'
    
  },
  infoText: {
    fontWeight: "600",
    marginLeft: 4,
    textAlign:'center'
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical:10,
  },
  followBtn: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  followText: {
    fontWeight: "700",
  },
  vibeBtn: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  vibeText: {
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 15,
    justifyContent: "space-between",
    marginVertical: 12,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 10,
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  achievementName: {
    fontSize: 15,
    fontWeight: "700",
  },
  achievementDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  avatarImage: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },

});

export default ProfileScreen;
