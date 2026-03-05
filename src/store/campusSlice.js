import { createSlice } from "@reduxjs/toolkit";
import firestore from "@react-native-firebase/firestore";

// 🏁 Initial state
const initialState = {
  campusInfo: null,
  isCampusLoading: true,
  campusError: null,
};

// 🧩 Slice
const campusSlice = createSlice({
  name: "campus",
  initialState,
  reducers: {
    setCampusInfo: (state, action) => {
      state.campusInfo = action.payload;
      state.isCampusLoading = false;
      state.campusError = null;
    },
    setCampusError: (state, action) => {
      state.campusError = action.payload;
      state.isCampusLoading = false;
    },
    setCampusLoading: (state) => {
      state.isCampusLoading = true;
    },
  },
});

export const { setCampusInfo, setCampusError, setCampusLoading } = campusSlice.actions;
export default campusSlice.reducer;

//
// 🔥 Firestore real-time listener (React Native Firebase version)
//
export const subscribeToCampus = (docId) => (dispatch) => {
  if (!docId) {
    dispatch(setCampusError("Invalid document ID."));
    return;
  }

  dispatch(setCampusLoading());

  try {
    const docRef = firestore().collection("campuses").doc(docId);

    const unsubscribe = docRef.onSnapshot(
      (snapshot) => {
        if (snapshot.exists) {
          dispatch(setCampusInfo({ id: snapshot.id, ...snapshot.data() }));
        } else {
          dispatch(setCampusError("Campus not found."));
        }
      },
      (error) => {
        console.error("Firestore subscribe error:", error);
        dispatch(setCampusError(error.message));
      }
    );

    return unsubscribe; // cleanup
  } catch (err) {
    console.error("Campus subscribe failed:", err);
    dispatch(setCampusError(err.message));
  }
};
