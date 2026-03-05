// storyPollingLifecycle.js
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import {
  startStoryPolling,
  stopStoryPolling,
} from "./storyPollingService";

let currentAppState = AppState.currentState;
let isConnected = true;
let initialized = false;

let appStateSub = null;
let netInfoUnsub = null;

export function initStoryPollingLifecycle() {
  if (initialized) return;
  initialized = true;

  // App foreground / background
  appStateSub = AppState.addEventListener("change", nextState => {
    currentAppState = nextState;

    if (nextState === "active" && isConnected) {
      startStoryPolling();
    } else {
      stopStoryPolling();
    }
  });

  // Network connectivity
  netInfoUnsub = NetInfo.addEventListener(state => {
    isConnected = !!state.isConnected;

    if (isConnected && currentAppState === "active") {
      startStoryPolling();
    } else {
      stopStoryPolling();
    }
  });
}
