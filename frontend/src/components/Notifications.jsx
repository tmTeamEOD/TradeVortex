// src/components/Notification.jsx
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { clearNotification } from "../redux/slices/notificationSlice";  // 알림 액션

const Notification = () => {
  const dispatch = useDispatch();
  const message = useSelector((state) => state.notification.message);  // Redux에서 알림 메시지 가져오기

  const handleClose = () => {
    dispatch(clearNotification());  // 알림을 닫을 때 Redux 상태 초기화
  };

  if (!message) return null;  // 메시지가 없으면 아무것도 렌더링하지 않음

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 max-w-xs w-full bg-blue-500 text-white rounded-lg shadow-lg p-4 flex items-start space-x-2 z-50"
    >
      <div className="flex-1">
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={handleClose}
        aria-label="Close Notification"
        className="text-white hover:text-gray-200 focus:outline-none"
      >
        &times;
      </button>
    </motion.div>
  );
};

export default Notification;
