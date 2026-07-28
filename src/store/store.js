import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";

import userReducer from "./userSlice";
import storyReducer from "./storySlice";
import auraChatReducer from "./AuraChatSlice";
import otherProfileReducer from "./otherProfileSlice";
import notificationReducer from "./notificationSlice";
import chatReducer from "./chatSlice";
import unreadReducer from "./unreadSlice";
import messagereducer from "./messageSlice";
import commentReducer from './commentSlice'
import leaderboardReducer from './leaderboardSlice'
import connectReducer from './connectSlice'
import storyCreatorReducer from './storyCreatorSlice'
import puzzleReducer from './puzzleSlice'
import tetrisGameReducer from "./tetrisGameSlice";
import sudokuReducer from "./sudokuSlice";
import quizReducer from "./quizSlice";
import deviceReducer from "./deviceSlice";
import wordGameReducer from "./wordGameSlice";
import ballSortReducer from "./ballSortSlice";
import kenkenReducer from "./kenkenSlice";
import zipReducer from "./zipSlice";
import game2048Reducer from "./game2048Slice";
import mathMazeReducer from "./mathMazeSlice";
import bannerReducer from "./bannerSlice";
import journalReducer from "./journalSlice";
import ticTacToeReducer from "./ticTacToeSlice";

import { messageGapListener } from "./messageGapListener";



import { createTransform } from "redux-persist";
export const LOGOUT = "LOGOUT";
export const logout = () => ({ type: LOGOUT });
const storyTransform = createTransform(
  // inbound: state being persisted
  (inboundState) => ({
    stories: inboundState.stories.map(group => ({
      ...group,
      stories: group.stories.filter(story => story.status === "ACCEPTED")
    }))
  }),
  // outbound: state being rehydrated
  (outboundState) => outboundState,
  { whitelist: ["story"] }
);
const chatTransform = createTransform(
  // inbound → storing in storage
  (inboundState) => ({
    chats: inboundState.chats,
    lastFetchedAt: inboundState.lastFetchedAt,
  }),
  // outbound → rehydrating
  (outboundState) => ({
    ...outboundState,
    loading: false,
    error: null,
    currently_active_chat_id: null,
    chatsFetchedFromServer: false, // always mark for fresh fetch
    messageBootstrapPage: 0,
    pageSize: 10,
    
  }),
  { whitelist: ["chats"] }
);
const messagesTransform = createTransform(
  // INBOUND (persist)
  (inboundState) => {
    const messagesByChat = {};

    for (const chatId in inboundState.messagesByChat) {
      const chat = inboundState.messagesByChat[chatId];

      messagesByChat[chatId] = {
        persistMessages: chat.persistMessages,
        lastSeq: chat.lastSeq ?? null
      };
    }

    return { messagesByChat };
  },

  // OUTBOUND (rehydrate)
  (outboundState) => {
    const messagesByChat = {};

    for (const chatId in outboundState.messagesByChat) {
      const stored = outboundState.messagesByChat[chatId];
      const persist = stored.persistMessages;

      messagesByChat[chatId] = {
        messages: persist.messages,
        persistMessages: persist,

        cursor: persist.cursor ?? null,
        hasMore: true,

        lastSeq: stored.lastSeq ?? null,

        isLoading: false,
        hasError: false,
        syncLoading: false,
        syncError: false,
          syncingGap: false,
          syncGapError:false,
      gapRange: null,
      buffered: [],
      };
    }

    return { messagesByChat };
  },

  { whitelist: ["messages"] }
);
const mathPuzzleTransform = createTransform(
  (inboundState) => ({
    level: inboundState.level,
    score: inboundState.score,
    completedLevels: inboundState.completedLevels,
    hintUsed: inboundState.hintUsed,
    lastReward: inboundState.lastReward,
    puzzle: inboundState.puzzle,
  }),
  (outboundState) => ({
    level: outboundState.level ?? 1,
    score: outboundState.score ?? 0,
    completedLevels: outboundState.completedLevels ?? 0,
    hintUsed: outboundState.hintUsed ?? false,
    lastReward: outboundState.lastReward ?? 0,
    puzzle: outboundState.puzzle,
  }),
  { whitelist: ["mathPuzzle"] }
);

const tetrisTransform = createTransform(
  (inboundState) => ({
    auraEarned: inboundState.auraEarned,
  }),
  (outboundState) => ({
    status: "idle",
    score: 0,
    level: 1,
    linesCleared: 0,
    dropInterval: 400,
    board: Array.from({ length: 20 }, () => Array(10).fill(0)),
    currentPiece: null,
    nextPiece: null,
    startedAt: null,
    pausedAt: null,
    auraEarned: outboundState.auraEarned ?? 0,
    lastAuraCheckpoint: 0,
  }),
  { whitelist: ["tetrisGame"] }
);

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user",
        "story",        // ✅ persist story
    "leaderboard",  // ✅ persist leaderboard
    "connect",  // ✅ persist leaderboard
    "chats","device","wordGame","ballSort","tetrisGame","mathPuzzle","kenken","sudoku","zip","game2048","mathMaze","journal","ticTacToe"],
  transforms: [storyTransform,chatTransform,mathPuzzleTransform,tetrisTransform],
};

const appReducer = combineReducers({
  user: userReducer,
  story:storyReducer,
  auraChat:auraChatReducer,
  otherProfile: otherProfileReducer,
  notifications:notificationReducer,
  chats:chatReducer,
  unread:unreadReducer,
  messages:messagereducer,
  comment:commentReducer,
  leaderboard:leaderboardReducer,
  connect:connectReducer,
  storyCreator:storyCreatorReducer,
  mathPuzzle: puzzleReducer,
   tetrisGame: tetrisGameReducer,
   sudoku:sudokuReducer,
   quiz:quizReducer,
       device: deviceReducer,
       wordGame: wordGameReducer,
       ballSort: ballSortReducer,
       kenken: kenkenReducer,
       zip: zipReducer,
       game2048: game2048Reducer,
       mathMaze: mathMazeReducer,
       banner: bannerReducer,
       journal: journalReducer,
       ticTacToe: ticTacToeReducer,
});
const rootReducer = (state, action) => {
  if (action.type === LOGOUT) {
    state = {
      device: state?.device, // preserve device state
    };
  }

  return appReducer(state, action);
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).prepend(
      messageGapListener.middleware
    ),
});

export const persistor = persistStore(store);
