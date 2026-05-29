import { createSlice } from "@reduxjs/toolkit";

const deviceSlice = createSlice({
  name: "device",
  initialState: {
    deviceId: null,
  },
  reducers: {
    setDeviceId: (state, action) => {
      state.deviceId = action.payload;
    },
  },
});

export const { setDeviceId } = deviceSlice.actions;

export default deviceSlice.reducer;