import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  entries: [],
  page: 1,
  hasMore: true,
};

const journalSlice = createSlice({
  name: "journal",
  initialState,
  reducers: {
    setJournalPage: (state, action) => {
      state.page = action.payload;
    },
    setJournalHasMore: (state, action) => {
      state.hasMore = Boolean(action.payload);
    },
    setJournalEntries: (state, action) => {
      state.entries = action.payload;
    },
    appendJournalEntries: (state, action) => {
      const nextEntries = action.payload || [];
      const existingIds = new Set(state.entries.map((entry) => entry.id));
      nextEntries.forEach((entry) => {
        if (!existingIds.has(entry.id)) {
          state.entries.push(entry);
        }
      });
    },
    prependJournalEntry: (state, action) => {
      const entry = action.payload;
      if (!entry?.id) return;

      state.entries = [
        entry,
        ...state.entries.filter((item) => item.id !== entry.id),
      ];
    },
    resetJournal: () => initialState,
  },
});

export const {
  setJournalPage,
  setJournalHasMore,
  setJournalEntries,
  appendJournalEntries,
  prependJournalEntry,
  resetJournal,
} = journalSlice.actions;

export const selectJournalEntries = (state) => state.journal.entries;
export const selectJournalPage = (state) => state.journal.page;
export const selectJournalHasMore = (state) => state.journal.hasMore;

export default journalSlice.reducer;
