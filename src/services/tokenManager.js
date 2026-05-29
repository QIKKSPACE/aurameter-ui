import { refreshWithToken } from "./authApi";
import { logout, store } from "../store/store";
import { refreshStarted, refreshSucceeded, refreshFailed, logoutInitiated } from "../store/userSlice";
import {initiateLogout} from './logoutService'
let isRefreshing = false;
let failedQueue = [];
let lastRefreshAt = 0;
   
const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};
       
export async function ensureFreshToken(force = false) {
  const state = store.getState();

const user = state.user;
const deviceId = state.device.deviceId;
  const now = Date.now();
if (user?.isLoggingOut) {
  throw new Error("Logout in progress");
}
  if (!user?.refreshToken) return null;

  // skip if recently refreshed and not forced
  if (!force && now - lastRefreshAt < 1* 60 * 1000) {
    return user.token;
  }
   
  if (isRefreshing) {
    return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }));
  }

  try {
    isRefreshing = true;
    store.dispatch(refreshStarted());

    const data = await refreshWithToken(user.refreshToken, deviceId);

    store.dispatch(refreshSucceeded({
      token: data.accessToken,
      userData: data.user,
      refreshToken: data.refreshToken,
    }));

    lastRefreshAt = Date.now();
    isRefreshing = false;
    processQueue(null, data.accessToken);

    return data.accessToken;
  } catch (err) {
  const status = err?.response?.status;

  store.dispatch(refreshFailed(err?.message));
  isRefreshing = false;
  processQueue(err, null);
 console.error(err)

  // 🚨 Logout ONLY if refresh token is invalid
if (
  (err?.statusCode === 401 || err?.statusCode === 403 || err?.statusCode === 404) &&
  !store.getState().user.isLoggingOut
) {
  // 1️⃣ reject all queued requests
    flushFailedQueue(new Error("Logged out due to invalid refresh token"));

  // 2️⃣ trigger logout modal + redux cleanup
  initiateLogout({ reason: "Something Went Wrong, Logging You Out" });

}
  throw err;
  }
}

export function flushFailedQueue(error) {
  failedQueue.forEach(p => p.reject(error));
  failedQueue = [];
}
