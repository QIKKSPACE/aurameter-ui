import axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import { store, logout } from "../store/store";
import { logoutInitiated } from "../store/userSlice";
import { disconnectAllSockets } from "./socketManager";
import api from "./api";

let isLoggingOut = false;

export async function initiateLogout({
  reason = "Something went wrong. Logging you out…",
  delayMs = 2000,
} = {}) {
  if (isLoggingOut) return;
  isLoggingOut = true;

  // 🔥 1️⃣ TELL REDUX IMMEDIATELY → modal shows
  store.dispatch(logoutInitiated(reason));

  const state = store.getState();
  const refreshToken = state.user?.refreshToken;

 try {
  

  await wait(delayMs);

    // 3️⃣ Disconnect sockets
    disconnectAllSockets();

    // 4️⃣ Backend logout (offline-safe)
    const net = await NetInfo.fetch();
  

    if (refreshToken) {
    try {
       await api.post("/auth/logout", { refreshToken });
    } catch (error) {
       console.error(error)   
    }
    }
 } catch (error) {
   console.log(error)
 } finally {
    // 5️⃣ HARD RESET (modal disappears because redux resets)
    store.dispatch(logout());
    isLoggingOut = false;
  }
}

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}
