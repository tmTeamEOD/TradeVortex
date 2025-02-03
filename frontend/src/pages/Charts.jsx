import React, { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// const Sidebar = lazy(() => import("../components/Sidebar.jsx"));
const DetailChart = lazy(() => import("./DetailChart.jsx")); // DetailChart 임포트

const Charts = () => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode); // Redux에서 isDarkMode 가져오기
    const navigate = useNavigate();

    const containerClass = `relative min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-gray-50" : "bg-gray-100 text-gray-900"
    }`;

    return (
        <div className={containerClass}>
                            <Suspense fallback={<div className="flex justify-center items-center h-screen">로딩 중...</div>}>
                <div className="relative flex">
                    {/* Sidebar */}
                    {/*<div className="fixed h-full w-16 lg:w-56">*/}
                    {/*    <Sidebar isDarkMode={isDarkMode} />*/}
                    {/*</div>*/}

                    {/* Main content */}
                    <main className="flex-grow ml-16 lg:ml-56">
                        <div className="mt-16 flex">
                            {/* Chart 영역 */}
                            <section className="w-full lg:w-3/4 p-4 rounded-md shadow-md">
                                <DetailChart
                                    symbol="KRW-ETH"
                                    isDarkMode={isDarkMode}
                                />
                            </section>
                            {/* 추가 콘텐츠 공간 */}
                            <section className="hidden lg:block lg:w-1/4 p-4">
                                {/* 여기에 추가 콘텐츠를 배치하세요 */}
                            </section>
                        </div>
                    </main>
                </div>
            </Suspense>
        </div>
    );
};

export default Charts;
