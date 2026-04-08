/**
 * Theme Configuration for Zip Challenge
 * Each level has a unique gradient theme
 */

import type { Theme } from "./ZipTypes";

export const LEVEL_THEMES: Theme[] = [
  // Level 1-5: Cool & Vibrant
  {
    id: 1,
    primary: "#FF00FF",
    secondary: "#8A2BE2",
    accent: "#FFB6FF",
    gradient: ["#FF00FF", "#8A2BE2"],
  },
  {
    id: 2,
    primary: "#FF7A00",
    secondary: "#FFD700",
    accent: "#FFB347",
    gradient: ["#FF7A00", "#FFD700"],
  },
  {
    id: 3,
    primary: "#00C6FF",
    secondary: "#0072FF",
    accent: "#40B0FF",
    gradient: ["#00C6FF", "#0072FF"],
  },
  {
    id: 4,
    primary: "#00FF87",
    secondary: "#00B359",
    accent: "#7FFF7F",
    gradient: ["#00FF87", "#00B359"],
  },
  {
    id: 5,
    primary: "#FF1493",
    secondary: "#FF69B4",
    accent: "#FFB6D9",
    gradient: ["#FF1493", "#FF69B4"],
  },

  // Level 6-10: Deep & Rich
  {
    id: 6,
    primary: "#1E90FF",
    secondary: "#0047AB",
    accent: "#6EB5FF",
    gradient: ["#1E90FF", "#0047AB"],
  },
  {
    id: 7,
    primary: "#FF6347",
    secondary: "#DC143C",
    accent: "#FF9370",
    gradient: ["#FF6347", "#DC143C"],
  },
  {
    id: 8,
    primary: "#00CED1",
    secondary: "#008B8B",
    accent: "#7FFFD4",
    gradient: ["#00CED1", "#008B8B"],
  },
  {
    id: 9,
    primary: "#FFD700",
    secondary: "#FFA500",
    accent: "#FFED4E",
    gradient: ["#FFD700", "#FFA500"],
  },
  {
    id: 10,
    primary: "#9370DB",
    secondary: "#663399",
    accent: "#BA55D3",
    gradient: ["#9370DB", "#663399"],
  },

  // Level 11-15: Neon & Electric
  {
    id: 11,
    primary: "#39FF14",
    secondary: "#00FF00",
    accent: "#CCFF00",
    gradient: ["#39FF14", "#00FF00"],
  },
  {
    id: 12,
    primary: "#FF10F0",
    secondary: "#B20FFF",
    accent: "#FF69FF",
    gradient: ["#FF10F0", "#B20FFF"],
  },
  {
    id: 13,
    primary: "#0DCCFF",
    secondary: "#0099FF",
    accent: "#40E0D0",
    gradient: ["#0DCCFF", "#0099FF"],
  },
  {
    id: 14,
    primary: "#FF006E",
    secondary: "#FB5607",
    accent: "#FFBE0B",
    gradient: ["#FF006E", "#FB5607"],
  },
  {
    id: 15,
    primary: "#00E5FF",
    secondary: "#00B8D4",
    accent: "#81D4FA",
    gradient: ["#00E5FF", "#00B8D4"],
  },

  // Level 16-20: Soft & Warm
  {
    id: 16,
    primary: "#FF85B3",
    secondary: "#FF6BA6",
    accent: "#FFB3D9",
    gradient: ["#FF85B3", "#FF6BA6"],
  },
  {
    id: 17,
    primary: "#FFB347",
    secondary: "#FF8C00",
    accent: "#FFDAB9",
    gradient: ["#FFB347", "#FF8C00"],
  },
  {
    id: 18,
    primary: "#87CEEB",
    secondary: "#4682B4",
    accent: "#B0E0E6",
    gradient: ["#87CEEB", "#4682B4"],
  },
  {
    id: 19,
    primary: "#98D8C8",
    secondary: "#6AA89F",
    accent: "#C3E7DC",
    gradient: ["#98D8C8", "#6AA89F"],
  },
  {
    id: 20,
    primary: "#F7B731",
    secondary: "#E67E22",
    accent: "#F9D5A8",
    gradient: ["#F7B731", "#E67E22"],
  },

  // Level 21-25: Bold & Dark
  {
    id: 21,
    primary: "#FF0080",
    secondary: "#7F0040",
    accent: "#FF66B2",
    gradient: ["#FF0080", "#7F0040"],
  },
  {
    id: 22,
    primary: "#00FFFF",
    secondary: "#0080FF",
    accent: "#80FFFF",
    gradient: ["#00FFFF", "#0080FF"],
  },
  {
    id: 23,
    primary: "#FFFF00",
    secondary: "#FF8800",
    accent: "#FFFF99",
    gradient: ["#FFFF00", "#FF8800"],
  },
  {
    id: 24,
    primary: "#00FF00",
    secondary: "#00AA00",
    accent: "#7FFF7F",
    gradient: ["#00FF00", "#00AA00"],
  },
  {
    id: 25,
    primary: "#FF00FF",
    secondary: "#FF0080",
    accent: "#FF80FF",
    gradient: ["#FF00FF", "#FF0080"],
  },

  // Level 26-30: Ultra Vibrant & Gradient
  {
    id: 26,
    primary: "#FF5733",
    secondary: "#00BFFF",
    accent: "#FF8B94",
    gradient: ["#FF5733", "#00BFFF"],
  },
  {
    id: 27,
    primary: "#00FF7F",
    secondary: "#FF1493",
    accent: "#7FFF00",
    gradient: ["#00FF7F", "#FF1493"],
  },
  {
    id: 28,
    primary: "#8B008B",
    secondary: "#FFD700",
    accent: "#DDA0DD",
    gradient: ["#8B008B", "#FFD700"],
  },
  {
    id: 29,
    primary: "#00FFFF",
    secondary: "#FF00FF",
    accent: "#FFFF00",
    gradient: ["#00FFFF", "#FF00FF"],
  },
  {
    id: 30,
    primary: "#FF69B4",
    secondary: "#00CED1",
    accent: "#7FFFD4",
    gradient: ["#FF69B4", "#00CED1"],
  },
];

export const getThemeForLevel = (levelId: number): Theme => {
  const index = Math.min(levelId - 1, LEVEL_THEMES.length - 1);
  return LEVEL_THEMES[index];
};
