import { createSlice } from "@reduxjs/toolkit";
import { uuidv4 } from "../utils/uuid";

const initialState = {
  local_id: "",
  music: null,
  location: null,
  layers: [],
};

const storyCreatorSlice = createSlice({
  name: "storyCreator",
  initialState,
  reducers: {
    // Start a new story
    createStory: (state) => {
      state.local_id = uuidv4();
      state.music = null;
      state.location = null;
      state.layers = [];
    },

    // Set music for story
    setMusic: (state, action) => {
      state.music = action.payload;
    },

    // Set location for story
    setLocation: (state, action) => {
      state.location = action.payload;
    },

    // Add a new layer
    addLayer: (state, action) => {
      // action.payload must be an object like { type, x, y, scale, rotation, zIndex, data }
      state.layers.push(action.payload);
    },

    // Update any layer property dynamically
    updateLayer: (state, action) => {
      // action.payload: { id, changes }
      const { id, changes } = action.payload;
      state.layers = state.layers.map((layer) =>
        layer.id === id ? { ...layer, ...changes } : layer
      );
    },

    // Remove a layer by id
    removeLayer: (state, action) => {
      const layerId = action.payload;
      state.layers = state.layers.filter((layer) => layer.id !== layerId);
    },

    // Reset the story completely
    resetStory: (state) => {
      state.local_id = "";
      state.music = null;
      state.location = null;
      state.layers = [];
    },
  },
});

export const {
  createStory,
  setMusic,
  setLocation,
  addLayer,
  updateLayer,
  removeLayer,
  resetStory,
} = storyCreatorSlice.actions;

export default storyCreatorSlice.reducer;
