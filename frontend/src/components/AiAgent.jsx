import React, {useState, useEffect, useRef} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {useSelector} from "react-redux";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import Prism from "prismjs";
import "prismjs/themes/prism.css"; // Prism 테마 임포트

// 필요에 따라 추가 언어 로드
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
// ... 기타 필요한 언어

// 로딩 스피너 및 메시지 컴포넌트
const LoadingWithMessages = ({loading}) => {
    const loadingMessages = ["분석 중...", "연구 중...", "결과 정리 중..."];
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (loading) {
            intervalRef.current = setInterval(() => {
                setLoadingMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
            }, 1500); // 1.5초마다 메시지 변경
        } else {
            clearInterval(intervalRef.current);
            setLoadingMessageIndex(0);
        }

        return () => clearInterval(intervalRef.current);
    }, [loading, loadingMessages.length]);

    return (
        <div className="flex flex-col justify-center items-center py-10">
            <motion.div
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"
                animate={{rotate: 360}}
                transition={{repeat: Infinity, duration: 1, ease: "linear"}}
            />
            <p className="text-center text-gray-700 dark:text-gray-300">{loadingMessages[loadingMessageIndex]}</p>
        </div>
    );
};

// 커스텀 마크다운 컴포넌트
const MarkdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-3xl font-bold my-4" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-2xl font-semibold my-3" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-xl font-medium my-2" {...props} />,
    p: ({node, ...props}) => <p className="my-2 text-gray-700 dark:text-gray-300" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-inside my-2" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2" {...props} />,
    li: ({node, ...props}) => <li className="my-1" {...props} />,
    a: ({node, href, children, ...props}) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
            {...props}
        >
            {children}
        </a>
    ),
    code: ({node, inline, className, children, ...props}) => {
        const match = /language-(\w+)/.exec(className || "");
        return !inline && match ? (
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md overflow-auto">
        <code
            className={`language-${match[1]}`}
            dangerouslySetInnerHTML={{
                __html: Prism.highlight(
                    String(children).replace(/\n$/, ""),
                    Prism.languages[match[1]] || Prism.languages.markup,
                    match[1]
                ),
            }}
        />
      </pre>
        ) : (
            <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
            </code>
        );
    },
    blockquote: ({node, ...props}) => (
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4" {...props} />
    ),
    img: ({node, ...props}) => (
        <img className="my-4 max-w-full rounded-md" alt={props.alt} {...props} />
    ),
};

const AiAgent = ({isOpen, closeModal}) => {
    const [userInput, setUserInput] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState("");  // 알림 상태 추가

    const user = useSelector((state) => state.auth.user);
    const modalRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // WebSocket 연결 설정
        if (user && user.id) {
            socketRef.current = new WebSocket(`ws://localhost:8000/ws/notify_${user.id}/`);

            socketRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setNotification(data.message);  // 알림 처리
            };

            socketRef.current.onclose = () => {
                console.log("WebSocket 연결 종료");
            };
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();  // 컴포넌트 언마운트 시 WebSocket 종료
            }
        };
    }, [user]);

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

    // 사용자가 제공한 sendMessage 함수 유지
    const sendMessage = async () => {
        if (userInput.trim() === "") return;

        setLoading(true);
        try {
            const result = await axios.post(
                "http://127.0.0.1:8000/api/aiassist/run/",
                {
                    inputs: {
                        topic: userInput,
                    },
                    userid: user.id,
                    headers: {
                        Authorization: `Bearer ${localStorage.accessToken}`,

                    },
                }
            );
            setResponse(result.data.result.raw);
        } catch (error) {
            setResponse("오류가 발생했습니다. 다시 시도해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    const resetInput = () => {
        setUserInput("");
        setResponse("");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    className="fixed inset-0 flex justify-center items-center z-50"
                    onClick={handleClickOutside}
                    aria-modal="true"
                    role="dialog"
                    aria-labelledby="ai-agent-title"
                >
                    {/* Background overlay */}
                    <motion.div
                        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    ></motion.div>

                    <motion.div
                        ref={modalRef}
                        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl h-full max-h-[85vh] overflow-hidden shadow-xl relative z-10 flex flex-col"
                        initial={{scale: 0.9, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        exit={{scale: 0.9, opacity: 0}}
                        transition={{type: "spring", stiffness: 250, damping: 20}}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 bg-blue-500 text-white rounded-t-xl">
                            <h3 id="ai-agent-title" className="text-xl font-semibold">
                                🪄 AI 분석 서비스
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-white hover:text-gray-200 text-2xl focus:outline-none"
                                aria-label="Close Modal"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 p-6 overflow-y-auto flex flex-col space-y-4">
                            {/* Input Area */}
                            <div className="flex flex-col space-y-2">
                <textarea
                    placeholder="질문을 입력하세요..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
                                <button
                                    onClick={sendMessage}
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${
                                        loading
                                            ? "bg-blue-300 cursor-not-allowed"
                                            : "bg-blue-500 hover:bg-blue-600"
                                    }`}
                                >
                                    {loading ? "처리 중..." : "전송"}
                                </button>
                            </div>

                            {/* Response Area */}
                            <div
                                className="flex-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner flex flex-col">
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                    ✨ AI 응답
                                </h4>
                                {loading ? (
                                    <LoadingWithMessages loading={loading}/>
                                ) : response ? (
                                    <motion.div
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        transition={{duration: 0.5}}
                                        className="prose dark:prose-dark flex-1 overflow-y-auto px-4"
                                    >
                                        <ReactMarkdown
                                            components={MarkdownComponents}
                                            children={response}
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                        />
                                    </motion.div>
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-300">
                                        응답이 여기에 표시됩니다.
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* 알림 메시지 표시 */}
            {notification && (
                <div className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-lg shadow-lg">
                    {notification}
                </div>
            )}
        </AnimatePresence>
    );
};

export default AiAgent;
