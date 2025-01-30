import React, { useState, useRef, useEffect, memo } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatApp = memo(({ closeModal }) => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      sender: "챗봇",
      text: "안녕하세요! 무엇이든 물어보세요 😊",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "You",
      text: userInput,
      time: new Date().toLocaleTimeString(),
    };
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
        ...botReplies.map((text) => ({
          id: Date.now() + Math.random(),
          sender: "챗봇",
          text,
          time: new Date().toLocaleTimeString(),
        })),
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "Error",
          text: "오류가 발생했습니다. 다시 시도해주세요.",
          time: new Date().toLocaleTimeString(),
        },
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

  return (
    <motion.div
      className={`fixed bottom-4 right-4 ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
      } p-6 rounded-2xl shadow-lg w-full max-w-md h-[700px] flex flex-col z-50 border`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
    >
      {/* 헤더 */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h3 className="text-xl font-semibold">💬 챗봇</h3>
        <button
          onClick={closeModal}
          className="text-2xl text-gray-500 hover:text-red-500 transition-all"
        >
          ✕
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: msg.sender === "You" ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs text-sm shadow-md ${
                msg.sender === "You"
                  ? "bg-blue-500 text-white"
                  : msg.sender === "Error"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              <div className="text-xs opacity-70 mt-1 text-right">{msg.time}</div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start items-center space-x-2">
            <motion.div
              className="p-3 rounded-lg max-w-xs text-sm shadow-md bg-gray-200 text-black"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              ✨ 챗봇이 응답 중...
            </motion.div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="mt-3 flex items-center space-x-2">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="무엇이든 물어보세요..."
          className="flex-1 p-3 border rounded-md resize-none shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 scrollbar-thin"
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white font-semibold ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          } transition-all`}
        >
          {loading ? "..." : "📩"}
        </button>
      </div>
    </motion.div>
  );
});

export default ChatApp;
