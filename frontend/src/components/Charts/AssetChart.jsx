import React, {useState, useEffect, useMemo, useRef, memo} from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import PropTypes from "prop-types";
const django = import.meta.env.VITE_DJANGO_URL;


const AssetChart = ({symbol, isDarkMode}) => {
    const chartRef = useRef(null);

    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const url = `${django}/api/fetch/candles/days/${symbol}/`;
                const params = {
                    count: 365, // 1년치 데이터
                    to: new Date().toISOString(), // 현재 시간을 기준으로 요청
                };

                const response = await axios.get(url, {params});

                // API 응답 디버깅
                console.log("API 응답 데이터:", response.data);

                if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
                    const fetchedData = response.data.data.map((item) => ({
                        x: new Date(item.candle_date_time_utc).getTime(), // 타임스탬프로 변환
                        y: parseFloat(item.trade_price), // 종가(Close) 값
                        open: parseFloat(item.opening_price),
                        high: parseFloat(item.high_price),
                        low: parseFloat(item.low_price),
                        volume: parseFloat(item.candle_acc_trade_volume),
                    }));
                    setData(fetchedData);
                } else {
                    throw new Error("API 응답이 유효하지 않습니다.");
                }
            } catch (err) {
                console.error("API 요청 에러:", err);
                setError(`데이터를 불러오는 데 실패했습니다. (${err.message})`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol]);

    const chartOptions = useMemo(
        () => ({
            chart: {
                type: "area",
                backgroundColor: isDarkMode ? "#1e1e2d" : "#ffffff",
                style: {
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                },
            },
            title: {
                text: `${symbol} 1년치 변동 추이`,
                align: "left",
                style: {
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: isDarkMode ? "#ffffff" : "#333333",
                },
            },
            xAxis: {
                type: "datetime",
                gridLineWidth: 1,
                gridLineColor: isDarkMode ? "#444" : "#ddd",
                labels: {
                    style: {
                        color: isDarkMode ? "#aaa" : "#555",
                        fontSize: "12px",
                    },
                },
                tickPixelInterval: 100,
            },
            yAxis: {
                title: {
                    text: "가격 (KRW)",
                    style: {
                        color: isDarkMode ? "#ffffff" : "#333333",
                        fontSize: "14px",
                    },
                },
                gridLineColor: isDarkMode ? "#444" : "#ddd",
                labels: {
                    style: {
                        color: isDarkMode ? "#aaa" : "#555",
                        fontSize: "12px",
                    },
                },
            },
            tooltip: {
                borderWidth: 0,
                shadow: false,
                backgroundColor: isDarkMode
                    ? "rgba(0, 0, 0, 0.8)"
                    : "rgba(255, 255, 255, 0.8)",
                style: {
                    color: isDarkMode ? "#ffffff" : "#333333",
                },
                shared: true,
                useHTML: true,
                formatter: function () {
                    const currentData = data.find((d) => d.x === this.x);
                    if (!currentData) return "";

                    return `
                        <div style="padding:10px;">
                          <strong>${Highcharts.dateFormat("%Y-%m-%d", this.x)}</strong><br/>
                          Open: ${currentData.open.toLocaleString()} KRW<br/>
                          High: ${currentData.high.toLocaleString()} KRW<br/>
                          Low: ${currentData.low.toLocaleString()} KRW<br/>
                          Close: ${currentData.y.toLocaleString()} KRW<br/>
                          Volume: ${currentData.volume.toLocaleString()}<br/>
                        </div>
                      `;
                },
            },
            series: [
                {
                    name: symbol,
                    data: data.map((point) => [point.x, point.y]),
                    color: isDarkMode ? "#4dabf7" : "#007bff",
                    fillColor: {
                        linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [
                                0,
                                isDarkMode
                                    ? "rgba(77, 171, 247, 0.5)"
                                    : "rgba(0, 123, 255, 0.5)",
                            ],
                            [
                                1,
                                isDarkMode
                                    ? "rgba(77, 171, 247, 0)"
                                    : "rgba(0, 123, 255, 0)",
                            ],
                        ],
                    },
                    marker: {
                        enabled: false,
                    },
                    lineWidth: 2,
                },
            ],
            credits: {
                enabled: false,
            },
        }),
        [isDarkMode, symbol, data]
    );

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div style={{color: "red"}}>{error}</div>;
    }

    return (
        <div style={{width: "100%"}}>
            <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
                ref={chartRef}
            />
        </div>
    );
};

AssetChart.propTypes = {
    symbol: PropTypes.string.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
};

export default memo(AssetChart);
