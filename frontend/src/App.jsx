import React, {Suspense, lazy, useEffect, useState} from "react";
import {BrowserRouter as Router, Route, Routes, useLocation} from "react-router-dom";
import {AnimatePresence} from "framer-motion";
import {ParallaxProvider} from "react-scroll-parallax";
import Spinner from "./components/Spinner";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";
import ChatApp from "./components/ChatApp"; // ChatApp 모달 추가
import Charts from "./pages/Charts";
import DetailChart from "./pages/DetailChart.jsx"; // Charts 페이지 임포트

// Lazy-loaded Components
const Home = lazy(() => import("./pages/Home"));
const Main = lazy(() => import("./pages/Main"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const BoardList = lazy(() => import("./pages/BoardList"));
const BoardPosts = lazy(() => import("./pages/BoardPosts"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AppContent = () => {
    const location = useLocation();
    const [chatOpen, setChatOpen] = useState(false);

    // 새로고침 또는 페이지 전환 시 스크롤을 맨 위로
    useEffect(() => {
        window.scrollTo({top: 0, behavior: "smooth"});
    }, [location.pathname]);

    const isHomePage = location.pathname === "/";

    // Chat 모달 열기/닫기 핸들러
    const toggleChat = () => setChatOpen((prev) => !prev);

    return (
        <AnimatePresence
            mode="sync"
            initial={true}
            onExitComplete={() => {
                // 페이지 전환 시 스크롤 위치 초기화
                window.scrollTo({top: 0, behavior: "smooth"});
            }}
        >
            {/* 홈을 제외한 모든 페이지에 네비게이션 표시 */}
            {!isHomePage && <Navigation key="navigation" />}

            <Routes location={location} key={`${location.pathname}-${Date.now()}`}>
                <Route path="/" element={<Home/>}/>
                <Route path="/main" element={<Main/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/boards" element={<BoardList/>}/>
                <Route path="/boards/:boardId" element={<BoardPosts/>}/>
                <Route path="/charts" element={<Charts/>}/> {/* Charts 페이지 경로 추가 */}
                <Route path="/charts/:symbol" element={<DetailChart/>}/>

                <Route path="/posts/:postId" element={<PostDetail/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
                <Route path="/edit-profile" element={<EditProfilePage/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>

            {/* 홈 페이지를 제외한 모든 페이지에서 ChatApp 모달 표시 */}
            {!isHomePage && (
                <>
                    {chatOpen && (
                        <div
                            key="chat-app"
                            className={`fixed bottom-20 right-5 z-50 p-4 rounded-md shadow-md w-full max-w-md h-[500px] text-gray-50`}
                        >
                            <ChatApp closeModal={toggleChat}/>
                        </div>
                    )}
                    <button
                        onClick={toggleChat}
                        className="fixed bottom-5 right-5 bg-indigo-600 text-white p-3 rounded-full shadow-md hover:bg-indigo-700"
                    >
                        💬
                    </button>
                </>
            )}
        </AnimatePresence>
    );
};

const App = () => {
    return (
        <Router>
            <ParallaxProvider>
                <div className="flex flex-col min-h-screen">
                    <Suspense fallback={<Spinner/>}>
                        <AppContent/>
                    </Suspense>
                    <Footer/>
                </div>
            </ParallaxProvider>
        </Router>
    );
};

export default App;
