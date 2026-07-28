import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import firestore from "@react-native-firebase/firestore";

export const fetchBanners = createAsyncThunk(
  "banner/fetchBanners",
  async ({ campusId }, { rejectWithValue }) => {
    try {
      let banners = [];

      // ----------------------------------
      // Try campus-specific banners first
      // ----------------------------------
      if (campusId) {
        const collegeSnap = await firestore()
          .collection("banners")
          .where("collegeId", "==", campusId)
          .get();

        if (!collegeSnap.empty) {
          banners = collegeSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          return banners;
        }
      }

      // ----------------------------------
      // Fallback to default banners
      // ----------------------------------
      const defaultSnap = await firestore()
        .collection("banners")
        .where("scope", "==", "default")
        .get();

      banners = defaultSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return banners;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const bannerSlice = createSlice({
  name: "banner",

  initialState: {
    banners: [],
    loading: false,
    error: null,
    lastFetchedAt: null,
  },

  reducers: {
    clearBanners: state => {
      state.banners = [];
      state.error = null;
      state.lastFetchedAt = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(fetchBanners.pending, state => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
        state.lastFetchedAt = Date.now();
      })

      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectBanners = state => state.banner.banners;

export const selectHomeBanners = state =>
  state.banner.banners.filter(
    banner => banner.bannerType === "home"
  );

export const selectMindBloomBanners = state =>
  state.banner.banners.filter(
    banner => banner.bannerType === "mindbloom"
  );

export const { clearBanners } = bannerSlice.actions;

export default bannerSlice.reducer;