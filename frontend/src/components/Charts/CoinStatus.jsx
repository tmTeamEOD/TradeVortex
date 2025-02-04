// CoinStatus.jsx

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./CoinStatus.css"; // CSS 파일 경로에 맞게 조정

const CoinStatus = ({ coinSymbol }) => {
  const [coinData, setCoinData] = useState({
    currentPrice: null,
    priceChange: null,
    priceChangePercent: null,
  });

  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  // -----------------------------
  // 1) WebSocket 구독 (Django Backend)
  // -----------------------------
  useEffect(() => {
    // Django 서버의 WebSocket URL을 지정 (포트 8000 가정)
    const socketUrl = `ws://192.168.0.6:8000/ws/upbit/${coinSymbol}/`;
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      console.log(`WebSocket 연결이 열렸습니다: ${socketUrl}`);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCoinData({
        currentPrice: parseFloat(data.trade_price),
        priceChange: parseFloat(data.signed_change_price),
        priceChangePercent: parseFloat(data.signed_change_rate) * 100, // 퍼센트 단위 변환
      });
    };

    socket.onclose = () => {
      console.log("WebSocket 연결이 닫혔습니다.");
      // 재연결 로직 추가 (선택 사항)
      // setTimeout(() => {
      //   setCoinSymbol(coinSymbol); // 리렌더링을 통해 재연결 시도
      // }, 5000);
    };

    socket.onerror = (error) => {
      console.error("WebSocket 에러:", error);
    };

    return () => {
      socket.close();
    };
  }, [coinSymbol]);

  // -----------------------------
  // 2) 표시 텍스트
  // -----------------------------
  const { currentPrice, priceChange, priceChangePercent } = coinData;

  // Loading 시
  if (currentPrice === null) {
    return <span className="mx-4">Loading {coinSymbol.replace("KRW-", "")}...</span>;
  }

  // 가격 변동 색상
  const isUp = priceChange > 0;
  const colorClass = isUp ? "text-green-500" : "text-red-500";

  // -----------------------------
  // 3) 다크/라이트 디자인
  // -----------------------------
  // 바 자체의 배경은 상위(부모) 컴포넌트에서 지정 (얇은 그라디언트 바)
  // 여기서는 텍스트만 다크/라이트 조정
  const textColorClass = isDarkMode ? "text-gray-100" : "text-gray-800";

  return (
    <span
      className={`
        inline-block
        whitespace-nowrap
        mx-4
        font-semibold
        ${textColorClass}
      `}
    >
      {coinSymbol.replace("KRW-", "")}:&nbsp;
      <span className="text-yellow-500">
        ${currentPrice.toFixed(2)}
      </span>
      &nbsp;
      <span className={`${colorClass}`}>
        ({priceChange.toFixed(2)}, {priceChangePercent.toFixed(2)}%)
      </span>
    </span>
  );
};

export default CoinStatus;
