import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";

const Toron = () => {
    const [categories, setCategories] = useState([]);
    const [votes, setVotes] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/toron/categories/")
            .then((response) => {
                if (!Array.isArray(response.data)) {
                    console.error("API 응답이 배열이 아닙니다!", response.data);
                    return;
                }
                setCategories(response.data);
                initializeCharts(response.data);
                fetchVoteSummary();
            })
            .catch((error) => console.error("카테고리 API 호출 오류:", error));
    }, []);

    const fetchVoteSummary = () => {
        axios.get("http://127.0.0.1:8000/api/toron/votes/summary/")
            .then((response) => {
                const voteData = response.data.reduce((acc, item) => {
                    acc[item.category_name] = {
                        up: item.up,
                        down: item.down,
                        messages: item.opinions.map((opinion) => ({
                            text: opinion.text,
                            type: opinion.type,
                        })),
                    };
                    return acc;
                }, {});
                setVotes(voteData);
                updateCharts(voteData);
            })
            .catch((error) => console.error("투표 요약 API 호출 오류:", error));
    };

    const initializeCharts = (categories) => {
        const initialOptions = categories.reduce((acc, category) => {
            acc[category.name] = {
                chart: { type: "pie", width: 180, height: 180, backgroundColor: "transparent" },
                title: { text: `${category.name}`, style: { fontSize: "14px" } },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: "pointer",
                        dataLabels: { enabled: false },
                    },
                },
                series: [
                    {
                        name: "투표 비율",
                        colorByPoint: true,
                        data: [
                            { name: "오른다", y: 50, color: "#10b981" },
                            { name: "내린다", y: 50, color: "#ef4444" },
                        ],
                    },
                ],
            };
            return acc;
        }, {});
        setChartOptions(initialOptions);
    };

    const handleVote = (category, type) => {
        const opinion = prompt("한마디를 입력해주세요!");
        if (!opinion) return;

        axios.post("http://127.0.0.1:8000/api/toron/votes/", {
            category: category.id,
            vote_type: type,
            opinion: opinion
        })
        .then(() => {
            setVotes((prevVotes) => {
                const updatedVotes = { ...prevVotes };
                updatedVotes[category.name] = {
                    ...updatedVotes[category.name],
                    [type]: updatedVotes[category.name][type] + 1,
                    messages: [
                        ...updatedVotes[category.name].messages,
                        { text: opinion, type },
                    ],
                };
                updateCharts(updatedVotes);
                return updatedVotes;
            });
        })
        .catch((error) => console.error("투표 API 호출 오류:", error));
    };

    const updateCharts = (voteData) => {
        setChartOptions((prevOptions) => {
            const updatedOptions = { ...prevOptions };
            Object.keys(voteData).forEach((category) => {
                const newVotes = voteData[category];
                const total = newVotes.up + newVotes.down || 1;
                updatedOptions[category] = {
                    ...prevOptions[category],
                    series: [{
                        ...prevOptions[category]?.series?.[0],
                        data: [
                            { name: "오른다", y: (newVotes.up / total) * 100, color: "#10b981" },
                            { name: "내린다", y: (newVotes.down / total) * 100, color: "#ef4444" },
                        ],
                    }],
                };
            });
            return updatedOptions;
        });
    };

    return (
<div className="p-6 mx-auto bg-white shadow-lg rounded-lg">
    {categories.length === 0 ? (
        <p className="text-center text-gray-500">카테고리를 불러오는 중...</p>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
                <div
                    key={category.name}
                    className="border p-6 rounded-lg shadow bg-gray-50 flex flex-col h-auto min-h-[400px]"
                >
                    <div className="flex items-center justify-between">
                        {chartOptions[category.name] && (
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={{
                                    ...chartOptions[category.name],
                                    chart: { type: "pie", width: 200, height: 200 },
                                    title: { text: `${category.name}`, style: { fontSize: "16px" } },
                                    plotOptions: {
                                        pie: { allowPointSelect: true, cursor: "pointer", dataLabels: { enabled: false } },
                                    },
                                }}
                            />
                        )}
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <button
                                onClick={() => handleVote(category, "up")}
                                className="bg-green-500 text-white px-5 py-3 rounded-lg shadow hover:bg-green-600 text-lg">
                                ▲ {votes[category.name]?.up || 0}
                            </button>
                            <button
                                onClick={() => handleVote(category, "down")}
                                className="bg-red-500 text-white px-5 py-3 rounded-lg shadow hover:bg-red-600 text-lg">
                                ▼ {votes[category.name]?.down || 0}
                            </button>
                        </div>
                    </div>
                    <div className="border-t pt-4 mt-6">
                        <h3 className="font-semibold text-sm">📢 {category.name} 의견</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {votes[category.name]?.messages.length === 0 ? (
                                <p className="text-gray-500 text-sm">아직 의견이 없습니다.</p>
                            ) : (
                                votes[category.name]?.messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-md text-sm border-l-4 ${msg.type === 'up' ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}
                                    >
                                        <span className={`font-semibold ${msg.type === 'up' ? 'text-green-700' : 'text-red-700'}`}>
                                            {msg.type === 'up' ? '▲ 오른다' : '▼ 내린다'}
                                        </span>: {msg.text}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )}
</div>
    );
};

export default Toron;
