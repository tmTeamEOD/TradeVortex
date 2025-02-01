import React, {Suspense, lazy, useEffect, useState, useCallback} from "react";
import {BrowserRouter as Router, Route, Routes, useLocation} from "react-router-dom";
import {AnimatePresence, motion} from "framer-motion";
import {ParallaxProvider} from "react-scroll-parallax";
import Spinner from "./components/Spinner.jsx";
import Footer from "./components/Footer.jsx";
import Navigation from "./components/Navigation.jsx";
import ChatApp from "./components/ChatApp.jsx";
import Sidebar from "./components/Sidebar.jsx"; // 사이드바 임포트 추가
import News from "./pages/News.jsx";
import Charts from "./pages/Charts.jsx";
import DetailChart from "./pages/DetailChart.jsx";
import EmailActivate from "./pages/EmailActivate.jsx";
import Toron from "./pages/Toron.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import Schedule from "./pages/Schedule.jsx";

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

    useEffect(() => {
        window.scrollTo({top: 0, behavior: "smooth"});
    }, [location.pathname]);

    const isHomePage = location.pathname === "/"; // /home 경로 확인

    // Chat 모달 열기/닫기 핸들러 (useCallback 적용)
    const toggleChat = useCallback(() => {
        setChatOpen((prev) => !prev);
    }, []);

    return (
        <AnimatePresence mode="sync">
            {/* Navigation is fixed at the top */}
            {!isHomePage && (
                <Navigation className="fixed w-full" key="navigation"/>
            )}

            {/* 사이드바 표시 조건 */}
            {!isHomePage && (
                <div className="fixed h-full z-10 mt-[60px]">
                    <Sidebar/>
                </div>
            )}

            {/* /home 이 아닐 때만 마진을 적용 */}
            <div className={`flex-grow ${isHomePage ? '' : 'mt-[60px]'}`}>
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/main" element={<Main/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/boards" element={<BoardList/>}/>
                    <Route path="/news" element={<News/>}/>
                    <Route path="/discussion" element={<Toron/>}/>
                    <Route path="/portfolio" element={<Portfolio/>}/>
                    <Route path="/schedule" element={<Schedule/>}/>
                    <Route path="/boards/:boardId" element={<BoardPosts/>}/>
                    <Route path="/charts" element={<Charts/>}/>
                    <Route path="/charts/:symbol" element={<DetailChart/>}/>
                    <Route path="/activate" element={<EmailActivate/>}/>
                    <Route path="/posts/:postId" element={<PostDetail/>}/>
                    <Route path="/signup" element={<Signup/>}/>
                    <Route path="/profile" element={<ProfilePage/>}/>
                    <Route path="/edit-profile" element={<EditProfilePage/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
                <Footer className="fixed bottom-0 w-full"/>

            </div>

            {/* Chat 모달 애니메이션 적용 */}
            {!isHomePage && (
                <>
                    <AnimatePresence>
                        {chatOpen && (
                            <motion.div
                                key="chat"
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                transition={{duration: 0.2}}
                            >
                                <ChatApp closeModal={toggleChat}/>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 채팅 버튼 애니메이션 효과 추가 */}
                    <motion.button
                        onClick={toggleChat}
                        className="fixed bottom-5 right-5 bg-indigo-600 text-white p-4 rounded-full shadow-md hover:bg-indigo-700 flex items-center justify-center transition-transform transform hover:scale-110"
                        whileTap={{scale: 0.9}}
                    >
                        💬
                    </motion.button>
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

                </div>

            </ParallaxProvider>

        </Router>

    );
};

export default App;
