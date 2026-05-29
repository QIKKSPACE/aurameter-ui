// components/home/styles.js
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  storyWrapper: { marginRight: 10, alignItems: "center" },

  addStory: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  storyLabel: { marginTop: 6, fontSize: 12 },
  storyUsername: { marginTop: 6, fontSize: 13 },

  plusButton: {
    position: "absolute",
    bottom: 20,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#00E5FF",
    justifyContent: "center",
    alignItems: "center",
  },
  plusText: { color: "#fff", fontWeight: "bold" },

  fireBadge: { position: "absolute", bottom: 18, right: 0 },
  fireText: {
    position: "absolute",
    bottom: 6,
    right: 8,
    fontSize: 8,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
promoBanner: {
  width: "90%",
  height: 130,
  borderRadius: 16,
  marginHorizontal: 16,
  marginTop: 10,
},
  logoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 15,
    alignItems: "center",
  },
  auraIcon: { width: 36, height: 36 },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    textAlign:'center'
  },
  tabText: { fontSize: 14, },
  activeTabIndicator: { height: 2, marginTop: 4 },
  avatarContainer: {
  width: 75,
  height: 75,
  justifyContent: "center",
  alignItems: "center",

},

storyImage: {
  width: 70,
  height: 70,
  borderRadius: 35,
  borderWidth: 2
},
failedOverlay: {
  position: "absolute",
  width: 70,
  height: 70,
  borderRadius: 35,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.35)", // optional dim effect
},
});
