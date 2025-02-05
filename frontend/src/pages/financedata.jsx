// AssetPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// django 서버 URL 설정 (예: http://192.168.0.6)
const django = import.meta.env.VITE_DJANGO_URL;

const AssetPage = () => {
  const [symbol, setSymbol] = useState("");
  const [ohlcvData, setOhlcvData] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [symbols, setSymbols] = useState({});
  const [selectedSymbolType, setSelectedSymbolType] = useState("");

  // Redux store에서 다크모드 상태 가져오기
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  // 자산 타입별 심볼 목록을 가져오는 함수
  const fetchSymbols = async () => {
    try {
      const response = await axios.get(`${django}/api/finance/assets/get_symbols/`);
      setSymbols(response.data);
    } catch (err) {
      setError("Error fetching symbols: " + err.message);
    }
  };

  // 오늘부터 1년 전 날짜를 YYYY-MM-DD 형식으로 반환하는 함수
  const getDateRange = () => {
    const today = new Date();
    const endDate = today.toISOString().split("T")[0];

    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    const startDate = lastYear.toISOString().split("T")[0];

    return { startDate, endDate };
  };

  // 과거 OHLCV 데이터를 가져오는 함수
  const fetchOhlcvData = async (symbol) => {
    setLoading(true);
    setError(null);
    const { startDate, endDate } = getDateRange();

    try {
      const response = await axios.get(`${django}/api/finance/ohlcv/history/`, {
        params: {
          symbol,
          start_date: startDate,
          end_date: endDate,
        },
      });
      const dataArray = response.data;
      const processedData = dataArray.map((item) => {
        const time = new Date(item.date).getTime();
        return [time, Number(item.close)];
      });
      // 날짜 오름차순 정렬 (과거 → 현재)
      processedData.sort((a, b) => a[0] - b[0]);
      setOhlcvData(processedData);
    } catch (err) {
      setError("Error fetching OHLCV data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 예측 데이터를 가져오는 함수
  const fetchForecast = async (symbol) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${django}/api/finance/forecast/`, {
        params: { symbol },
      });
      // response.data.forecast는 [예측값, ...] 배열이라고 가정
      setForecast(response.data.forecast);
    } catch (err) {
      setError("Error fetching forecast: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 심볼 선택 시 과거 데이터와 예측 데이터를 동시에 가져옵니다.
  useEffect(() => {
    if (symbol) {
      fetchOhlcvData(symbol);
      fetchForecast(symbol);
    }
  }, [symbol]);

  // 페이지 로드시 심볼 목록 가져오기
  useEffect(() => {
    fetchSymbols();
  }, []);

  // 과거 데이터와 예측 데이터를 하나의 차트에 표시하기 위한 옵션 구성
  const chartOptions = useMemo(() => {
    // forecast 데이터가 존재하고, 과거 데이터가 존재하면 예측 데이터를 위한 타임스탬프를 생성합니다.
    let forecastData = [];
    if (forecast && ohlcvData.length > 0) {
      // 과거 데이터의 마지막 날짜
      const lastTimestamp = ohlcvData[ohlcvData.length - 1][0];
      // 하루의 밀리초 (Highcharts의 xAxis가 datetime이므로)
      const oneDay = 86400000;
      forecastData = forecast.map((value, index) => [
        lastTimestamp + oneDay * (index + 1),
        Number(value)
      ]);
    }

    return {
      chart: {
        type: "area",
        backgroundColor: isDarkMode ? "#2e2e3e" : "#ffffff",
        style: { fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
        shadow: {
          color: isDarkMode ? "#000000" : "#aaaaaa",
          offsetX: 0,
          offsetY: 2,
          opacity: 0.5,
          width: 6
        }
      },
      title: {
        text: symbol ? `${symbol} 역대 가격 및 예측` : "종목을 선택하세요",
        align: "left",
        style: {
          color: isDarkMode ? "#ffffff" : "#333333",
          fontSize: "20px"
        }
      },
      xAxis: {
        type: "datetime",
        labels: {
          style: {
            color: isDarkMode ? "#cccccc" : "#333333"
          }
        },
        gridLineColor: isDarkMode ? "#444444" : "#e6e6e6"
      },
      yAxis: {
        title: {
          text: "가격",
          style: {
            color: isDarkMode ? "#cccccc" : "#333333"
          }
        },
        labels: {
          style: {
            color: isDarkMode ? "#cccccc" : "#333333"
          }
        },
        gridLineColor: isDarkMode ? "#444444" : "#e6e6e6"
      },
      tooltip: {
        shared: true,
        xDateFormat: "%Y-%m-%d",
        backgroundColor: isDarkMode ? "#333333" : "#ffffff",
        style: {
          color: isDarkMode ? "#ffffff" : "#333333"
        }
      },
      series: [
        {
          name: "역대 가격",
          data: ohlcvData,
          color: "#7cb5ec",
          fillOpacity: 0.3,
          marker: {
            enabled: false
          }
        },
        {
          name: "예측 값",
          data: forecastData,
          dashStyle: "ShortDash",
          color: "#434348",
          fillOpacity: 0.1,
          marker: {
            enabled: false
          }
        }
      ],
      credits: {
        enabled: false
      }
    };
  }, [isDarkMode, symbol, ohlcvData, forecast]);

  // 스타일 객체
  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: isDarkMode ? "#1e1e2d" : "#f5f5f5",
    color: isDarkMode ? "#ffffff" : "#333333",
    padding: "1rem",
    transition: "all 0.3s ease"
  };

  const cardStyle = {
    backgroundColor: isDarkMode ? "#2e2e3e" : "#ffffff",
    boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.7)" : "0 2px 8px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    padding: "1rem",
    marginTop: "1rem"
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap"
  };

  const controlGroupStyle = {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    flexWrap: "wrap"
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1>과거 주식 정보 및 향후 2주 AI 기반 주가 예측</h1>
        {/* 다크모드 토글 버튼 제거 */}
      </header>

      <section style={controlGroupStyle}>
        {/* 자산 타입 선택 드롭다운 */}
        <div>
          <label htmlFor="assetType">자산 타입: </label>
          <select
            id="assetType"
            value={selectedSymbolType}
            onChange={(e) => {
              setSelectedSymbolType(e.target.value);
              setSymbol(""); // 새로운 자산 타입 선택 시 기존 심볼 초기화
            }}
            style={{ padding: "0.5rem", borderRadius: "4px" }}
          >
            <option value="">종목</option>
            <option value="stock_kr">국내 주식</option>
            <option value="stock_us">해외 주식</option>
            <option value="crypto">암호화폐</option>
            <option value="forex">환율</option>
          </select>
        </div>

        {/* 선택한 자산 타입에 따른 심볼 드롭다운 */}
        {selectedSymbolType && (
          <div>
            <label htmlFor="symbol">심볼: </label>
            <select
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              style={{ padding: "0.5rem", borderRadius: "4px" }}
            >
              <option value="">심볼을 고르세요</option>
              {symbols[selectedSymbolType]?.map((asset) => (
                <option key={asset.symbol} value={asset.symbol}>
                  {asset.symbol} - {asset.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {loading && <div style={{ marginTop: "1rem" }}>Loading data...</div>}
      {error && <div style={{ marginTop: "1rem", color: "red" }}>{error}</div>}

      {/* 차트 영역 */}
      <div style={cardStyle}>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>

      {/* 예측 데이터 영역 */}
      {forecast && (
        <div style={cardStyle}>
          <h2 style={{ marginBottom: "0.5rem" }}>{symbol} 향후 2주 예측 결과</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {forecast.map((value, index) => (
              <li
                key={index}
                style={{
                  padding: "0.3rem 0",
                  borderBottom: "1px solid " + (isDarkMode ? "#444" : "#eee")
                }}
              >
                <strong>Day {index + 1}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssetPage;
