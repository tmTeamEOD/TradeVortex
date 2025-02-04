// DetailChart.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import PropTypes from "prop-types";
import './DetailChart.css'; // Tailwind CSS를 위한 추가적인 스타일링

const DetailChart = ({ symbol, isDarkMode }) => {
    const chartRef = useRef(null);

    const [ohlc, setOhlc] = useState([]);
    const [volumeData, setVolumeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [Highcharts, setHighcharts] = useState(null);

    // 지표 토글 상태
    const [showRSI, setShowRSI] = useState(true);
    const [showEMA, setShowEMA] = useState(true);
    const [showMACD, setShowMACD] = useState(true);

    // Highcharts 로드 확인
    useEffect(() => {
        if (window.Highcharts) {
            setHighcharts(window.Highcharts);
        } else {
            console.error("Highcharts가 로드되지 않았습니다.");
        }
    }, []);

    // Highcharts 테마 설정
    useEffect(() => {
        if (!Highcharts) return;

        const applyHighchartsTheme = (isDarkMode) => {
            Highcharts.theme = {
                colors: ['#1E90FF', '#FF4500', '#32CD32', '#FFD700', '#8A2BE2'],
                chart: {
                    backgroundColor: isDarkMode ? '#1e1e2f' : '#ffffff',
                    style: {
                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    },
                    plotBorderColor: isDarkMode ? '#3a3a5a' : '#cccccc',
                },
                title: {
                    style: {
                        color: isDarkMode ? '#ffffff' : '#333333',
                        fontSize: '24px',
                        fontWeight: 'bold',
                    },
                },
                subtitle: {
                    style: {
                        color: isDarkMode ? '#dddddd' : '#666666',
                        fontSize: '14px',
                    },
                },
                xAxis: {
                    labels: {
                        style: {
                            color: isDarkMode ? '#cccccc' : '#666666',
                            fontSize: '12px',
                        },
                    },
                    lineColor: isDarkMode ? '#707073' : '#e6e6e6',
                    tickColor: isDarkMode ? '#707073' : '#e6e6e6',
                    gridLineWidth: 0, // X축 그리드라인 제거
                },
                yAxis: {
                    labels: {
                        style: {
                            color: isDarkMode ? '#cccccc' : '#666666',
                            fontSize: '12px',
                        },
                    },
                    gridLineColor: isDarkMode ? '#707073' : '#e6e6e6',
                },
                tooltip: {
                    backgroundColor: isDarkMode ? 'rgba(30, 30, 47, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    style: {
                        color: isDarkMode ? '#ffffff' : '#333333',
                        fontSize: '14px',
                    },
                },
                legend: {
                    itemStyle: {
                        color: isDarkMode ? '#ffffff' : '#333333',
                        fontWeight: 'bold',
                        fontSize: '14px',
                    },
                    itemHoverStyle: {
                        color: isDarkMode ? '#FFD700' : '#000000',
                    },
                },
                plotOptions: {
                    candlestick: {
                        lineColor: isDarkMode ? '#FF4500' : '#000000',
                        upColor: '#32CD32',
                        upLineColor: '#008000',
                        color: '#FF4500',
                        dataGrouping: {
                            enabled: false, // 데이터 그룹핑 비활성화
                        },
                    },
                    series: {
                        animation: {
                            duration: 1000,
                        },
                    },
                },
                rangeSelector: {
                    selected: 1,
                    buttonTheme: {
                        fill: isDarkMode ? '#3a3a5a' : '#f0f0f0',
                        stroke: isDarkMode ? '#3a3a5a' : '#e6e6e6',
                        style: {
                            color: isDarkMode ? '#ffffff' : '#333333',
                            fontWeight: 'bold',
                        },
                        states: {
                            hover: {
                                fill: isDarkMode ? '#57577a' : '#e6e6e6',
                                style: {
                                    color: isDarkMode ? '#ffffff' : '#000000',
                                },
                            },
                            select: {
                                fill: isDarkMode ? '#57577a' : '#d4d4d4',
                                style: {
                                    color: isDarkMode ? '#ffffff' : '#000000',
                                },
                            },
                        },
                    },
                },
                navigator: {
                    enabled: true,
                    height: 60,
                    margin: 10,
                    series: {
                        color: '#1E90FF',
                        lineColor: '#ffffff',
                    },
                    handles: {
                        backgroundColor: '#ffffff',
                        borderColor: '#666666',
                    },
                },
                scrollbar: {
                    enabled: true,
                    barBackgroundColor: isDarkMode ? '#3a3a5a' : '#e6e6e6',
                    barBorderRadius: 10,
                    barBorderWidth: 0,
                    buttonBackgroundColor: isDarkMode ? '#57577a' : '#d4d4d4',
                    buttonBorderWidth: 0,
                    rifleColor: isDarkMode ? '#ffffff' : '#666666',
                    trackBackgroundColor: isDarkMode ? '#2a2a40' : '#f0f0f0',
                    trackBorderWidth: 1,
                    trackBorderColor: isDarkMode ? '#3a3a5a' : '#e6e6e6',
                },
            };
            Highcharts.setOptions(Highcharts.theme);
        };

        applyHighchartsTheme(isDarkMode);
    }, [Highcharts, isDarkMode]);

    // 차트 데이터 가져오기
    useEffect(() => {
        if (!Highcharts) return;

        const fetchChartData = async () => {
            setLoading(true);
            setError(null);

            try {
                const API_BASE_URL = "http://127.0.0.1:8000"; // API 엔드포인트
                const url = `${API_BASE_URL}/api/fetch/candles/days/${symbol}/`;
                const params = {
                    count: 180, // 1년치 데이터
                };

                const response = await axios.get(url, { params });

                if (response.data && Array.isArray(response.data.data)) {
                    const fetchedData = response.data.data;

                    // 데이터 정렬 (날짜순)
                    fetchedData.sort(
                        (a, b) =>
                            new Date(a.candle_date_time_utc) -
                            new Date(b.candle_date_time_utc)
                    );

                    // OHLC와 거래량 데이터 매핑
                    const ohlcData = [];
                    const volumeSeries = [];
                    fetchedData.forEach((item) => {
                        const time = new Date(item.candle_date_time_utc).getTime();

                        ohlcData.push([
                            time, // 날짜
                            parseFloat(item.opening_price), // 시가
                            parseFloat(item.high_price), // 고가
                            parseFloat(item.low_price), // 저가
                            parseFloat(item.trade_price), // 종가
                        ]);

                        volumeSeries.push([
                            time, // 날짜
                            parseFloat(item.candle_acc_trade_volume), // 거래량
                        ]);
                    });

                    setOhlc(ohlcData);
                    setVolumeData(volumeSeries);
                } else {
                    throw new Error("API 응답 데이터 형식이 올바르지 않습니다.");
                }
            } catch (err) {
                console.error("Error loading chart data:", err);
                setError("데이터를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [symbol, Highcharts]);

    // 차트 옵션 설정
    const chartOptions = useMemo(
        () => ({
            chart: {
                type: "candlestick",
                backgroundColor: isDarkMode ? "#1e1e2f" : "#ffffff",
                borderRadius: 12,
                plotShadow: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                    width: 2,
                    offsetX: 0,
                    offsetY: 2,
                },
                height: 600, // 차트 높이 확대
            },
            title: {
                text: `${symbol} 1년치 캔들 차트`,
                align: 'left',
                x: 40,
            },
            subtitle: {
                text: '데이터 소스: Your API',
                align: 'left',
                x: 40,
                style: {
                    fontSize: '14px',
                    color: isDarkMode ? '#cccccc' : '#666666',
                },
            },
            xAxis: {
                type: 'datetime',
                tickInterval: 30 * 24 * 3600 * 1000, // 매월 간격
                labels: {
                    format: '{value:%b %Y}',
                    rotation: 45,
                    style: {
                        fontSize: '12px',
                    },
                },
            },
            yAxis: [
                {
                    labels: {
                        align: "left",
                        x: 0,
                        y: -5,
                        style: {
                            color: isDarkMode ? "#cccccc" : "#666666",
                            fontSize: '12px',
                        },
                    },
                    height: "55%",
                    resize: {
                        enabled: true,
                    },
                    title: {
                        text: '가격',
                        style: {
                            color: isDarkMode ? "#ffffff" : "#333333",
                            fontSize: '14px',
                        },
                    },
                },
                {
                    labels: {
                        align: "left",
                        x: 0,
                        y: -5,
                        style: {
                            color: isDarkMode ? "#cccccc" : "#666666",
                            fontSize: '12px',
                        },
                    },
                    top: "60%",
                    height: "30%",
                    offset: 0,
                    title: {
                        text: '거래량',
                        style: {
                            color: isDarkMode ? "#ffffff" : "#333333",
                            fontSize: '14px',
                        },
                    },
                },
                // 추가 yAxis 설정 (RSI)
                {
                    labels: {
                        align: "left",
                        x: 0,
                        y: -5,
                        style: {
                            color: isDarkMode ? "#cccccc" : "#666666",
                            fontSize: '12px',
                        },
                    },
                    top: "95%",
                    height: "20%",
                    offset: 0,
                    title: {
                        text: 'RSI',
                        style: {
                            color: isDarkMode ? "#ffffff" : "#333333",
                            fontSize: '14px',
                        },
                    },
                },
                // 추가 yAxis 설정 (MACD)
                {
                    labels: {
                        align: "left",
                        x: 0,
                        y: -5,
                        style: {
                            color: isDarkMode ? "#cccccc" : "#666666",
                            fontSize: '12px',
                        },
                    },
                    top: "120%",
                    height: "20%",
                    offset: 0,
                    title: {
                        text: 'MACD',
                        style: {
                            color: isDarkMode ? "#ffffff" : "#333333",
                            fontSize: '14px',
                        },
                    },
                },
            ],
            tooltip: {
                shared: true,
                useHTML: true,
                borderRadius: 8,
                borderWidth: 1,
                shadow: true,
                style: {
                    padding: '12px',
                    fontSize: '14px',
                },
                backgroundColor: isDarkMode ? 'rgba(30, 30, 47, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                pointFormat: `
                    <span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>
                `,
            },
            rangeSelector: {
                selected: 1,
                buttonTheme: {
                    fill: isDarkMode ? '#3a3a5a' : '#f0f0f0',
                    stroke: isDarkMode ? '#3a3a5a' : '#e6e6e6',
                    style: {
                        color: isDarkMode ? '#ffffff' : '#333333',
                        fontWeight: 'bold',
                    },
                    states: {
                        hover: {
                            fill: isDarkMode ? '#57577a' : '#e6e6e6',
                            style: {
                                color: isDarkMode ? '#ffffff' : '#000000',
                            },
                        },
                        select: {
                            fill: isDarkMode ? '#57577a' : '#d4d4d4',
                            style: {
                                color: isDarkMode ? '#ffffff' : '#000000',
                            },
                        },
                    },
                },
            },
            navigator: {
                enabled: true,
                height: 60,
                margin: 10,
                series: {
                    color: '#1E90FF',
                    lineColor: '#ffffff',
                },
                handles: {
                    backgroundColor: '#ffffff',
                    borderColor: '#666666',
                },
            },
            scrollbar: {
                enabled: true,
                barBackgroundColor: isDarkMode ? '#3a3a5a' : '#e6e6e6',
                barBorderRadius: 10,
                barBorderWidth: 0,
                buttonBackgroundColor: isDarkMode ? '#57577a' : '#d4d4d4',
                buttonBorderWidth: 0,
                rifleColor: isDarkMode ? '#ffffff' : '#666666',
                trackBackgroundColor: isDarkMode ? '#2a2a40' : '#f0f0f0',
                trackBorderWidth: 1,
                trackBorderColor: isDarkMode ? '#3a3a5a' : '#e6e6e6',
            },
            series: [
                {
                    type: "candlestick",
                    id: "stock-candlestick",
                    name: `${symbol} 주가`,
                    data: ohlc,
                    dataGrouping: {
                        groupPixelWidth: 1, // 캔들 사이의 간격 최소화
                    },
                    tooltip: {
                        valueDecimals: 2,
                    },
                },
                {
                    type: "column",
                    id: "stock-volume",
                    name: "거래량",
                    data: volumeData,
                    yAxis: 1,
                    color: isDarkMode ? '#1E90FF' : '#1E90FF',
                    tooltip: {
                        valueDecimals: 2,
                    },
                },
                // Heikin-Ashi 시리즈 추가
                {
                    type: "heikinashi",
                    name: `${symbol} Heikin-Ashi`,
                    data: ohlc,
                    yAxis: 0,
                },
                // RSI 지표 추가 (토글 가능)
                showRSI && {
                    type: "rsi",
                    linkedTo: "stock-candlestick",
                    yAxis: 2,
                    params: {
                        period: 14,
                    },
                    color: '#FFD700',
                },
                // EMA 지표 추가 (토글 가능)
                showEMA && {
                    type: "ema",
                    linkedTo: "stock-candlestick",
                    yAxis: 0,
                    params: {
                        period: 10,
                    },
                    color: '#32CD32',
                },
                // MACD 지표 추가 (토글 가능)
                showMACD && {
                    type: "macd",
                    linkedTo: "stock-candlestick",
                    yAxis: 3,
                    params: {
                        shortPeriod: 12,
                        longPeriod: 26,
                        signalPeriod: 9,
                    },
                },
            ].filter(Boolean), // undefined 제거
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top',
                layout: 'horizontal',
                backgroundColor: isDarkMode ? '#1e1e2f' : '#ffffff',
                borderColor: isDarkMode ? '#3a3a5a' : '#e6e6e6',
                borderWidth: 1,
                shadow: false,
                itemStyle: {
                    fontSize: '14px',
                },
            },
            responsive: {
                rules: [
                    {
                        condition: {
                            maxWidth: 800,
                        },
                        chartOptions: {
                            rangeSelector: {
                                inputEnabled: false,
                            },
                            navigator: {
                                enabled: false,
                            },
                            legend: {
                                layout: 'vertical',
                                align: 'center',
                                verticalAlign: 'bottom',
                            },
                        },
                    },
                ],
            },
        }),
        [ohlc, volumeData, isDarkMode, symbol, showRSI, showEMA, showMACD]
    );

    if (loading) {
        return (
            <div className={`loading ${isDarkMode ? 'dark' : 'light'}`}>
                로딩 중...
            </div>
        );
    }

    if (error) {
        return (
            <div className={`error ${isDarkMode ? 'dark' : 'light'}`}>
                {error}
            </div>
        );
    }

    return (
        <div className={`chart-container ${isDarkMode ? 'dark' : 'light'}`}>
            {/* 지표 토글 컨트롤 */}
            <div className="flex justify-end space-x-4 mb-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={showRSI}
                        onChange={() => setShowRSI(!showRSI)}
                        className="form-checkbox h-5 w-5 text-yellow-500"
                    />
                    <span className="text-sm">RSI</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={showEMA}
                        onChange={() => setShowEMA(!showEMA)}
                        className="form-checkbox h-5 w-5 text-green-500"
                    />
                    <span className="text-sm">EMA</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={showMACD}
                        onChange={() => setShowMACD(!showMACD)}
                        className="form-checkbox h-5 w-5 text-purple-500"
                    />
                    <span className="text-sm">MACD</span>
                </label>
            </div>
            {/* Highcharts 차트 */}
            {Highcharts && (
                <HighchartsReact
                    highcharts={Highcharts}
                    constructorType={"stockChart"}
                    options={chartOptions}
                    ref={chartRef}
                />
            )}
        </div>
    );
};

DetailChart.propTypes = {
    symbol: PropTypes.string.isRequired,
    isDarkMode: PropTypes.bool,
};

DetailChart.defaultProps = {
    isDarkMode: false,
};

export default DetailChart;
