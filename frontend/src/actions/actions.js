// src/actions/actions.js

// 알림 메시지를 설정하는 액션
export const setNotification = (message) => ({
  type: "SET_NOTIFICATION",
  payload: message,
});

// 알림 메시지를 초기화하는 액션
export const clearNotification = () => ({
  type: "CLEAR_NOTIFICATION",
});
