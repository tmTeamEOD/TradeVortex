// src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import boardReducer from './slices/boardSlice';
import postReducer from './slices/postSlice';
import themeReducer from './slices/themeSlice';


const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    board: boardReducer,
    post: postReducer,
  },
});

export default store;
