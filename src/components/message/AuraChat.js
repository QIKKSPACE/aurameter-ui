import React, { useMemo } from "react";
import { TouchableOpacity, View, Image, Text, StyleSheet } from "react-native";
import AppText from "../AppText";
import { timeAgo } from "../../utils/time";
import { useSelector } from "react-redux";

const AuraChat = ({ item, navigation, theme, currentUserId }) => {
const error=useSelector(state => state.auraChat.errorMessage)

 return(
<TouchableOpacity
style={[
styles.messageCard,
{
backgroundColor: theme.components.card,
opacity: theme.opacity.light,
},
]}
onPress={() => {

navigation.navigate("AuraChatScreen");
}}
>
<Image source={  item.image} style={styles.avatar} />
<View style={{ flex: 1, }}>
<View style={styles.messageHeader}>
<AppText variant="h4" style={[ { color: theme.text.primary,fontSize:14 }]}>{item.name}</AppText>

</View>
<AppText variant="body"style={[!error? { color: theme.text.secondary,fontSize:14 }:
{ color: 'red',fontSize:14 }
]} numberOfLines={1}>
{item.message} {error?'Tap to retry!':''}
</AppText>
</View>
<View style={{marginLeft:10}}>
<AppText style={{fontSize:12}}>
{timeAgo(new Date(item?.created_at))}
</AppText>
</View>

</TouchableOpacity>
 )
}

export default AuraChat

const styles = StyleSheet.create({
    // MESSAGE ITEM
messageCard: {
flexDirection: "row",
borderRadius: 14,
padding: 12,
marginHorizontal: 15,
marginBottom: 10,
alignItems:'center',
justifyContent:'center'
},
avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
messageHeader: {
flexDirection: "row",
alignItems: "center",
},
name: { fontSize: 16, fontWeight: "700" },
streakRow: { flexDirection: "row", alignItems: "center",justifyContent:'center',},
streakValue: { color: "#fff", marginLeft: 4, fontWeight: "bold" },
messagePreview: { fontSize: 13, marginTop: 4 },
})