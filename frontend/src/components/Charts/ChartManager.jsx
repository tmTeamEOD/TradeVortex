import React, { useState, useCallback, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import AssetChart from "./AssetChart.jsx";

const availableSymbols = [
  "KRW-BTC",
  "KRW-ETH",
  "KRW-XRP",
  "KRW-DOGE",
  "KRW-SOL",
  "KRW-DOT",
  "KRW-ADA",
  "KRW-BCH",
  "KRW-XLM",
];

const ChartManager = ({ isDarkMode }) => {
  const [charts, setCharts] = useState([
    { id: uuidv4(), type: "CRYPTO", symbol: "KRW-BTC" },
  ]);

  const addChart = useCallback(() => {
    setCharts((prevCharts) => {
      if (prevCharts.length >= 4) {
        alert("최대 4개의 차트만 추가할 수 있습니다.");
        return prevCharts;
      }
      const usedSymbols = prevCharts.map((c) => c.symbol);
      const availableToAdd = availableSymbols.filter(
        (sym) => !usedSymbols.includes(sym)
      );
      if (availableToAdd.length === 0) {
        alert("더 이상 추가할 수 있는 심볼이 없습니다.");
        return prevCharts;
      }
      const newSymbol = availableToAdd[0];
      return [
        ...prevCharts,
        { id: uuidv4(), type: "CRYPTO", symbol: newSymbol },
      ];
    });
  }, []);

  const removeChart = useCallback((id) => {
    setCharts((prevCharts) => {
      if (prevCharts.length <= 1) {
        alert("최소 1개의 차트를 유지해야 합니다.");
        return prevCharts;
      }
      return prevCharts.filter((chart) => chart.id !== id);
    });
  }, []);

  useEffect(() => {
    const savedCharts = localStorage.getItem("charts");
    if (savedCharts) {
      setCharts(JSON.parse(savedCharts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("charts", JSON.stringify(charts));
  }, [charts]);

  // 그리드 설정
  const getGridCols = () => {
    switch (charts.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2 grid-rows-[auto_auto_1fr]"; // 마지막 하나가 아래를 꽉 채움
      case 4:
        return "grid-cols-2 grid-rows-2";
      default:
        return "grid-cols-1";
    }
  };

  return (
    <div
      className={`flex h-full p-2 overflow-hidden ${
        isDarkMode ? " text-gray-100" : " text-gray-900"
      }`}
    >
      <div className="flex-1 max-h-full overflow-auto">
        {/* 컨트롤 패널 */}
        <section className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 md:space-x-2 mb-2">
          <div className="flex space-x-2">
            <button
              onClick={addChart}
              disabled={charts.length >= 4}
              className={`flex items-center px-3 py-1 text-sm font-medium rounded transition-colors duration-200 ${
                charts.length >= 4
                  ? `${
                      isDarkMode
                        ? " text-gray-400 cursor-not-allowed"
                        : " text-gray-500 cursor-not-allowed"
                    }`
                  : `bg-green-500 hover:bg-green-600 text-white`
              }`}
              title="차트 추가"
              aria-label="차트 추가"
            >
              <FaPlus className="mr-1" /> 추가
            </button>

            <button
              onClick={() => {
                if (charts.length <= 1) {
                  alert("최소 1개의 차트를 유지해야 합니다.");
                  return;
                }
                const lastChart = charts[charts.length - 1];
                removeChart(lastChart.id);
              }}
              disabled={charts.length <= 1}
              className={`flex items-center px-3 py-1 text-sm font-medium rounded transition-colors duration-200 ${
                charts.length <= 1
                  ? `${
                      isDarkMode
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`
                  : `bg-red-500 hover:bg-red-600 text-white`
              }`}
              title="차트 제거"
              aria-label="차트 제거"
            >
              <FaMinus className="mr-1" /> 삭제
            </button>
          </div>
        </section>

        {/* 차트 그리드 */}
        <div className={`grid ${getGridCols()} gap-2 max-h-full`}>
          {charts.map((chart, index) => (
              <div
                  key={chart.id}
                  className={`${
                      charts.length === 3 && index === 2 ? "col-span-2 row-span-1" : ""
                  } w-full h-full border border-gray-200 dark:border-gray-700 rounded p-1 overflow-hidden`} // overflow-hidden 추가
              >
                <AssetChart
                    category={chart.type}
                    symbol={chart.symbol}
                    isDarkMode={isDarkMode}
                />
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChartManager);
