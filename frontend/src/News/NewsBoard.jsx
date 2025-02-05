import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const NewsBoard = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redux store에서 다크모드 상태 가져오기
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  useEffect(() => {
    axios
      .get("http://192.168.0.6:8000/api/news/")
      .then((response) => {
        setNewsList(response.data.results); // API 응답이 `results` 배열이면 반영
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching news list", err);
        setError("뉴스 목록을 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen text-lg font-semibold ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
        }`}
      >
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex justify-center items-center h-screen text-lg font-semibold ${
          isDarkMode ? "bg-gray-900 text-red-400" : "bg-gray-100 text-red-500"
        }`}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen px-4 py-8 transition-colors ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h1
        className={`text-3xl font-bold text-center mb-6 ${
          isDarkMode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        📰 최신 뉴스
      </h1>

      {newsList.length === 0 ? (
        <p
          className={`text-center ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          등록된 뉴스가 없습니다.
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {newsList.map((news) => (
            <motion.div
              key={news.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`shadow-md rounded-lg overflow-hidden transition-transform cursor-pointer ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <Link to={`/news/${news.id}`}>
                <img
                  src={
                    news.image
                      ? `http://192.168.0.6:8000${news.image}`
                      : "/media/default_news_image.jpg"
                  }
                  alt={news.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2
                    className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {news.title}
                  </h2>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {news.content.length > 100
                      ? news.content.substring(0, 100) + "..."
                      : news.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >

                    🕒 {new Date(news.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default NewsBoard;
