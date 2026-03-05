import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
  import Icon from "react-native-vector-icons/Feather";
import AppText from '../AppText';
import MIcon from "react-native-vector-icons/MaterialCommunityIcons";

const ChatHeader = ({navigation,other_user_id,other_avatar,other_username,theme,onOpenSheet,onOpenModal}) => {
    
  const avatarSource = other_avatar
  ? { uri: `${other_avatar}` }
  : null;

  return (
    <View style={styles.header}>
     <TouchableOpacity onPress={() => navigation.goBack()}>
     <Icon name="arrow-left" size={26} color={theme.text.primary} />
     </TouchableOpacity>
     <TouchableOpacity
     style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}
     onPress={() => navigation.navigate("OtherProfile", { userId: other_user_id })}
     >
     <Image source={avatarSource} style={styles.avatar} />
     <AppText
     style={{ color: theme.text.primary, fontSize: 16, marginLeft: 10 }}
     variant="h4"
     >
     {other_username}
     </AppText>
     </TouchableOpacity>
     <View  style={{ marginLeft: "auto",marginRight:20,flexDirection:'row' }}>
  
     <TouchableOpacity onPress={onOpenModal}>

     <Icon name="music" size={26} color={theme.text.primary} />
     </TouchableOpacity>
     </View>
      
     </View>
  )
}

export default ChatHeader

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", padding: 16 },
    
})