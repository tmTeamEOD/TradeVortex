/**
 * TickerBar.jsx (예시)
 *
 * - "얇은 그라디언트 바" + "CoinStatus" 2회 반복 → 무한 슬라이드
 */

import React from "react";
import CoinStatus from "./CoinStatus"; // 위에서 만든 컴포넌트

const coinSymbols = ["BTC", "ETH", "BNB", "ADA", "SOL", "XRP", "DOGE", "DOT", "SHIB"];

function TickerBar() {
  return (
    <div
      className="
        w-full
        h-8
        overflow-hidden
        bg-gradient-to-r
        from-blue-200
        to-pink-200
        relative
      "
    >
      <div
        className="
          absolute
          whitespace-nowrap
          h-full
          flex
          items-center
          animate-marqueeLeft
        "
      >
        {/* 1) 첫 번째 라인 */}
        {coinSymbols.map((sym) => (
          <CoinStatus key={`line1-${sym}`} coinSymbol={sym} />
        ))}
        {/* 2) 두 번째 라인 (이어붙이기) */}
        {coinSymbols.map((sym) => (
          <CoinStatus key={`line2-${sym}`} coinSymbol={sym} />
        ))}
      </div>

      {/* keyframes 정의 */}
      <style jsx>{`
        @keyframes marqueeLeft {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marqueeLeft {
          animation: marqueeLeft 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default TickerBar;
