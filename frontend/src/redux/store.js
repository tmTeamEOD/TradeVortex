// src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import boardReducer from './slices/boardSlice.js';
import postReducer from './slices/postSlice.js';
import themeReducer from './slices/themeSlice.js';


const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    board: boardReducer,
    post: postReducer,
  },
});

export default store;
