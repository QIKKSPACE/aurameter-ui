export const UNLOCKED_THEME_IDS = new Set([
  "dark",
  "DemonSlayer",
  "GryffindorTheme",
  "PokemonYellow",
]);

export const isThemeUnlocked = (themeId) => UNLOCKED_THEME_IDS.has(themeId);
