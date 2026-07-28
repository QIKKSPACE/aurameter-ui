import axios from "axios";

const API_BASE_URL = "https://api.aurameter.in"; // 🔹 replace with your backend URL

//https://api.aurameter.in
// Refresh the access token using refresh token
export const refreshWithToken = async (refreshToken,deviceId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
      deviceId
    });
    return response.data; // expect { accessToken, refreshToken }
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Logout (invalidate refresh token on server)
export const logoutApi = async (refreshToken) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/logout`, {
      refreshToken,
    });
    return response.data; // maybe { success: true }
  } catch (error) {
    throw error.response?.data || error;
  }
};
