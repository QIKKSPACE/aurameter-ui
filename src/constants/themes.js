// src/constants/themes.js
export const themes = {

  dark: {
    id: "dark",
    name: "Dark Theme",
    type: "General",
    background: {
      type: "color", // color | gradient | image
      color: "#121212",
      image: null,
      gradient: ["#1CA69A", "#138178"],
    },
    text: {
      primary: "#ffffff",
      secondary: "#cccccc",
      accent: "#97deff",
    },  
    components: {
      card: "#1e1e1e",
      box: "#013647",
      border: "#333",
    },
    gradients: {
      tab: ["#121212", "#000000"],
      drawer: ["#121212", "#000000"],
    },
    polygonGradient: ["#00E5FF33", "#00E5FF11"], // torch glow cyan
    opacity: { light: 1, medium: 1, heavy: 1 },
  },

  DemonSlayer: {
    id: "DemonSlayer",
    name: "Demon Slayer",
    type: "General",
    background: {
      type: "image",
      color: "#138178",
      image: require("../assets/theme1.webp"),
      gradient: ["#1CA69A", "#138178"],
    },
    text: {
      primary: "#ffffff",
      secondary: "#d1f2f2",
      accent: "#a0ffe6",
    },
    components: {
      card: "#0f2a2a",
      box: "#174646",
      border: "#2a5c5c",
    },
    gradients: {
      tab: ["#1CA69A", "#138178"],
      drawer: ["#1CA69A", "#138178"],
    },
    polygonGradient: ["#00ffc844", "#13817855"], // green glow torch
    opacity: { light: 0.85, medium: 0.6, heavy: 0.35 },
  },



GryffindorTheme :{
  id: "GryffindorTheme",
  name: "Harry Potter Art",
  type: "General",
  background: {
    type: "image",
    gradient: ["#1A2634", "#3A1C1C"], // deep night blue to dark burgundy blend
    color: "#0F1824", // fallback deep navy to match sky
    image: require("../assets/hp-art.jpg"), // your uploaded image
  },
  text: {
    primary: "#FFE26D",   // warm golden glow (like spell light)
    secondary: "#C0A76D", // muted antique gold
    accent: "#E9F5FF",    // pale blue-white accent for magic tones
  },
  components: {
    card: "#1E1B2A",   // deep indigo-maroon card background
    box: "#2C2130",    // slightly lighter burgundy box
    border: "#FFD36B", // gold edge
  },
  gradients: {
    tab: ["#742D2D", "#FFD36B"], // red-gold gradient for tabs
    drawer: ["#2C2130", "#1A1824"], // subtle shadowed maroon for drawer
  },
  polygonGradient: ["#FFD36B44", "#742D2D88"], // glowing gold-red overlay
  opacity: { light: 0.85, medium: 0.6, heavy: 0.35 },
},



};
