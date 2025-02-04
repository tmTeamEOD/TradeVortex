import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NewsBoard = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://192.168.0.6:8000/api/news/")
      .then((response) => {
        setNewsList(response.data.results); // ✅ API 응답이 `results` 배열이면 반영
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
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-100 dark:bg-gray-900 transition-colors">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
        📰 최신 뉴스
      </h1>

      {newsList.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">등록된 뉴스가 없습니다.</p>
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
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-transform cursor-pointer"
            >
              <Link to={`/news/${news.id}`}>
                <img
                  src={news.image ? `http://192.168.0.6:8000${news.image}` : "/media/default_news_image.jpg"}
                  alt={news.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {news.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {news.content.length > 100 ? news.content.substring(0, 100) + "..." : news.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
