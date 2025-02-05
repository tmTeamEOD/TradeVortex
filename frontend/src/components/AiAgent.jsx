import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import axios from "../api/axiosInstance.js";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

const LoadingWithMessages = ({ loading }) => {
    const loadingMessages = ["분석 중...", "연구 중...", "결과 정리 중..."];
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (loading) {
            intervalRef.current = setInterval(() => {
                setLoadingMessageIndex(
                    (prevIndex) => (prevIndex + 1) % loadingMessages.length
                );
            }, 1500);
        } else {
            clearInterval(intervalRef.current);
            setLoadingMessageIndex(0);
        }
        return () => clearInterval(intervalRef.current);
    }, [loading]);

    return (
        <div className="flex flex-col justify-center items-center h-full">
            <motion.div
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
                {loadingMessages[loadingMessageIndex]}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                작업 진행 중입니다. 결과가 준비될 때까지 잠시 기다려 주세요. 완료되면 알림을 보내드립니다.
            </p>
        </div>
    );
};

const AiAgent = ({ isOpen, closeModal }) => {
        const dispatch = useDispatch();

    const user = useSelector((state) => state.auth.user);
        const isDarkMode = useSelector((state) => state.theme.isDarkMode);  // 다크모드 상태 가져오기

    const [userInput, setUserInput] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [resultStatus, setResultStatus] = useState("pending");
    const [runId, setRunId] = useState(localStorage.getItem("run_id") || null);
    const [history, setHistory] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);

    const modalRef = useRef(null);
    const socketRef = useRef(null);

    const fetchHistory = async () => {
        try {
            const res = await axios.get("http://192.168.0.6:8000/api/aiassist/history/", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            setHistory(res.data);
        } catch (error) {
            console.error("분석 내역 조회 실패:", error);
        }
    };

    useEffect(() => {
        if (user) {
            const loadHistory = async () => {
                await fetchHistory();
            };
            loadHistory();
        }
    }, [user]);

useEffect(() => {
    if (user && user.id) {
        socketRef.current = new WebSocket(
            `ws://192.168.0.6:8000/ws/notify_${user.id}/`
        );

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            const runIdMatch = data.message.match(/Run ID: (\d+)/);
            if (runIdMatch) {
                const runIdFromMessage = runIdMatch[1];
                // WebSocket으로 받은 runId를 상태와 localStorage에 저장
                setRunId(runIdFromMessage);
                localStorage.setItem("run_id", runIdFromMessage);
            }

            if (data.message.includes("완료")) {
                setResultStatus("completed");
                fetchResult();
                fetchHistory();
            } else if (data.message.includes("진행 중")) {
                setResultStatus("running");
            }
        };

        socketRef.current.onclose = () => {
            console.log("WebSocket 연결 종료");
        };
    }

    return () => {
        if (socketRef.current) {
            socketRef.current.close();
        }
    };
}, [user]);

useEffect(() => {
    // runId가 변경될 때마다 localStorage 업데이트
    if (runId) {
        localStorage.setItem("run_id", runId);
    }
}, [runId]);

    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === "Escape") {
                closeModal();
            }
        };
        window.addEventListener("keydown", handleEscKey);
        return () => {
            window.removeEventListener("keydown", handleEscKey);
        };
    }, [closeModal]);

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            closeModal();
        }
    };

    const handleHistoryClick = (item) => {
        setSelectedHistory(item);
        setResponse(item.result || '결과 없음');
    };

    const sendMessage = async () => {
        if (userInput.trim() === "") return;
        setLoading(true);
        try {
            const result = await axios.post(
                "http://192.168.0.6:8000/api/aiassist/run/",
                { inputs: { topic: userInput } },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        user_id: user.id,
                    },
                }
            );
            if (result.data.run_id) {
                setRunId(result.data.run_id);
                localStorage.setItem("run_id", result.data.run_id);
                setResultStatus("running");
            } else {
                console.error("run_id를 받아오지 못했습니다.");
                setLoading(false);
            }
        } catch (error) {
            console.error("AI 작업 시작 실패:", error);
            setResponse("오류가 발생했습니다. 다시 시도해 주세요.");
            setLoading(false);
        }
    };

    const fetchResult = async () => {
        const currentRunId = runId || localStorage.getItem("run_id");
        if (!currentRunId) {
            console.error("run_id가 없습니다. 결과를 조회할 수 없습니다.");
            setLoading(false);
            return;
        }
        try {
            const res = await axios.get(`/aiassist/result/?run_id=${currentRunId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            if (res.data.result) {
                setResponse(res.data.result);
                localStorage.removeItem("run_id");
                setRunId(null);
            }
        } catch (error) {
            console.error("결과 조회 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 flex justify-center items-center z-40 ${isDarkMode ? "dark" : ""}`} // 다크모드 스타일 적용
                    onClick={handleClickOutside}
                    aria-modal="true"
                    role="dialog"
                    aria-labelledby="ai-agent-title"
                >
                    <motion.div
                        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    ></motion.div>
                    <motion.div
                        ref={modalRef}
                        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-5xl h-full max-h-[80vh] overflow-hidden shadow-xl relative z-50 flex flex-col"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 250, damping: 20 }}
                    >
                        {/* 모달 내용 */}
                        <div className="flex-1 p-6 overflow-y-auto flex flex-col space-y-6 min-h-0">
                            {!user ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <h3 className="text-3xl font-semibold mb-4">로그인 필요</h3>
                                    <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
                                        이 기능은 로그인한 사용자만 이용할 수 있습니다.
                                    </p>
                                    <button
                                        onClick={closeModal}
                                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                                    >
                                        닫기
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row md:space-x-8 h-full min-h-0">
                                    {/* 과거 분석 내역 영역 */}
                                    <div className="md:w-1/3 flex flex-col bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg min-h-0 overflow-hidden">
                                        <h4 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                                            이전 분석 내역
                                        </h4>
                                        <div className="flex-1 overflow-y-auto">
                                            {history.length > 0 ? (
                                                <ul className="divide-y divide-gray-300">
                                                    {history.map((item) => (
                                                        <li
                                                            key={item.id}
                                                            className="py-3 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-700 transition-all duration-200"
                                                            onClick={() => handleHistoryClick(item)}
                                                        >
                                                            <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                                                {item.inputs?.topic || 'Topic 없음'}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {`ID: ${item.id}`}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-600 dark:text-gray-300 text-base">
                                                    분석 요청 내역이 없습니다.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {/* 현재 분석 요청 및 응답 영역 */}
                                    <div className="md:w-2/3 flex flex-col min-h-0 space-y-6">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg">
                                            <textarea
                                                placeholder="질문을 입력하세요..."
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                className="w-full h-28 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-none"
                                            />
                                            <button
                                                onClick={sendMessage}
                                                disabled={loading || resultStatus === "running"}
                                                className={`mt-4 w-full px-6 py-3 rounded-lg text-white font-semibold transition-all ${
                                                    loading || resultStatus === "running"
                                                        ? "bg-blue-300 cursor-not-allowed"
                                                        : "bg-blue-500 hover:bg-blue-600"
                                                }`}
                                            >
                                                {loading || resultStatus === "running"
                                                    ? "처리 중..."
                                                    : "전송"}
                                            </button>
                                        </div>

                                        <div className="flex-1 bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg flex flex-col min-h-0">
                                            <h4 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                                                ✨ AI 응답
                                            </h4>
                                            <div className="flex-1 min-h-0 overflow-y-auto ">
                                                {loading ? (
                                                    <LoadingWithMessages loading={loading} />
                                                ) : response ? (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.5 }}
                                                        className="prose dark:prose-dark flex-1 overflow-y-auto px-4 dark:text-gray-300"
                                                    >
                                                        <ReactMarkdown
                                                            children={response}
                                                            remarkPlugins={[remarkGfm]}
                                                            rehypePlugins={[rehypeRaw]}
                                                        />
                                                    </motion.div>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full ">
                                                        <p className="text-gray-600 dark:text-gray-300 text-center">
                                                            응답이 여기에 표시됩니다.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AiAgent;
