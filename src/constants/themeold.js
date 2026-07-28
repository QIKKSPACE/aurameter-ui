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
    type: "Premium",
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

  sunset: {
    id: "sunset",
    name: "Sunset Glow",
    type: "General",
    background: {
      type: "gradient",
      gradient: ["#ff6e7f", "#bfe9ff"],
      color: "#ffb199",
      image: null,
    },
    text: {
      primary: "#2e2e2e",
      secondary: "#444",
      accent: "#ff4081",
    },
    components: {
      card: "#ffe5e9",
      box: "#ffd6d9",
      border: "#ff9aa2",
    },
    gradients: {
      tab: ["#ff6e7f", "#bfe9ff"],
      drawer: ["#ff6e7f", "#bfe9ff"],
    },
    polygonGradient: ["#ff408144", "#ff9aa244"], // pinkish torch
    opacity: { light: 1, medium: 0.85, heavy: 0.65 },
  },

  galaxy: {
    id: "galaxy",
    name: "Galaxy",
    type: "Basic",
    background: {
      type: "gradient",
      gradient: ["#0f0c29", "#302b63", "#24243e"],
      color: "#1c1b29",
      image: null,
    },
    text: {
      primary: "#f8f8ff",
      secondary: "#a1a1d6",
      accent: "#9d4edd",
    },
    components: {
      card: "#1f1a40",
      box: "#2a215c",
      border: "#3d2f74",
    },
    gradients: {
      tab: ["#0f0c29", "#302b63"],
      drawer: ["#302b63", "#24243e"],
    },
    polygonGradient: ["#9d4edd55", "#302b6388"], // purple glow torch
    opacity: { light: 1, medium: 0.8, heavy: 0.55 },
  },

  forest: {
    id: "forest",
    name: "Forest",
    type: "Basic",
    background: {
      type: "gradient",
      gradient: ["#134e5e", "#71b280"],
      color: "#134e5e",
      image: null,
    },
    text: {
      primary: "#eaffea",
      secondary: "#cfe8cf",
      accent: "#a7ff83",
    },
    components: {
      card: "#1f3a3d",
      box: "#245a5d",
      border: "#3a7d5e",
    },
    gradients: {
      tab: ["#134e5e", "#71b280"],
      drawer: ["#134e5e", "#71b280"],
    },
    polygonGradient: ["#71b28055", "#134e5e77"], // green forest torch
    opacity: { light: 1, medium: 0.8, heavy: 0.6 },
  },

  PokemonYellow: {
    id: "PokemonYellow",
    name: "Pokémon Yellow",
    type: "Basic",
    background: {
      type: "gradient",
      gradient: ["#FFF176", "#FFD54F"],
      color: "#FFF176",
    },
    text: {
      primary: "#2E2E2E",
      secondary: "#5C5C5C",
      accent: "#F44336",
    },
    components: {
      card: "#FFFFFF",
      box: "#FFF8E1",
      border: "#FFB300",
    },
    gradients: {
      tab: ["#FFD54F", "#FFEE58"],
      drawer: ["#FFD54F", "#FFEE58"],
    },
    polygonGradient: ["#FFD54F66", "#F4433644"], // yellow torch with red tint
    opacity: { light: 1.0, medium: 0.85, heavy: 0.65 },
  },

  RelaxTheme: {
    id: "RelaxTheme",
    name: "Relax Theme",
    type: "Premium",
    background: {
      type: "image",
      gradient: ["#6D5BA8", "#4C6FA6"],
      color: "#2E2D3F",
      image: require("../assets/theme-relax.png"),
    },
    text: {
      primary: "#EDEDED",
      secondary: "#C0B6D9",
      accent: "#FF8C42",
    },
    components: {
      card: "#1A1B2D",
      box: "#2C2D3E",
      border: "#A978E3",
    },
    gradients: {
      tab: ["#6D5BA8", "#A978E3"],
      drawer: ["#2C2D3E", "#4C6FA6"],
    },
    polygonGradient: ["#A978E355", "#6D5BA888"], // purple-lavender glow torch
    opacity: { light: 0.8, medium: 0.85, heavy: 0.65 },
  },
  Ben10Theme: {
  id: "Ben10Theme",
  name: "Ben 10 Theme",
  type: "Premium",
  background: {
    type: "image",
    gradient: ["#3CB043", "#1E5631"], // light-to-dark green
    color: "#0D2616", // fallback deep green
    image: require("../assets/ben-10.webp"), // <-- use the wallpaper here
  },
  text: {
    primary: "#E6FFE6",   // almost white with greenish tint
    secondary: "#A5E6A1", // soft neon green for secondary text
    accent: "#00FF7F",    // Omnitrix neon glow (spring green)
  },
  components: {
    card: "#122B18",   // dark green card
    box: "#1C3D24",    // medium green box
    border: "#39FF14", // neon border (alien tech vibe)
  },
  gradients: {
    tab: ["#3CB043", "#39FF14"], // bright green blend
    drawer: ["#1C3D24", "#0D2616"], // dark techy green
  },
  polygonGradient: ["#39FF1455", "#3CB04388"], // neon green aura overlay
  opacity: { light: 0.8, medium: 0.85, heavy: 0.65 },
},

GryffindorTheme :{
  id: "GryffindorTheme",
  name: "Harry Potter Art",
  type: "Premium",
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
