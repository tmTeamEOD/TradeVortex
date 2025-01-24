import React, {Suspense, lazy, useEffect, useState} from "react";
import {BrowserRouter as Router, Route, Routes, useLocation} from "react-router-dom";
import {AnimatePresence} from "framer-motion";
import {ParallaxProvider} from "react-scroll-parallax";
import Spinner from "./components/Spinner.jsx";
import Footer from "./components/Footer.jsx";
import Navigation from "./components/Navigation.jsx";
import ChatApp from "./components/ChatApp.jsx"; // ChatApp 모달 추가

import RealTimeChat from "./components/RealTimeChat.jsx"; // ChatApp 모달 추가



import Charts from "./pages/Charts.jsx";
import DetailChart from "./pages/DetailChart.jsx";
import EmailActivate from "./pages/EmailActivate.jsx"; // Charts 페이지 임포트

// Lazy-loaded Components
const Home = lazy(() => import("./pages/Home.jsx"));
const Main = lazy(() => import("./pages/Main.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const BoardList = lazy(() => import("./pages/BoardList.jsx"));
const BoardPosts = lazy(() => import("./pages/BoardPosts.jsx"));
const PostDetail = lazy(() => import("./pages/PostDetail.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const EditProfilePage = lazy(() => import("./pages/EditProfilePage.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const AppContent = () => {
    const location = useLocation();
    const [chatOpen, setChatOpen] = useState(false);

    // 실시간채팅
    const [realTimeChatOpen, setRealTimeChatOpen] = useState(true);
    // 실시간Chat 모달 열기/닫기 핸들러
    const toggleRealTimeChat = () => setRealTimeChatOpen((prev) => !prev);


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
            {!isHomePage && <Navigation key="navigation"/>}

            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home/>}/>
                <Route path="/main" element={<Main/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/boards" element={<BoardList/>}/>
                <Route path="/boards/:boardId" element={<BoardPosts/>}/>
                <Route path="/charts" element={<Charts/>}/> {/* Charts 페이지 경로 추가 */}
                <Route path="/charts/:symbol" element={<DetailChart/>}/>
                <Route path="/activate" element={<EmailActivate />} />
                <Route path="/posts/:postId" element={<PostDetail/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
                <Route path="/edit-profile" element={<EditProfilePage/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>

            {/* 홈 페이지를 제외한 모든 페이지에서 ChatApp 모달 표시 */}
            {!isHomePage && (
                <>
                    <div
                        className={`fixed bottom-20 right-5 z-50 p-4 rounded-md shadow-md w-full max-w-md h-[700px] text-gray-50 ${
                            chatOpen ? "block" : "hidden"
                        }`}
                    >
                        <ChatApp closeModal={toggleChat}/>
                    </div>
                    <button
                        onClick={toggleChat}
                        className="fixed bottom-5 right-5 bg-indigo-600 text-white p-3 rounded-full shadow-md hover:bg-indigo-700"
                    >
                        💬
                    </button>
                </>
            )}

      {/* 홈 페이지를 제외한 모든 페이지에서 ChatApp 모달 표시 */}
    {!isHomePage && (
      <>
        <div
          className={`fixed bottom-20 left-5 z-50 p-4 rounded-lg w-full max-w-md h-[700px] bg-transparent overflow-hidden transition-all transform ${
            realTimeChatOpen ? "block" : "hidden"
          }`}
        >
          <RealTimeChat closeModal={toggleRealTimeChat} />
        </div>
        <button
          onClick={toggleRealTimeChat}
          className="fixed bottom-5 left-5 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none"
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
