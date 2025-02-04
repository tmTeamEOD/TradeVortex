import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud"; // 올바른 경로 확인 필요
import { schemeCategory10 } from "d3-scale-chromatic";
import { scaleLog, scaleOrdinal } from "d3-scale";

const WordCloud = ({ wordCloudData, width = 600, height = 400 }) => {
    const containerRef = useRef(null);

    const colorScale = scaleOrdinal(schemeCategory10);

    const randomGenerator = () => Math.random();

    // 단어 빈도수 최소, 최대값 계산 (빈 배열 방지)
    const minVal = wordCloudData.length ? Math.min(...wordCloudData.map((w) => w.value)) : 10;
    const maxVal = wordCloudData.length ? Math.max(...wordCloudData.map((w) => w.value)) : 100;

    const fontScale = scaleLog()
        .domain([minVal, maxVal])
        .range([10, 20]);

    // 단어 크기 설정
    const fontSizeSetter = (datum) => fontScale(datum.value);

    return (
        <div
            ref={containerRef}
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg p-6 flex flex-col items-center w-full min-w-[300px] max-w-[600px]"
        >
            <h2 className="text-2xl font-bold mb-4">📊 워드 클라우드</h2>
            <div className="w-full flex justify-center items-center">
                <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="xMidYMid meet"
                >
                    {wordCloudData.length > 0 && (
                        <Wordcloud
                            words={wordCloudData}
                            width={width}
                            height={height}
                            fontSizeMapper={fontSizeSetter}
                            rotate={0}
                            padding={2}
                            spiral="archimedean"
                            random={randomGenerator}
                        >
                            {(cloudWords) =>
                                cloudWords.map((word, i) => (
                                    <text
                                        key={word.text}
                                        fontSize={word.size}
                                        textAnchor="middle"
                                        transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
                                        style={{
                                            fill: colorScale(word.text),
                                            fontWeight: "bold",
                                            fontFamily: "Arial",
                                        }}
                                    >
                                        {word.text}
                                    </text>
                                ))
                            }
                        </Wordcloud>
                    )}
                </svg>
            </div>
        </div>
    );
};

export default WordCloud;
