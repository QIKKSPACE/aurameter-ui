// src/store/userSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { persistor } from "./store";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,     // full user object
    token: null,        // access token
    refreshToken: null, // refresh token
    status: "idle",     // "idle" | "loading" | "succeeded" | "failed"
    error: null,
    profileCompletion: 0, // new field
    deviceId:null,
    isLoggingOut:false,
      authError: null,  
  },
  reducers: {
    setUser: (state, action) => {
      state.userData = action.payload.userData;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.status = "succeeded";
      state.error = null;
      state.profileCompletion = calculateProfileCompletion(state.userData);
    },
    clearUser: (state) => {
      state.userData = null;
      state.token = null;
      state.refreshToken = null;
      state.status = "idle";
      state.error = null;
    },
    setToken: (state, action) => {
      state.token = action.payload; // update only access token
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload; // update only refresh token
    },
    setTokens: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
      setDeviceId: (state, action) => {
      state.deviceId = action.payload; // update only access token
    },
    updateUserField: (state, action) => {
  if (state.userData) {
    state.userData = {
      ...state.userData,
      [action.payload.field]: action.payload.value,
    };
    state.profileCompletion = calculateProfileCompletion(state.userData);
  }
},
    updateUserData: (state, action) => {
      if (state.userData) {
        state.userData = {
          ...state.userData,
          ...action.payload,
        };
      }
    state.profileCompletion = calculateProfileCompletion(state.userData);

    },

    // refresh-token flow
    refreshStarted: (state) => {
      state.status = "loading";
      state.error = null;
    },
    refreshSucceeded: (state, action) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      if (action.payload.userData) {
        state.userData = {
          ...state.userData,
          ...action.payload.userData,
        };
      }
      state.status = "succeeded";
      state.error = null;
    },
    refreshFailed: (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Token refresh failed";
    },

    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  logoutInitiated(state, action) {
      state.isLoggingOut = true;
      state.authError = action.payload || "Logging out…";
    },
  },
});
const calculateProfileCompletion = (userData) => {
  if (!userData) return 0;

  const requiredFields = [
    userData.avatar,   // profile picture
    userData.zodiac,
    userData.name,
    userData.bio,
    userData.dob,
    userData.gender,
    userData.is_verified, // email verified
  ];

  const filledCount = requiredFields.filter(Boolean).length;
  return filledCount / requiredFields.length;
};
export const {
  setUser,
  clearUser,
  setToken,
  setRefreshToken,
  setTokens,
  updateUserField,
  updateUserData,
  refreshStarted,
  refreshSucceeded,
  refreshFailed,
  setStatus,
  setError,
  setDeviceId,
   logoutInitiated,
} = userSlice.actions;

export default userSlice.reducer;
