// src/components/Navigation.jsx
import React, {useState, useCallback, useReducer, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "../redux/slices/authSlice.js";
import {toggleDarkMode} from "../redux/slices/themeSlice.js";
import Main from "./LoginModal/Main.jsx";
import {motion, AnimatePresence} from "framer-motion";
import {FaSun, FaMoon, FaClock} from "react-icons/fa";
import {Link, useNavigate} from "react-router-dom";
import reactLogo from "../assets/react.svg";
import Switch from "react-switch";
import DigitalClock from "./DigitalClock.jsx";
import TimezoneSelect from "react-timezone-select";
import axios from "axios";

const API_BASE_URL = "http://192.168.0.6:8000/api";
// 백엔드의 도메인 (media 파일은 이 도메인을 사용)
const BACKEND_DOMAIN = "http:/192.168.0.6:8000";

// 상대 경로 URL을 절대 경로로 변환하는 헬퍼 함수
const getAbsoluteUrl = (url) => {
    if (!url) return "/default-avatar.jpg"; // 기본 아바타 설정

    try {
        const parsedUrl = new URL(url); // URL이 절대 경로인지 확인
        return parsedUrl.href; // 이미 http:// 또는 https://로 시작하면 그대로 반환
    } catch (e) {
        // URL이 상대 경로일 경우, 백엔드 도메인을 붙여서 반환
        return `${BACKEND_DOMAIN}${url.startsWith("/") ? url : `/${url}`}`;
    }
};// 초기 상태
const initialState = {
    isLoginModalOpen: false,
    activeMenu: null,
    showClock: false,
    isDropdownOpen: false,
    selectedTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

// Reducer 함수
const reducer = (state, action) => {
    switch (action.type) {
        case "TOGGLE_LOGIN_MODAL":
            return {...state, isLoginModalOpen: !state.isLoginModalOpen};
        case "SET_ACTIVE_MENU":
            return {...state, activeMenu: action.payload};
        case "TOGGLE_CLOCK":
            return {...state, showClock: !state.showClock};
        case "TOGGLE_DROPDOWN":
            return {...state, isDropdownOpen: action.payload};
        case "SET_TIMEZONE":
            return {...state, selectedTimezone: action.payload};
        default:
            return state;
    }
};

const Navigation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    // Redux의 auth.user (로그인 시점의 기본 정보)
    const userFromRedux = useSelector((state) => state.auth.user);

    // 최신 사용자 프로필 정보를 백엔드(DB)에서 가져오기 위한 로컬 상태
    const [userProfile, setUserProfile] = useState(null);

    const [state, localDispatch] = useReducer(reducer, initialState);

    // 검색어 상태 추가
    const [searchQuery, setSearchQuery] = useState("");

    // 로그인 후 Redux에 저장된 user 정보가 있으면, 이를 기준으로 백엔드에서 최신 사용자 정보를 가져옵니다.
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (token) {
                    const response = await axios.get(`${API_BASE_URL}/accounts/user-profile/`, {
                        headers: {Authorization: `Bearer ${token}`},
                        withCredentials: true,
                    });
                    setUserProfile(response.data);
                } else {
                    setUserProfile(null);
                }
            } catch (error) {
                console.error("사용자 프로필 정보를 가져오는데 실패했습니다.", error);
            }
        };
        // 호출: 컴포넌트 마운트 시 또는 Redux의 user 정보가 변경될 때
        fetchUserProfile();
    }, [userFromRedux]);

    const handleLogout = useCallback(() => {
        dispatch(logout());
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/");
    }, [dispatch, navigate]);

    const handleToggleDarkMode = useCallback(() => {
        dispatch(toggleDarkMode());
    }, [dispatch]);

    // 검색 버튼 클릭 핸들러: 구글 검색 결과를 새 탭에서 엽니다.
    const handleSearch = () => {
        if (searchQuery.trim() !== "") {
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
            window.open(googleSearchUrl, "_blank");
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 w-full ${
                isDarkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"
            } shadow-md z-50 transition-colors duration-300 h-[60px]`} // 고정 높이 설정
        >
            <div
                className="max-w-[1600px] lg:max-w-[2440px] mx-auto px-4 py-2 flex justify-between items-center h-full">
                {/* 로고 */}
                <div className="relative flex items-center justify-center space-x-2">
                    <Link to="/" className="flex items-center">
                        <span className="absolute text-2xl text-black">TradeVortex</span>
                        <img src="icons/TV.svg" alt="React Logo" className="w-8 h-8 ml-[110px] mb-[10px]"/>
                    </Link>
                </div>

                {/* 검색창 */}
                <div className="flex-grow max-w-xl mx-auto hidden sm:block">
                    <div
                        className={`relative flex items-center px-4 rounded-full shadow-md ${
                            isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"
                        }`}
                        style={{
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            border: isDarkMode
                                ? "1px solid rgba(255, 255, 255, 0.2)"
                                : "1px solid rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`flex-grow text-sm bg-transparent focus:outline-none placeholder-gray-400 ${
                                isDarkMode ? "text-gray-200" : "text-gray-800"
                            }`}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                        />
                        <button
                            onClick={handleSearch}
                            className={`ml-3 px-4 py-2 text-sm font-medium rounded-full transition-transform ${
                                isDarkMode ? "bg-blue-600 text-gray-200" : "bg-indigo-500 text-white"
                            } hover:scale-105`}
                        >
                            검색
                        </button>
                    </div>
                </div>

                {/* 유틸리티 */}
                <div className="flex items-center space-x-4">
                    {/* 다크 모드 토글 */}
                    <div className="flex items-center space-x-2">
                        {isDarkMode ? <FaMoon className="w-5 h-5"/> : <FaSun className="w-5 h-5"/>}
                        <Switch
                            checked={isDarkMode}
                            onChange={handleToggleDarkMode}
                            offColor="#bbb"
                            onColor="#4A90E2"
                            uncheckedIcon={false}
                            checkedIcon={false}
                            height={20}
                            width={40}
                            aria-label="Toggle dark mode"
                            className="cursor-pointer"
                        />
                    </div>

                    {/* 현재 시간 */}
                    <div className="relative">
                        <button
                            onClick={() => localDispatch({type: "TOGGLE_CLOCK"})}
                            className="flex items-center space-x-2"
                        >
                            <FaClock className="w-5 h-5"/>
                            <span>현재 시간</span>
                        </button>
                        {state.showClock && (
                            <div
                                className={`absolute top-12 right-0 mt-2 w-64 rounded-md shadow-lg overflow-y-auto max-h-60 ${
                                    isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
                                }`}
                            >
                                <DigitalClock timezone={state.selectedTimezone}/>
                                <TimezoneSelect
                                    value={state.selectedTimezone}
                                    onChange={(timezone) =>
                                        localDispatch({type: "SET_TIMEZONE", payload: timezone.value})
                                    }
                                />
                            </div>
                        )}
                    </div>

                    {/* 사용자 프로필 */}
                    {userProfile ? (
                        <div
                            className="relative"
                            onMouseEnter={() => localDispatch({type: "TOGGLE_DROPDOWN", payload: true})}
                            onMouseLeave={() => localDispatch({type: "TOGGLE_DROPDOWN", payload: false})}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter")
                                    localDispatch({type: "TOGGLE_DROPDOWN", payload: true});
                                if (e.key === "Escape")
                                    localDispatch({type: "TOGGLE_DROPDOWN", payload: false});
                            }}
                        >
                            <div className="flex items-center space-x-2">
                             <img
  src={`http://192.168.0.6:8000${userProfile?.profile_picture_url || "/media/default-avatar.jpg"}`}
  alt={`${userProfile?.username || "User"}'s Profile`}
  className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
/>
<span className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                  {userProfile.username}
                </span>
                            </div>
                            <AnimatePresence>
                                {state.isDropdownOpen && (
                                    <motion.div
                                        className={`absolute right-0 w-48 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg rounded-md mt-2 z-50`}
                                        initial={{opacity: 0, y: -10}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -10}}
                                        transition={{duration: 0.3}}
                                    >
                                        <div className={`py-2 px-4 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                                            <Link
                                                to="/profile"
                                                className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700`}
                                            >
                                                내 정보
                                            </Link>
                                            <Link
                                                to="/edit-profile"
                                                className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700`}
                                            >
                                                정보 수정
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700`}
                                            >
                                                로그아웃
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button
                            onClick={() => localDispatch({type: "TOGGLE_LOGIN_MODAL"})}
                            className={`font-light px-4 py-2 rounded-md border ${
                                isDarkMode ? "border-gray-600 text-gray-200" : "border-gray-300 text-gray-800"
                            } hover:bg-gray-100`}
                        >
                            로그인
                        </button>
                    )}
                </div>
            </div>

            {/* 로그인 모달 */}
            <Main
                isOpen={state.isLoginModalOpen}
                onClose={() => localDispatch({type: "TOGGLE_LOGIN_MODAL"})}
            />
        </nav>
    );
};

export default React.memo(Navigation);
