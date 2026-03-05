import React, { useState, useRef, useEffect } from "react";
import {
View,
Text,
FlatList,
StyleSheet,
Image,
TextInput,
TouchableOpacity,
ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import Icon from "react-native-vector-icons/Ionicons";

import Video from "react-native-video";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import { useToast } from "../constants/context/ErrorContext";
import api from "../services/api";
import { useDispatch, useSelector } from "react-redux";
import { updateUserData, updateUserField } from "../store/userSlice";

const AddPlayList = ({navigation}) => {
const { theme } = useTheme();

const [musicQuery, setMusicQuery] = useState("");
const [musicResults, setMusicResults] = useState([]);
const [playlist, setPlaylist] = useState([]); // ⭐ your playlist (max 6)
const [saving,isSaving]=useState(false)
const [isLoadingMusic, setIsLoadingMusic] = useState(false);
const [playingId, setPlayingId] = useState(null);
const [previewUrl, setPreviewUrl] = useState(null);
const user=useSelector(state=>state.user)
const dispatch=useDispatch()
const searchTimeout = useRef(null);

const playerRef = useRef(null);
const [isPlaying, setIsPlaying] = useState(false);
useEffect(()=>{
if(user.userData)
{
setPlaylist(user.userData?.playlist ?? [])

}
},[])
// -------------------------------------------------------
// 🔍 MUSIC SEARCH
// -------------------------------------------------------
useEffect(() => {
if (!musicQuery)
{
setMusicResults([]);
return;
}

if (searchTimeout.current) clearTimeout(searchTimeout.current);

searchTimeout.current = setTimeout(async () => {
setIsLoadingMusic(true);
try {
const res = await fetch(
`https://itunes.apple.com/search?term=${encodeURIComponent(
musicQuery
)}&entity=musicTrack&limit=25`
);
const data = await res.json();

const results = (data.results || []).map((track) => ({
id: track.trackId,
title: track.trackName,
artist: track.artistName,
cover: track.artworkUrl100?.replace("100x100", "300x300"),
streamUrl: track.previewUrl,
}));

setMusicResults(results);
} catch (e) {
console.log("Music search error", e);
} finally {
setIsLoadingMusic(false);
}
}, 400);

return () => searchTimeout.current && clearTimeout(searchTimeout.current);
}, [musicQuery]);

const { showToast } = useToast();

// -------------------------------------------------------
// 🎵 ADD SONG TO PLAYLIST (MAX 6)
// -------------------------------------------------------
const addToPlaylist = (song) => {
if (playlist.find((s) => s.id === song.id)) return;

if (playlist.length >= 6) {
showToast("Maximum 6 Songs Allowed In Playlist","error")
return;
}; // ⭐ Max 6 songs

setPlaylist((prev) => [...prev, song]);
};

// -------------------------------------------------------
// ❌ REMOVE SONG
// -------------------------------------------------------
const removeFromPlaylist = (id) => {
setPlaylist((prev) => prev.filter((s) => s.id !== id));
};

// -------------------------------------------------------
// ▶️ PLAY / PAUSE PREVIEW
// -------------------------------------------------------
const togglePlay = (song) => {
if (playingId === song.id) {
setPlayingId(null);
setPreviewUrl(null);
} else {
setPlayingId(song.id);
setPreviewUrl(song.streamUrl);
}
};
const savePlaylist = async () => {
if (playlist.length === 0) {
showToast("Your playlist is empty", "error");
return;
}

isSaving(true);

try {
const res = await api.post("/edit/playlist", {
songs: playlist,   // 👈 your playlist array
});

console.log("Server response:", res.data);
dispatch(updateUserField({ field: "playlist", value: playlist }));
showToast("Playlist updated!", "success");
navigation.goBack();
} catch (error) {
  console.log(error)
console.error("Saving playlist error:", error?.response?.data || error);
showToast("Failed to save playlist", "error");
} finally {
isSaving(false);
}
};
// -------------------------------------------------------
// 🎨 UI
// -------------------------------------------------------
const renderMusicRow = ({ item }) => (
<TouchableOpacity
style={[
styles.musicItem,
{ backgroundColor: theme.components.card, opacity: theme.opacity.light }
]}
onPress={() => addToPlaylist(item)}
>
<Image source={{ uri: item.cover }} style={styles.musicImage} />

<View style={{ flex: 1, marginLeft: 10 }}>
<Text numberOfLines={1} style={[styles.musicTitle, { color: theme.text.primary }]}>
{item.title}
</Text>
<Text numberOfLines={1} style={[styles.musicArtist, { color: theme.text.secondary }]}>
{item.artist}
</Text>
</View>

<TouchableOpacity onPress={() => togglePlay(item)}>
<Feather
name={playingId === item.id ? "pause" : "play"}
size={22}
color={theme.text.accent}
style={{ marginLeft: 10 }}
/>
</TouchableOpacity>
</TouchableOpacity>
);


const renderPlaylistItem = ({ item }) => (
<View style={styles.playlistItem}>
<Image source={{ uri: item.cover }} style={styles.playlistImage} />
<Text numberOfLines={1} style={[styles.playlistTitle, { color: theme.text.primary }]}>
{item.title}
</Text>

<TouchableOpacity
style={styles.deleteBtn}
onPress={() => removeFromPlaylist(item.id)}
>
<Feather name="x" size={18} color="#fff" />
</TouchableOpacity>
</View>
);

return (
<ScreenBackground>
<View style={{ flex: 1 }}>
<View style={[styles.header, { paddingHorizontal: 20 }]}>
<View style={{ flexDirection: "row", alignItems: "center" }}>
<TouchableOpacity onPress={() => navigation.goBack()}>
<Feather name="arrow-left" size={22} color={theme.text.primary} />
</TouchableOpacity>
<Text style={[styles.headerTitle, { color: theme.text.primary, marginLeft: 12 }]}>
Edit Profile
</Text>
</View>

<TouchableOpacity
onPress={()=>
{savePlaylist()}
}
style={[styles.saveBtn, { backgroundColor: theme.gradients?.tab?.[0] || "#A45EE5" }]}
activeOpacity={0.8}
>
<Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
</TouchableOpacity>
</View>
{/* 🔎 SEARCH BAR */}
<View
style={[
styles.searchContainer,
{ backgroundColor: theme.components.card, opacity: theme.opacity.light }
]}
>
<Feather name="search" size={18} color={theme.text.secondary} />
<TextInput
value={musicQuery}
onChangeText={setMusicQuery}
placeholder="Search music..."
placeholderTextColor={theme.text.secondary}
style={[styles.searchInput, { color: theme.text.primary }]}
/>
</View>

{/* 🎧 PLAYLIST (HORIZONTAL) */}
{playlist.length > 0 && (
  
  <FlatList
data={playlist}
horizontal
keyExtractor={(item) => item.id.toString()}
renderItem={renderPlaylistItem}
style={{ padding:10, paddingLeft: 10 }}
contentContainerStyle={{height:150}}
showsHorizontalScrollIndicator={false}
/>

)}

{/* RESULTS */}
{isLoadingMusic ? (
<ActivityIndicator color={theme.text.accent} style={{ marginTop: 20 }} />
) : (

 
<FlatList
  data={musicResults}
  keyExtractor={(item) => item.id.toString()}
  renderItem={renderMusicRow}
  contentContainerStyle={{ paddingTop: 10 }}
/>


)}

{/* AUDIO PLAYER (HIDDEN) */}

{previewUrl && (
<Video
source={{ uri: previewUrl }}
ref={(ref) => playerRef}
paused={false}
onEnd={() => setPlayingId(null)}
audioOnly
style={{ height: 0, width: 0 }}
/>
)}
</View>
</ScreenBackground>
);
};

export default AddPlayList;



// -------------------------------------------------------
// 🎨 STYLES
// -------------------------------------------------------
const styles = StyleSheet.create({
searchContainer: {
flexDirection: "row",
alignItems: "center",
borderRadius: 12,
margin: 15,
paddingHorizontal: 12,
paddingVertical: 8,
},
searchInput: {
flex: 1,
marginLeft: 8,
fontSize: 15,
},

musicItem: {
flexDirection: "row",
alignItems: "center",
marginHorizontal: 15,
marginVertical: 6,
borderRadius: 12,
padding: 12,
},
musicImage: {
width: 50,
height: 50,
borderRadius: 8,
},
musicTitle: {
fontSize: 15,
fontWeight: "700",
},
musicArtist: {
fontSize: 13,
},

// PLAYLIST PREVIEW
playlistItem: {
width: 90,
alignItems: "center",
marginRight: 14,
},
playlistImage: {
width: 80,
height: 80,
borderRadius: 10,
},
playlistTitle: {
marginTop: 6,
fontSize: 12,
textAlign: "center",
},

deleteBtn: {
position: "absolute",
top: -6,
right: -6,
backgroundColor: "rgba(255,0,0,0.7)",
padding: 4,
borderRadius: 12,
},
header: {
marginTop: 12,
flexDirection: "row",
justifyContent: "space-between",
alignItems: "center",
},
headerTitle: { fontSize: 18, fontWeight: "700" },
saveBtn: {
paddingHorizontal: 14,
paddingVertical: 8,
borderRadius: 12,
elevation: 3,
shadowColor: "#000",
shadowOpacity: 0.12,
shadowRadius: 8,
shadowOffset: { width: 0, height: 6 },
},
saveBtnText: { color: "#fff", fontWeight: "700" },

});
