// src/hooks/useAppStateReconnect.ts
import { useEffect } from "react";
import { AppState } from "react-native";
import { reconnectAllSockets } from "../services/socketManager";

export const useAppStateReconnect = () => {
  useEffect(() => {
    let current = AppState.currentState;

    const sub = AppState.addEventListener("change", async next => {
      if (current.match(/inactive|background/) && next === "active") {
        await reconnectAllSockets();
      }
      current = next;
    });

    return () => sub.remove();
  }, []);
};
