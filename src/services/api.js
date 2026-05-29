import axios from "axios";
import { ensureFreshToken } from "./tokenManager";
import { store } from "../store/store";

const api = axios.create({
  baseURL: "http://localhost:5001",
});

// Attach token before request (no refresh here)
api.interceptors.request.use(async config => {
  const { token } = store.getState().user || {};
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor handles 401
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    // Only handle 401 and retry once
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Refresh token (force)
      const newToken = await ensureFreshToken(true); // force refresh
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
