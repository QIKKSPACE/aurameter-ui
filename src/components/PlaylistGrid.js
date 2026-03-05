import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Video from "react-native-video";
import Icon from "react-native-vector-icons/Ionicons";
import AppText from "./AppText";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 2 - 18;
const ITEM_HEIGHT = ITEM_WIDTH * 1.35;


const PlaylistGrid = ({ playlist,onStopPlayback }) => {
  const [currentSong, setCurrentSong] = useState(null); // full object
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (onStopPlayback) onStopPlayback(() => {
      setCurrentSong(null);
      setPaused(true);
    });
  }, [onStopPlayback]);
  const playSong = (song) => {
    if (!currentSong || currentSong.id !== song.id) {
      setCurrentSong(song);    // switching song → reload player
      setPaused(false);
      return;
    }

    // If same song clicked → toggle play/pause
    setPaused(!paused);
  };

  const renderItem = ({ item }) => {
    const isCurrent = currentSong?.id === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => playSong(item)}
        style={styles.cardWrapper}
      >
        <ImageBackground
          source={{ uri: item.cover }}
          style={styles.card}
          imageStyle={{ borderRadius: 12 }}
        >
          {/* Play/Pause Button Overlay */}
          <TouchableOpacity
            onPress={() => playSong(item)}
            style={styles.playButton}
          >
            <Icon
              name={isCurrent && !paused ? "pause" : "play"}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>

          <View style={styles.overlay}>
            <AppText variant="body" numberOfLines={1} style={{fontSize:12,color:'white'}}>
              {item.title}
            </AppText>
            <AppText variant="caption"numberOfLines={1} style={styles.artist}>
              {item.artist}
            </AppText>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={playlist}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />

      {/* Hidden Audio Player */}
      {currentSong && (
        <Video
          key={currentSong.streamUrl}       // 🔥 Forces reload on song switch
          source={{ uri: currentSong.streamUrl }}
          paused={paused}
          audioOnly
          onEnd={() => {
            setPaused(true);
          }}
          style={{ height: 0, width: 0 }}
        />
      )}
    </View>
  );
};

export default PlaylistGrid;

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    justifyContent: "flex-end",
  },
  playButton: {
    position: "absolute",
    top: "40%",
    left: "40%",
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 10,
    borderRadius: 50,
  },
  overlay: {
    width: "100%",
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  title: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  artist: {
    color: "#eee",
    fontSize: 11,
    marginTop: 2,
  },
});
