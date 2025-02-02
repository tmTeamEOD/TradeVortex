import React, {useState, useRef, useEffect, memo} from "react";
import {useSelector} from "react-redux";
import {AnimatePresence, motion} from "framer-motion";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {v4 as uuidv4} from 'uuid';  // uuid 라이브러리 추가

const ChatApp = memo(({closeModal}) => {
    const {user} = useSelector((state) => state.auth);  // 로그인한 사용자 정보 가져오기
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    // 절망적이고 웃긴 금융 네임스페이스 목록
    const namespaces = [
        '빚갚기작전', '주식폭망', '빚투자', '내월급', '재테크실패', '부자될까?', '재정난',
        '펀드환불', '주식시장이벤트', '세금폭탄', '급여이체실패', '투자한방에', '잔액부족',
        '대출금리', '주식원금손실', '적금해지', '비상금없음', '퇴직연금상실', '적립식실패',
        '빚갚기5년계획', '영끌할때', '손해보는투자', '기대했던수익', '연금조정실패', '종잣돈없음'
    ];

    // 로그인 여부에 따른 clientId 설정 (절망적이고 웃긴 네임스페이스 사용)
    const [clientId, setClientId] = useState(() => {
        if (user) {
            return user.username;  // 로그인된 사용자는 username 사용
        } else {
            const randomNamespace = namespaces[Math.floor(Math.random() * namespaces.length)];
            const randomNumber = Math.floor(Math.random() * 1000);  // 3자리 숫자 추가
            return `@${randomNamespace}-${randomNumber}`;
        }
    });

    const [botMessages, setBotMessages] = useState([  // 챗봇 메시지 상태
        {
            id: uuidv4(),  // id는 uuid로 생성
            sender: "챗봇",
            text: "안녕하세요! 무엇이든 물어보세요 😊",
            time: new Date().toLocaleTimeString(),
        },
    ]);
    const [realtimeMessages, setRealtimeMessages] = useState([]);  // 실시간 채팅 메시지 상태
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false); // 챗봇 응답 대기 상태
    const [chatMode, setChatMode] = useState("bot");  // 챗봇 모드 또는 실시간 채팅 모드
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        // WebSocket 연결 설정: 실시간 채팅 모드일 때 WebSocket 연결
        if (chatMode === "realtime" && !socketRef.current) {
            socketRef.current = new WebSocket("ws://localhost:8000/ws/realtimechat/");
            socketRef.current.onopen = () => {
                setIsConnected(true);
            };

            socketRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                // 로그인된 사용자는 user.username, 아니면 clientId 사용
                const sender = user ? user.username : clientId;

                // 자기 자신이 보낸 메시지는 무시하도록 필터링
                if (data.sender !== sender) {
                    setRealtimeMessages((prev) => [
                        ...prev,
                        {
                            id: uuidv4(),
                            sender: data.sender,
                            text: data.message,
                            time: data.time
                        },
                    ]);
                }
            };

            socketRef.current.onclose = () => {
                setIsConnected(false);
            };

            socketRef.current.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        }
    }, [chatMode, clientId]);  // clientId와 chatMode가 변경될 때마다 WebSocket 설정

    const sendMessage = async () => {
        if (!userInput.trim()) return;

        const newMessage = {
            id: uuidv4(),  // id는 uuid로 생성
            sender: user ? user.username : clientId,  // 로그인된 사용자라면 user.username, 아니면 clientId
            text: userInput,
            time: new Date().toLocaleTimeString(),
        };

        if (chatMode === "bot") {
            setBotMessages((prev) => [...prev, newMessage]);
            setUserInput("");
            setLoading(true);

            try {
                const response = await axios.post("http://127.0.0.1:8000/api/aiassist/bot/", {
                    inputs: {question: userInput},
                });

                const botReplies = Array.isArray(response.data.result.raw)
                    ? response.data.result.raw
                    : [response.data.result.raw];

                setBotMessages((prev) => [
                    ...prev,
                    ...botReplies.map((text) => ({
                        id: uuidv4(),
                        sender: "챗봇",
                        text,
                        time: new Date().toLocaleTimeString(),
                    })),
                ]);
            } catch (error) {
                setBotMessages((prev) => [
                    ...prev,
                    {
                        id: uuidv4(),
                        sender: "Error",
                        text: "오류가 발생했습니다. 다시 시도해주세요.",
                        time: new Date().toLocaleTimeString(),
                    },
                ]);
            } finally {
                setLoading(false);
            }
        } else if (chatMode === "realtime" && isConnected) {
            setRealtimeMessages((prev) => [...prev, newMessage]);
            socketRef.current.send(JSON.stringify(newMessage));  // 실시간 채팅 WebSocket을 통해 메시지 전송
            setUserInput("");  // 실시간 채팅도 보내고 나서 입력값 초기화

        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <motion.div
            className={`fixed bottom-4 right-4 ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            } p-6 rounded-lg shadow-lg w-full max-w-md h-[700px] flex flex-col z-50 border`}
            initial={{opacity: 0, y: 50}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 50}}
            transition={{duration: 0.3}}
        >
            {/* 헤더 */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="text-xl font-semibold">
                    💬 {chatMode === "bot" ? "챗봇" : "실시간 채팅"}
                </h3>
                <button
                    onClick={closeModal}
                    className="text-2xl text-gray-500 hover:text-red-500 transition-all"
                >
                    ✕
                </button>
            </div>

            {/* 챗봇 / 실시간 채팅 전환 */}
            <div className="flex space-x-4 mb-4">
                <button
                    onClick={() => setChatMode("bot")}
                    className={`px-4 py-2 rounded-md ${
                        chatMode === "bot" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                    }`}
                >
                    챗봇
                </button>
                <button
                    onClick={() => setChatMode("realtime")}
                    className={`px-4 py-2 rounded-md ${
                        chatMode === "realtime" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                    }`}
                >
                    실시간 채팅
                </button>
            </div>

            {/* 메시지 영역 */}
            <div
                className="flex-1 overflow-y-auto space-y-3 p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {chatMode === "bot" &&
                    botMessages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{opacity: 0, x: msg.sender === clientId ? 50 : -50}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.3}}
                            className={`flex ${msg.sender === clientId ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`p-3 rounded-lg max-w-xs text-sm shadow-md ${
                                    msg.sender === clientId
                                        ? "bg-blue-500 text-white"
                                        : msg.sender === "Error"
                                            ? "bg-red-500 text-white"
                                            : "bg-gray-200 text-black"
                                }`}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                <div className="text-xs opacity-70 mt-1 text-right">{msg.time}</div>
                            </div>
                        </motion.div>
                    ))}

                {chatMode === "realtime" &&
                    realtimeMessages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{opacity: 0, x: msg.sender === clientId ? 50 : -50}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.3}}
                            className={`flex ${msg.sender === clientId ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`p-3 rounded-lg max-w-xs text-sm shadow-md ${
                                    msg.sender === clientId ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                                }`}
                            >
                                <div className="font-semibold">
                                    {msg.sender}
                                </div>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                <div className="text-xs opacity-70 mt-1 text-right">{msg.time}</div>
                            </div>
                        </motion.div>
                    ))}

                {chatMode === "bot" && loading && (
                    <div className="flex justify-start items-center space-x-2">
                        <motion.div
                            className="p-3 rounded-lg max-w-xs text-sm shadow-md bg-gray-200 text-black"
                            animate={{opacity: [0.4, 1, 0.4]}}
                            transition={{repeat: Infinity, duration: 1}}
                        >
                            ✨ 챗봇이 응답 중...
                        </motion.div>
                    </div>
                )}

                <div ref={messagesEndRef}/>
            </div>

            {/* 입력 영역 */}
            <div className="mt-3 flex items-center space-x-2">
                <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="무엇이든 물어보세요..."
                    className="flex-1 p-3 border rounded-md resize-none shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 scrollbar-thin"
                    rows={1}
                />
                <button
                    onClick={sendMessage}
                    disabled={loading && chatMode === "bot"}
                    className={`px-4 py-2 rounded-md text-white font-semibold ${
                        loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                    } transition-all`}
                >
                    {loading ? "..." : "📩"}
                </button>
            </div>
        </motion.div>
    );
});

export default ChatApp;
