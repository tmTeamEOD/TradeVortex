// src/components/NotificationHandler.jsx
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setNotification } from "../redux/slices/notificationSlice";  // 알림 액션

const NotificationHandler = ({ userId }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    const socket = new WebSocket(`ws://192.168.0.6:8000/ws/notify_${userId}/`);

    socket.onopen = () => {
      console.log("WebSocket 연결됨");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      dispatch(setNotification(data.message));  // 수신한 메시지를 Redux 상태에 저장
    };

    socket.onclose = () => {
      console.log("WebSocket 연결 종료");
    };

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [dispatch, userId]);

  return null;
};

export default NotificationHandler;
