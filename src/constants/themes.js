// src/constants/themes.js
export const themes = {
  
  ocean: {
    id: "ocean",
    name: "Ocean Blue",
    type: "Basic",
    background: {
      type: "gradient",
      gradient: ["#0f2027", "#203a43", "#2c5364"],
      color: "#000",
      image: null,
    },
    text: {
      primary: "#E0F7FA",
      secondary: "#B2EBF2",
      accent: "#00E5FF",
    },
    components: {
      card: "#112233",
      box: "#223344",
      border: "#335577",
    },
    gradients: {
      tab: ["#0f2027", "#2c5364"],
      drawer: ["#0f2027", "#2c5364"],
    },
    polygonGradient: ["#00E5FF44", "#203a4366"], // blue aqua torch
    opacity: { light: 1, medium: 0.9, heavy: 0.7 },
  },
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

  light: {
    id: "light",
    name: "Light Theme",
    type: "General",
    background: {
      type: "color",
      color: "#F5F5F5",
      image: null,
      gradient: ["#ffffff", "#e6e6e6"],
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#555555",
      accent: "#0078ff",
    },
    components: {
      card: "#ffffff",
      box: "#f0f0f0",
      border: "#dddddd",
    },
    gradients: {
      tab: ["#f5f5f5", "#e6e6e6"],
      drawer: ["#f5f5f5", "#e6e6e6"],
    },
    polygonGradient: ["#0078ff33", "#e6e6e688"], // subtle blue torch
    opacity: { light: 1, medium: 0.9, heavy: 0.7 },
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
BratzDollTheme:{
  id: "BratzDollTheme",
  name: "Bratz Doll Theme",
  type: "Premium",
  background: {
    type: "image",
    gradient: ["#FFB6C1", "#FF69B4"], // Light Pink to Hot Pink
    color: "#DDA0DD", // Fallback Medium Orchid/Pinkish-Purple
    // NOTE: Replace the image path below with the path to the Bratz doll image you want to use.
    image: require("../assets/barbie.jpg"), // <-- use the wallpaper here
  },
  text: {
    primary: "#FFFFFF",   // White for primary text
    secondary: "#F0F8FF", // AliceBlue for secondary text (soft white)
    accent: "#FFDAB9",    // Peach Puff for a warm, soft accent
  },
  components: {
    card: "#FFC0CB",   // Pink card
    box: "#FFB6C1",    // Light Pink box
    border: "#FF69B4", // Hot Pink border
  },
  gradients: {
    tab: ["#FFB6C1", "#FF69B4"], // Light Pink to Hot Pink blend
    drawer: ["#FFC0CB", "#DDA0DD"], // Pink to Orchid blend
  },
  polygonGradient: ["#FFB6C155", "#FF69B488"], // Pink aura overlay
  opacity: { light: 0.85, medium: 0.6, heavy: 0.35 },
},
NeonGamerTheme:{
  id: "NeonGamerTheme",
  name: "PUBG",
  type: "Basic",
  background: {
    type: "image",
    gradient: ["#2C003D", "#8A2BE2"], // Dark Violet to Blue Violet for a deep, electric feel
    color: "#0D001A", // Fallback very dark purple
    // NOTE: Replace the image path below with the path to the gamer image you want to use.
    image: require("../assets/pubg.jpg"), // <-- use the wallpaper here
  },
  text: {
    primary: "#00FFFF",   // Cyan/Aqua for primary text (neon blue glow)
    secondary: "#FF00FF", // Magenta for secondary text (neon pink glow)
    accent: "#FFFFFF",    // White for sharp highlights
  },
  components: {
    card: "#1A002B",   // Very dark purple/blackish card
    box: "#2A003D",    // Darker purple box
    border: "#00FFFF", // Cyan border (strong neon highlight)
  },
  gradients: {
    tab: ["#8A2BE2", "#FF00FF"], // Blue Violet to Magenta blend
    drawer: ["#1A002B", "#0D001A"], // Dark purple blend
  },
  polygonGradient: ["#FF00FF55", "#00FFFF88"], // Magenta and Cyan aura overlay
  opacity: { light: 0.85, medium: 0.6, heavy: 0.35 },
},
 vibrantDark : {
  id: "vibrantDark",
  name: "Vibrant Dark Theme",
  type: "General",
  background: {
    type: "color", // color | gradient | image
    color: "#0B0B28", // deep navy background
    image: null,
    gradient: ["#0B0B28", "#151535"], // subtle dark navy gradient
  },
  text: {
    primary: "#F5F5F7",       // near-white text
    secondary: "#A0A3B1",     // muted bluish-gray text
    accent: "#3DBEFF",        // bright aqua link
  },
  components: {
    card: "#151535",          // darker navy for cards/panels
    box: "#1A1A3D",           // slightly lifted tone
    border: "#252555",        // subtle bluish border
  },
  gradients: {
    tab: ["#0B0B28", "#151535"],
    drawer: ["#0B0B28", "#151535"],
  },
  polygonGradient: ["#FF336633", "#7C4DFF22"], // glowing pink-purple aura
  opacity: { light: 1, medium: 1, heavy: 1 },
  accents: {
    primary: "#FF3366",   // neon pink for FAB, highlights
    secondary: "#7C4DFF", // purple accent
  },
 },
NarutoTheme : {
  id: "NarutoTheme",
  name: "Naruto Uzumaki",
  type: "Basic",
  background: {
    type: "image",
    gradient: ["#FF8C00", "#E35A00"], // bright to deep orange
    color: "#2A1A00", // dark brown-orange fallback
    image: require("../assets/naruto-art.jpg"), // your uploaded image
  },
  text: {
    primary: "#FFF1C1",   // warm soft yellow-white for contrast
    secondary: "#FFD580", // lighter orange-gold for subtitles
    accent: "#FFFFFF",    // pure white for emphasis
  },
  components: {
    card: "#3B1A00",     // deep burnt orange/brown for cards
    box: "#542400",      // richer orange-brown for boxes
    border: "#FFC04D",   // glowing golden-orange border
  },
  gradients: {
    tab: ["#E35A00", "#FFC04D"],   // fiery orange to gold tab gradient
    drawer: ["#3B1A00", "#542400"], // dark warm drawer tones
  },
  polygonGradient: ["#FFC04D55", "#E35A0088"], // golden-orange aura
  opacity: { light: 0.85, medium: 0.6, heavy: 0.35 },
},
FanArtGojo: {
  id: "FanArtGojo",
  name: "Gojo Fan Art",
  type: "Basic",
  background: {
    type: "image",
    gradient: ["#0D1B2A", "#1B263B"], // deep indigo to midnight blue
    color: "#0A0F1A", // fallback for dark energy tone
    image: require("../assets/sarutobi-gog.png"), // use the generated image
  },
  text: {
    primary: "#E6F0FF",   // soft icy white-blue for main text
    secondary: "#A8C7FF", // light sorcerer blue for subtitles
    accent: "#6BC1FF",    // vibrant cursed-energy teal
  },
  components: {
    card: "#162032",      // dark bluish card base
    box: "#1F2D44",       // slightly brighter blue-gray for containers
    border: "#6BC1FF",    // glowing teal border
  },
  gradients: {
    tab: ["#14213D", "#6BC1FF"],     // dark indigo to energy blue
    drawer: ["#0D1B2A", "#1F2D44"],  // subtle deep blues for drawers
  },
  polygonGradient: ["#6BC1FF66", "#8F00FF55"], // cursed-energy aura glow
  opacity: { light: 0.85, medium: 0.55, heavy: 0.35 },
},
GojoTheme: {
  id: "GojoTheme",
  name: "Gojo Satoru",
  type: "Premium",
  background: {
    type: "image",
    gradient: ["#6EC6FF", "#0B2545"], // light cyan → deep indigo
    color: "#081B2B", // fallback background
    image: require("../assets/gojo-art.jpg"), // your uploaded image
  },
  text: {
    primary: "#EAF6FF",   // icy white-blue for main text
    secondary: "#A9D4FF", // soft light-blue for subtext
    accent: "#67E8F9",    // bright cyan for emphasis/glow
  },
  components: {
    card: "#102A43",      // dark navy-blue card background
    box: "#183D5A",       // slightly lighter blue container
    border: "#67E8F9",    // glowing cyan edge
  },
  gradients: {
    tab: ["#0B2545", "#67E8F9"],     // dark to glowing cyan
    drawer: ["#081B2B", "#15314B"],  // deep muted blues
  },
  polygonGradient: ["#67E8F955", "#6EC6FF88"], // translucent cyan energy aura
  opacity: { light: 0.9, medium: 0.6, heavy: 0.3 },
}



};
