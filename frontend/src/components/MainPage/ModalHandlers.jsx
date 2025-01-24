// src/components/MainPage/ModalHandlers.jsx
import React from "react";
import { FaRobot } from "react-icons/fa";
import AiAgent from "../AiAgent.jsx";
import ChatApp from "../ChatApp.jsx";

const ModalHandlers = ({
  isAiAgentOpen,
  setIsAiAgentOpen,
  isChatBotOpen,
  setIsChatBotOpen,
}) => {
  return (
    <>
      {/* 챗봇 및 AI 에이전트 호출 버튼 */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4">
        <button
          onClick={() => setIsChatBotOpen(true)}
          className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300"
          aria-label="챗봇 열기"
        >
          <FaRobot size={30} />
        </button>

        <button
          onClick={() => setIsAiAgentOpen(true)}
          className="p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors duration-300"
          aria-label="AI 에이전트 열기"
        >
          <FaRobot size={30} />
        </button>
      </div>

      {/* 모달들 */}
      <AiAgent isOpen={isAiAgentOpen} closeModal={() => setIsAiAgentOpen(false)} />
      <ChatApp isOpen={isChatBotOpen} closeModal={() => setIsChatBotOpen(false)} />
    </>
  );
};

export default React.memo(ModalHandlers);
