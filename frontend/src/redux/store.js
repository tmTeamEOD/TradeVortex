// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import boardReducer from './slices/boardSlice.js';
import postReducer from './slices/postSlice.js';
import themeReducer from './slices/themeSlice.js';
import notificationReducer from './slices/notificationSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    board: boardReducer,
    post: postReducer,
    notification: notificationReducer,  // 알림 상태를 관리하는 리듀서 추가
  },
});

export default store;
