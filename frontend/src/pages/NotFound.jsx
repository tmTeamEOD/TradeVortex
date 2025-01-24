import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <motion.div
      className="flex flex-col justify-center items-center min-h-screen text-center bg-gray-50 dark:bg-gray-900"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <h1 className="text-6xl font-extrabold mb-4 text-gray-900 dark:text-white">
        404
      </h1>
      <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
        페이지를 찾을 수 없습니다
      </h2>
      <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
        요청하신 페이지가 존재하지 않거나, 삭제되었을 수 있습니다.
      </p>
      <Link
        to="/main"
        className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium text-lg hover:bg-blue-600 transition"
      >
        홈으로 이동
      </Link>
    </motion.div>
  );
};

export default NotFound;
