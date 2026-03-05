// src/context/ThemeContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themes } from "../themes";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState("dark");
  const [isReady, setIsReady] = useState(false);

  // To restore after temporary theme
  const savedThemeRef = useRef(null);

  // Load saved theme from storage once at startup
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem("appTheme");
        if (saved && themes[saved]) {
          setThemeId(saved);
        }
        savedThemeRef.current = saved || "dark";
      } catch (e) {
        console.warn("Failed to load theme:", e);
      } finally {
        setIsReady(true);
      }
    };
    loadTheme();
  }, []);

  /**
   * Set full app theme and write to AsyncStorage
   */
  const setTheme = async (id) => {
    if (!themes[id]) return;
    setThemeId(id);

    try {
      await AsyncStorage.setItem("appTheme", id);
      savedThemeRef.current = id;
    } catch (e) {
      console.warn("Failed to save theme:", e);
    }
  };

  /**
   * Set theme ONLY for temporary screens like OtherProfile
   * Won't save to disk
   */
  const setTemporaryTheme = (id) => {
    if (themes[id]) {
      setThemeId(id);
    }
  };

  /**
   * Restore theme back from AsyncStorage (e.g. when leaving OtherProfile)
   */
  const restoreSavedTheme = () => {
    if (savedThemeRef.current && themes[savedThemeRef.current]) {
      setThemeId(savedThemeRef.current);
    }
  };

  const theme = useMemo(() => themes[themeId], [themeId]);

  const value = useMemo(
    () => ({
      themeId,
      theme,
      setTheme,
      setTemporaryTheme,
      restoreSavedTheme,
    }),
    [themeId, theme]
  );

  if (!isReady) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
