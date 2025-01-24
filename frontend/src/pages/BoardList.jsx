// src/pages/BoardList.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBoards } from "../redux/slices/boardSlice.js";
import { Link } from "react-router-dom";

const BoardList = () => {
  const dispatch = useDispatch();
  const { boards, loading, error } = useSelector((state) => state.board);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  if (loading) {
    return <div className="text-center py-16">게시판을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">게시판을 불러오는 데 실패했습니다.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">게시판 목록</h1>
      <ul className="space-y-4">
        {boards.map((board) => (
          <li key={board.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <Link
              to={`/boards/${board.id}`}
              className="text-xl font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {board.name}
            </Link>
            {board.description && (
              <p className="text-gray-600 dark:text-gray-400">{board.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BoardList;
