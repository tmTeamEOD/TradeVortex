import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatApp = ({ closeModal }) => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode); // Redux에서 다크모드 상태 가져오기
  const [messages, setMessages] = useState([
    { sender: "챗봇", text: "안녕하세요! 무엇이든 물어보세요 😊", time: new Date().toLocaleTimeString() },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark"); // 다크모드 클래스 추가
    } else {
      document.documentElement.classList.remove("dark"); // 다크모드 클래스 제거
    }
  }, [isDarkMode]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = { sender: "You", text: userInput, time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/aiassist/bot/", {
        inputs: { question: userInput },
      });

      const botReplies = Array.isArray(response.data.result.raw)
        ? response.data.result.raw
        : [response.data.result.raw];

      setMessages((prev) => [
        ...prev,
        ...botReplies.map((text) => ({ sender: "챗봇", text, time: new Date().toLocaleTimeString() })),
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "Error", text: "오류가 발생했습니다. 다시 시도해주세요.", time: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <motion.div
      className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md h-[700px] flex flex-col z-50"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
    >
      {/* 헤더 */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h3 className="text-xl font-semibold">챗봇</h3>
        <button
          onClick={closeModal}
          className="text-3xl text-gray-500 hover:text-gray-800 focus:outline-none"
        >
          ✕
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-4 rounded-lg max-w-xs ${
                msg.sender === "You"
                  ? "bg-blue-100 text-gray-800"
                  : msg.sender === "Error"
                  ? "bg-red-100 text-gray-800"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              <div className="text-xs text-gray-500 mt-1">{msg.time}</div>
            </div>
          </div>
        ))}
        {loading && (
          <motion.div
            className="flex items-center space-x-2 pl-2" // 왼쪽 여백 추가
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gray-500 rounded-full ml-1" // 점들 간 여백 추가
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="mt-4 flex items-center">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="무엇이든 물어보세요..."
          className="flex-1 p-3 border rounded-md resize-none shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 text-black"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className={`ml-4 px-6 py-2 rounded-md text-white ${
            loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "..." : "보내기"}
        </button>
      </div>
    </motion.div>
  );
};

export default ChatApp;
