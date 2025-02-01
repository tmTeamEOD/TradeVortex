import React, {useState, lazy, Suspense} from "react";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import {Autoplay, Pagination, Navigation} from 'swiper/modules';
import Marquee from "react-fast-marquee";

// 동적 임포트
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

    const newsItems = [
        {title: "금융 시장 오늘의 동향", description: "금융 시장에서 일어난 최신 사건들을 확인하세요.", link: "/news/market"},
        {title: "주식 시장 분석", description: "주식 시장의 현재 상태와 분석.", link: "/news/stock"},
        {title: "비트코인 상승", description: "비트코인의 가격 상승과 그에 따른 시장 반응.", link: "/news/bitcoin"},
    ];

    return (
        <div
            className={`relative min-h-screen transition-colors duration-300 ${
                isDarkMode ? "bg-gray-900 text-gray-50" : "bg-gray-100 text-gray-900"
            }`}
        >
            {/* Marquee (주식 기호 표시) */}
            <Marquee speed={80} gradient={false}
                     className={`mb-3 bg-blue-600 p-1 text-xl font-bold ${isDarkMode ? "text-gray-50" : "text-gray-900"}`}>
                {coinSymbols.map((symbol, index) => (
                    <CoinStatus key={index} coinSymbol={symbol}/>
                ))}
            </Marquee>

            <Suspense fallback={<div>Loading...</div>}>
                {/* 뉴스 슬라이드 영역 */}
                <div className="ml-56 bg-gray-950 text-white shadow-md mx-4">
                    <Swiper
                        spaceBetween={30}
                        centeredSlides={true}
                        autoplay={{
                            delay: 2500,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                        }}
                        navigation={true}
                        modules={[Autoplay, Pagination, Navigation]}
                        className="mySwiper h-[20vh] "
                    >
                        {newsItems.map((item, index) => (
                            <SwiperSlide key={index} className="relative flex items-center justify-center h-[400px] pl-4" onClick={() => navigate(item.link)}>
                                {/* 이미지 */}
                                <div className="relative w-full h-full">
                                    <img
                                        src={`http://127.0.0.1:8000/media/profile_pictures/default.jpg`} // 이미지 경로
                                        alt={item.title}
                                        className="object-cover w-full h-full"
                                    />
                                    {/* 그라데이션 오버레이 */}
                                    <div
                                        className="absolute inset-0 bg-[linear-gradient(to_right,_#000000_30%,_transparent)]"></div>
                                </div>
                                {/* 텍스트를 독립적으로 섹션 위에 배치 */}
                                <div className="absolute bottom-4 left-4 z-20 text-left p-4">
                                    <h1 className="text-2xl font-semibold mb-2 text-white">{item.title}</h1>
                                    <p className="text-sm font-light text-white">{item.description}</p>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <div className="relative flex">
                    <main className="flex-grow p-3 ml-16 lg:ml-56">
                        {/* 3x2 네비게이션 섹션 */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {[
                                {id: "news", title: "최신 뉴스", content: "오늘의 금융 동향과 분석", navigation: "/news"},
                                {
                                    id: "discussion",
                                    title: "추천 토론",
                                    content: "함께 성장할 커뮤니티 멤버 찾기",
                                    navigation: "/discussion",
                                },
                                {id: "schedule", title: "금융 일정", content: "중요한 금융 이벤트와 일정", navigation: "/schedule"},
                                {id: "charts", title: "실시간 차트", content: "시장 데이터를 한눈에", navigation: "/charts"},
                                {id: "portfolio", title: "포트폴리오", content: "자산분석 서비스", navigation: "/portfolio"},
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <section
                                className={`p-4 rounded-md shadow-md ${
                                    isDarkMode ? "bg-gray-800 text-gray-50" : "bg-gray-50 text-gray-900"
                                }`}
                            >
                                <h2 className="text-sm font-semibold mb-2">실시간 시장 차트</h2>
                                <ChartManager isDarkMode={isDarkMode}/>
                            </section>

                            <section
                                className={`p-4 rounded-md shadow-md ${
                                    isDarkMode ? "bg-gray-800 text-gray-50" : "bg-gray-50 text-gray-900"
                                }`}
                            >
                                <h2 className="text-sm font-semibold mb-2">추천 게시판</h2>
                                <Boards isDarkMode={isDarkMode}/>
                            </section>
                        </div>
                    </main>
                </div>

                {/* AI 에이전트 모달 */}
                <AiAgent isOpen={isAiAgentOpen} closeModal={closeAiAgent}/>
            </Suspense>
        </div>
    );
};

export default Main;
