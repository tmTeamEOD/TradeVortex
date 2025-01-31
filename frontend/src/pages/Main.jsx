import React, { useState, lazy, Suspense } from "react";
import Marquee from "react-fast-marquee";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// 동적 임포트
const Navigation = lazy(() => import("../components/Navigation.jsx"));
const ChartManager = lazy(() => import("../components/Charts/ChartManager.jsx"));
const Boards = lazy(() => import("../components/Boards.jsx"));
const Sidebar = lazy(() => import("../components/Sidebar.jsx"));
const AiAgent = lazy(() => import("../components/AiAgent.jsx"));
const CoinStatus = lazy(() => import("../components/Charts/CoinStatus.jsx"));

const Main = () => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const navigate = useNavigate();
    const [isAiAgentOpen, setIsAiAgentOpen] = useState(false);

    const openAiAgent = () => setIsAiAgentOpen(true);
    const closeAiAgent = () => setIsAiAgentOpen(false);

    const coinSymbols = ["KRW-BTC", "KRW-ETH", "KRW-XRP", "KRW-BCH"];

    return (
        <div
            className={`relative min-h-screen transition-colors duration-300 ${
                isDarkMode ? "bg-gray-900 text-gray-50" : "bg-gray-100 text-gray-900"
            }`}
        >
            <Suspense fallback={<div>Loading...</div>}>
                {/* 상단 코인 정보 */}
                <div
                    className="bg-indigo-600 text-white py-2 shadow-md sticky top-[calc(var(--nav-height, 60px))] z-10"
                    style={{ marginTop: "var(--nav-height, 60px)" }}
                >
                    <Marquee speed={50} gradient={false}>
                        {coinSymbols.map((symbol, index) => (
                            <CoinStatus key={index} coinSymbol={symbol} />
                        ))}
                    </Marquee>
                </div>

                <div className="relative flex">
                    {/* 사이드바 */}
                    <div className={`fixed h-full`}>
                        <Sidebar isDarkMode={isDarkMode} />
                    </div>

                    <main className="flex-grow p-6 ml-16 lg:ml-56">
                        {/* 헤더 */}
                        <section
                            className={`flex flex-col items-start justify-center h-48 rounded-md shadow-md mb-6 p-4 ${
                                isDarkMode
                                    ? "bg-gradient-to-r from-gray-800 to-gray-700 text-gray-50"
                                    : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                            }`}
                        >
                            <h1 className="text-3xl font-bold mb-2">금융의 지존을 탐색하세요</h1>
                            <p className="text-sm font-light">
                                실시간 데이터와 통찰력 있는 정보를 제공합니다.
                            </p>
                        </section>

                        {/* 3x2 네비게이션 섹션 */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: "news", title: "최신 뉴스", content: "오늘의 금융 동향과 분석", navigation: "/news" },
                                {
                                    id: "discussion",
                                    title: "추천 토론",
                                    content: "함께 성장할 커뮤니티 멤버 찾기",
                                    navigation: "/discussion",
                                },
                                { id: "schedule", title: "금융 일정", content: "중요한 금융 이벤트와 일정", navigation: "/schedule" },
                                { id: "charts", title: "실시간 차트", content: "시장 데이터를 한눈에", navigation: "/charts" },
                                { id: "portfolio", title: "포트폴리오", content: "자산분석 서비스", navigation: "/portfolio" },
                                {
                                    id: "special",
                                    title: "AI 전문 분석 서비스",
                                    content: "AI 전문 분석가의 보고서를 받아보세요",
                                    onClick: openAiAgent, // AI 분석 서비스 클릭 시 모달 열기
                                    gradient: true,
                                },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    id={item.id}
                                    onClick={item.onClick ? item.onClick : () => navigate(item.navigation)}
                                    className={`p-4 rounded-md shadow-md cursor-pointer transition-transform transform hover:scale-105 ${
                                        isDarkMode ? "bg-gray-800 text-gray-50" : "bg-white text-gray-900"
                                    }`}
                                >
                                    <h2
                                        className={`text-sm font-semibold mb-1 ${
                                            item.gradient
                                                ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-gradient-slide"
                                                : ""
                                        }`}
                                    >
                                        {item.title}
                                    </h2>
                                    <p className="text-xs mb-2">{item.content}</p>
                                </div>
                            ))}
                        </section>

                        {/* 실시간 차트와 게시판 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <section
                                className={`p-4 rounded-md shadow-md ${
                                    isDarkMode ? "bg-gray-800 text-gray-50" : "bg-gray-50 text-gray-900"
                                }`}
                            >
                                <h2 className="text-sm font-semibold mb-2">실시간 시장 차트</h2>
                                <ChartManager isDarkMode={isDarkMode} />
                            </section>

                            <section
                                className={`p-4 rounded-md shadow-md ${
                                    isDarkMode ? "bg-gray-800 text-gray-50" : "bg-gray-50 text-gray-900"
                                }`}
                            >
                                <h2 className="text-sm font-semibold mb-2">추천 게시판</h2>
                                <Boards isDarkMode={isDarkMode} />
                            </section>
                        </div>
                    </main>
                </div>

                {/* AI 에이전트 */}
                <AiAgent isOpen={isAiAgentOpen} closeModal={closeAiAgent} />
            </Suspense>
        </div>
    );
};

export default Main;
