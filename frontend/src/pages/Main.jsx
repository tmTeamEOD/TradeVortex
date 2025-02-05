import React, {useState, useEffect, lazy, Suspense} from "react";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {Swiper, SwiperSlide} from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import {Autoplay, Pagination, Navigation} from "swiper/modules";
import Marquee from "react-fast-marquee";

// 동적 임포트
const ChartManager = lazy(() => import("../components/Charts/ChartManager.jsx"));
const Boards = lazy(() => import("../components/Boards.jsx"));
const AiAgent = lazy(() => import("../components/AiAgent.jsx"));
const CoinStatus = lazy(() => import("../components/Charts/CoinStatus.jsx"));
const Main = () => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const navigate = useNavigate();
    const [isAiAgentOpen, setIsAiAgentOpen] = useState(false);
    const [boardData, setBoardData] = useState([]);
    const [newsData, setNewsData] = useState([]);  // 뉴스 데이터를 위한 상태 추가
    const django = import.meta.env.VITE_DJANGO_URL;

    // 주요 코인 심볼 목록
    const coinSymbols = ["KRW-BTC", "KRW-ETH", "KRW-XRP", "KRW-BCH"];

    useEffect(() => {
        // 뉴스 데이터를 API에서 가져오는 함수
        const fetchNewsData = async () => {
            try {
                const response = await axios.get(`${django}/api/news/`); // ✅ 백틱 사용
                               setNewsData(response.data.results); // 뉴스 데이터를 받아와 상태 업데이트
            } catch (error) {
                console.error("뉴스 데이터를 가져오는 데 실패했습니다.", error);
            }
        };

        // 게시판 데이터를 가져오는 함수
        const fetchBoardType = async () => {
            try {
                const response = await axios.get(`${django}/api/board/posts/?board_type=1&ordering=-created_at&limit=5`);
                setBoardData(response.data);
            } catch {
                console.error("Unexpected API response format:", response.data);
            }
        };

        fetchNewsData();  // 뉴스 데이터 호출
        fetchBoardType(); // 게시판 데이터 호출
    }, []);

    return (
        <div
            className={`relative min-h-screen transition-colors duration-300 ${
                isDarkMode ? "bg-gray-900 text-gray-50" : "bg-gray-100 text-gray-900"
            }`}
        >
            {/* Marquee (주식 기호 표시) */}
            <Marquee speed={80} gradient={false} className="mb-3 bg-blue-600 p-1 text-xl font-bold text-white">
                {coinSymbols.map((symbol) => (
                    <CoinStatus key={symbol} coinSymbol={symbol}/>
                ))}
            </Marquee>

            <Suspense fallback={<div className="text-center p-4">로딩 중...</div>}>
                {/* 뉴스 슬라이드 영역 */}
                <div className="bg-gray-950 text-white shadow-md mx-4">
                    <Swiper
                        spaceBetween={30}
                        centeredSlides={true}
                        autoplay={{delay: 2500, disableOnInteraction: false}}
                        pagination={{clickable: true}}
                        navigation={true}
                        modules={[Autoplay, Pagination, Navigation]}
                        className="mySwiper h-[25vh]"
                    >
                        {newsData.length > 0 ? (
                            newsData.map((newsItem) => (
                                <SwiperSlide
                                    key={newsItem.id}
                                    className="relative flex items-center justify-center h-[400px] pl-4"
                                    onClick={() => navigate(`/news/${newsItem.id}`)}
                                >
                                    <div className="relative w-full h-full">
                                        <img
                                            src={newsItem.image ? `http://192.168.0.6:8000${newsItem.image}` : "/media/default_news_image.jpg"}
                                            alt={newsItem.title}
                                            className="object-cover w-full h-full"
                                        />
                                        <div
                                            className="absolute inset-0 bg-[linear-gradient(to_right,_#000000_5%,_transparent)]"></div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 z-20 text-left p-4">
                                        <h1 className="text-2xl font-semibold mb-2">{newsItem.title}</h1>
                                        <p className="text-sm font-light">{newsItem.content.substring(0, 100)}...</p>
                                    </div>
                                </SwiperSlide>
                            ))
                        ) : (
                            <div className="text-center py-10">뉴스가 없습니다.</div>
                        )}
                    </Swiper>
                </div>

                <div className="relative flex">
                    <main className="flex-grow p-3">
                        {/* 3x2 네비게이션 섹션 */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {[
                                {title: "최신 뉴스", content: "오늘의 금융 동향과 분석", navigation: "/news"},
                                {title: "추천 토론", content: "함께 성장할 커뮤니티 멤버 찾기", navigation: "/discussion"},
                                {title: "금융 일정", content: "중요한 금융 이벤트와 일정", navigation: "/schedule"},
                                {title: "실시간 차트", content: "시장 데이터를 한눈에", navigation: "/charts"},
                                {title: "AI 예상 주가", content: "국내 외 주식 예측 서비스", navigation: "/finance"},
                                {
                                    title: "AI 전문 분석 서비스",
                                    content: "AI 전문 분석가의 보고서를 받아보세요",
                                    onClick: () => setIsAiAgentOpen(true),
                                    gradient: true,
                                },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
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
                                className={`p-4 rounded-md shadow-md ${isDarkMode ? "bg-gray-800 text-gray-50" : "bg-gray-50 text-gray-900"}`}>
                                <h2 className="text-sm font-semibold mb-2">실시간 시장 차트</h2>
                                <ChartManager isDarkMode={isDarkMode}/>
                            </section>

                            <section
                                className={`p-4 rounded-md shadow-md ${isDarkMode ? "bg-gray-800 text-gray-50" : "bg-gray-50 text-gray-900"}`}>
                                <h2 className="text-sm font-semibold mb-2">추천 게시판</h2>
                                <Boards isDarkMode={isDarkMode}/>
                            </section>
                        </div>
                    </main>
                </div>

                {/* AI 에이전트 모달 */}
                <AiAgent isOpen={isAiAgentOpen} closeModal={() => setIsAiAgentOpen(false)}/>
            </Suspense>
        </div>
    );
};

export default Main;
