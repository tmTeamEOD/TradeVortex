import React, {useState, useCallback, useReducer} from "react";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "../redux/slices/authSlice.js";
import {toggleDarkMode} from "../redux/slices/themeSlice.js";
import Main from "./LoginModal/Main.jsx";
import {motion, AnimatePresence} from "framer-motion";
import {FaUser, FaSun, FaMoon, FaClock} from "react-icons/fa";
import {Link, useNavigate} from "react-router-dom";
import reactLogo from "../assets/react.svg";
import Switch from "react-switch";
import DigitalClock from "./DigitalClock.jsx";
import TimezoneSelect from "react-timezone-select";

// 초기 상태
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
    const user = useSelector((state) => state.auth.user);

    const [state, localDispatch] = useReducer(reducer, initialState);

    const handleLogout = useCallback(() => {
        dispatch(logout());
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/");
    }, [dispatch, navigate]);

    const handleToggleDarkMode = useCallback(() => {
        dispatch(toggleDarkMode());
    }, [dispatch]);

    const menuItems = [
        {
            label: "대시보드",
            link: "/",
            submenu: [],
        },
        {
            label: "투자 정보",
            link: "/services",
            submenu: [
                {label: "주식 분석", link: "/services/stock"},
                {label: "암호화폐 동향", link: "/services/crypto"},
                {label: "경제 지표", link: "/services/economy"},
            ],
        },
        {
            label: "커뮤니티 소개",
            link: "/about",
            submenu: [
                {label: "운영진 소개", link: "/about/team"},
                {label: "비전 및 목표", link: "/about/mission"},
            ],
        },
        {
            label: "문의하기",
            link: "/contact",
            submenu: [],
        },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 w-full ${
                isDarkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"
            } shadow-md z-50 transition-colors duration-300`}
        >
            <div className="max-w-[1600px] lg:max-w-[2440px] mx-auto px-4 py-2 flex justify-between items-center">
                {/* 로고 */}
                <div className="flex items-center space-x-2">
                    <Link to="/" className="flex items-center">
                        <img src={reactLogo} alt="React Logo" className="w-8 h-8"/>
                        <span className="text-xl font-light ml-2">TradeVortex</span>
                    </Link>
                </div>

                {/* 검색창 */}
                <div className="flex-grow max-w-xl mx-auto">
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
                            className={`flex-grow text-sm bg-transparent focus:outline-none placeholder-gray-400 ${
                                isDarkMode ? "text-gray-200" : "text-gray-800"
                            }`}
                        />
                        <button
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
                    {user ? (
                        <div
                            className="relative"
                            onMouseEnter={() => localDispatch({type: "TOGGLE_DROPDOWN", payload: true})}
                            onMouseLeave={() => localDispatch({type: "TOGGLE_DROPDOWN", payload: false})}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") localDispatch({type: "TOGGLE_DROPDOWN", payload: true});
                                if (e.key === "Escape") localDispatch({type: "TOGGLE_DROPDOWN", payload: false});
                            }}
                        >
                            <div className="flex items-center space-x-2">
                                <img
                                    src="/default-avatar.jpg"
                                    alt={`${user.username || "User"}'s Profile`}
                                    className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                                />
                                <span
                                    className={`font-semibold ${
                                        isDarkMode ? "text-gray-200" : "text-gray-800"
                                    }`}
                                >
                  {user.username}
                </span>
                            </div>
                            <AnimatePresence>
                                {state.isDropdownOpen && (
                                    <motion.div
                                        className={`absolute right-0 w-48 ${
                                            isDarkMode ? "bg-gray-800" : "bg-white"
                                        } shadow-lg rounded-md mt-2 z-50`}
                                        initial={{opacity: 0, y: -10}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -10}}
                                        transition={{duration: 0.3}}
                                    >
                                        <div
                                            className={`py-2 px-4 ${
                                                isDarkMode ? "text-gray-200" : "text-gray-800"
                                            }`}
                                        >
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
                                isDarkMode
                                    ? "border-gray-600 text-gray-200"
                                    : "border-gray-300 text-gray-800"
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
