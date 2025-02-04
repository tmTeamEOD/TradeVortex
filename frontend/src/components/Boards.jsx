import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance.js";
import { useSelector } from "react-redux";

const Boards = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      const response = await axiosInstance.get("board/posts/");
      setPosts(response.data);
      setLoading(false);
    } catch (err) {QQQQQQQQQQQQQQ
      setError("게시글을 불러오는 데 실패했습니다.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const boardSections = [
    { id: 1, title: "코인 게시판", description: "가장 핫한 코인 소식을 확인하세요." },
    { id: 2, title: "주식 게시판", description: "모든 주식을 한눈에 확인하세요." },
    { id: 3, title: "인기 게시글", description: "가장 인기 있는 게시글들을 모았습니다." },
  ];

  const categorizedPosts = {
    1: posts.filter((post) => post.board_type === 1),
    2: posts.filter((post) => post.board_type === 2),
    3: posts.sort((a, b) => b.likes - a.likes).slice(0, 6),
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-800 dark:text-gray-200">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <p className="text-center text-gray-600 dark:text-gray-400 text-base mb-4">
        금융 정보와 이야기를 공유하며, 더 나은 결정을 위한 커뮤니티에 참여하세요.
      </p>

      {boardSections.map((section) => (
        <div
          key={section.id}
          className={`rounded-md p-4 hover:shadow-md transition-shadow duration-200 ${
            isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
          } mb-6`}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">
                <Link to={`/boards/${section.id}`} className="hover:text-blue-500">
                  {section.title}
                </Link>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
            </div>
            <Link
              to={`/boards/${section.id}`}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              더보기 &rarr;
            </Link>
          </div>

          <div className="space-y-2">
            {categorizedPosts[section.id]?.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                게시글이 없습니다.
              </div>
            ) : (
              categorizedPosts[section.id]?.slice(0, 6).map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between border-b pb-2 last:border-none"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white truncate flex-grow">
                    <Link to={`/posts/${post.id}`} className="hover:text-blue-500">
                      {post.title}
                    </Link>
                  </h3>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mx-4 whitespace-nowrap">
                    {post.author}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mx-4 whitespace-nowrap">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mx-2">
                    &#128077; {post.likes}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    &#128172; {post.comments}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(Boards);
