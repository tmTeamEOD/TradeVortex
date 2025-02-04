import React, {useState, useEffect, useRef} from "react";

const RealTimeChat = ({closeModal}) => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);  // WebSocket 연결을 유지하는 ref

    useEffect(() => {
        // WebSocket 연결을 한 번만 초기화
        if (!socketRef.current) {
            console.log("실시간챗 WebSocket 연결 시도");
            const wsUrl = `ws://${window.location.hostname}:8000/ws/realtimechat/`;
            socketRef.current = new WebSocket(wsUrl);
            console.log(socketRef);

            socketRef.current.onopen = () => {
                console.log("실시간챗 WebSocket 연결 성공");
                setIsConnected(true);
            };

            socketRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);

                // 이미 받은 메시지인지 확인 (중복 방지)
                setMessages((prev) => {
                    if (prev.some((msg) => msg.id === data.id)) return prev;
                    return [...prev, {id: data.id, sender: data.sender, text: data.text, time: data.time}];
                });

            };

            socketRef.current.onclose = (event) => {
                // WebSocket 연결 종료 시
                console.log("실시간챗 WebSocket 연결 종료", event);
                setIsConnected(false);

                // 종료 코드가 1001이면, 의도적으로 종료된 것 (예: 클라이언트 종료 시)
                if (event.code !== 1000) {
                    console.error(`WebSocket 비정상 종료, 코드: ${event.code}`);
                }
            };

            socketRef.current.onerror = (error) => {
                console.error("실시간챗 WebSocket 오류:", error);
            };
        }

        // 컴포넌트 언마운트 시 WebSocket 종료를 하지 않음 (연결을 유지)
        return () => {
            // 빈 함수를 리턴하여 연결을 종료하지 않음
            // socketRef.current.close();는 호출하지 않음
        };
    }, []);  // 빈 배열을 의존성으로 설정하여 컴포넌트가 처음 마운트될 때만 WebSocket 연결

    const sendMessage = () => {
        if (userInput.trim() && socketRef.current && isConnected) {
            const message = {
                id: Date.now(),
                sender: "You",
                text: userInput,
                time: new Date().toLocaleTimeString(),
            };
            socketRef.current.send(JSON.stringify(message));  // 기존 WebSocket을 통해 메시지 전송
            setMessages((prev) => [...prev, message]);
            setUserInput("");
            console.log("message", message.text);

        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white bg-opacity-80 p-4 rounded-lg shadow-lg backdrop-blur-lg">
            {/* 채팅 메시지 영역 */}
            <div className="flex-1 overflow-y-auto mb-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`mb-4 p-3 rounded-lg ${msg.sender === "You" ? "bg-blue-100 self-end text-right" : "bg-gray-200 self-start text-left"}`}
                    >
                        <div className="font-semibold">{msg.sender}</div>
                        <div>{msg.text}</div>
                        <div className="text-sm text-gray-500">{msg.time}</div>
                    </div>
                ))}
            </div>

            {/* 입력 영역 */}
            <div className="flex items-center space-x-2">
        <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="w-full p-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
                <button
                    onClick={sendMessage}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                    disabled={!isConnected || !userInput.trim()}
                >
                    보내기
                </button>
            </div>
            <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
                ❌
            </button>
        </div>
    );
};

export default RealTimeChat;
