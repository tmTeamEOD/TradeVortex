// src/redux/slices/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: "", // 알림 메시지 초기값
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotification(state, action) {
      state.message = action.payload; // 알림 메시지 설정
    },
    clearNotification(state) {
      state.message = ""; // 알림 메시지 초기화
    },
  },
});

export const { setNotification, clearNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
