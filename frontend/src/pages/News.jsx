import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewsList from './NewsList';
import WordCloud from './WordCloud';
import { Loader2 } from 'lucide-react';
import ParentSize from '@visx/responsive/lib/components/ParentSize';

const BACKEND_URL = 'http://127.0.0.1:8000';

const News = () => {
  const [newsList, setNewsList] = useState([]);
  const [wordCloudData, setWordCloudData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, wcRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/news/`),
          axios.get(`${BACKEND_URL}/api/news/wordcloud/`),
        ]);

        const newsArray = Array.isArray(newsRes.data) ? newsRes.data : newsRes.data.results;
        const updatedNews = newsArray.map((news) => ({
          ...news,
          image: news.image?.startsWith('http') ? news.image : `${BACKEND_URL}${news.image}`,
        }));

        let wcArray = (wcRes.data.word_frequencies || [])
          .filter(([text, value]) => text && value > 0)
          .map(([text, value]) => ({
            text,
            value: Number(value) * 300,
            font: 'Arial',
          }));

        if (wcArray.length === 0) {
          wcArray = [{ text: '데이터 없음', value: 10 }];
        }

        setNewsList(updatedNews);
        setWordCloudData(wcArray);
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 text-red-500">
        <p className="text-2xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 text-gray-900">
      {/* 뉴스 및 키워드 영역 */}
      <div className="mx-auto px-6 py-12 flex flex-col items-center justify-between h-full">
        <h1 className="text-4xl font-bold text-center mb-12 text-blue-700">📰 최신 뉴스 & 키워드 클라우드</h1>

        <div className="w-full flex flex-col lg:flex-row justify-between gap-8 h-full">
          {/* 뉴스 리스트 */}
          <div className="lg:w-1/2 h-full p-6 rounded-lg shadow-lg bg-gray-100 flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">오늘의 주요 뉴스</h2>
            <div className="overflow-y-auto flex-1">
              <NewsList newsList={newsList} />
            </div>
          </div>

          {/* 키워드 워드 클라우드 */}
            <div className="flex-1 max-h-[50vh]">
              <ParentSize>
                {({ width, height }) => (
                  <WordCloud width={width} height={height} wordCloudData={wordCloudData} />
                )}
              </ParentSize>
            </div>
          </div>


      </div>
    </div>
  );
};

export default News;
