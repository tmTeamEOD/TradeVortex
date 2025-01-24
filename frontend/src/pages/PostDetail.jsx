import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { deletePost } from "../redux/slices/postSlice.js";
import axios from "../api/axiosInstance.js";
import { motion } from "framer-motion";

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPostDetail = async () => {
    try {
      const response = await axios.get(`/board/posts/${postId}/`);
      setPost(response.data);
      setLoading(false);
    } catch (error) {
      console.error("게시물 불러오기 실패:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetail();
  }, [postId]);

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      dispatch(deletePost(postId)).then(() => {
        alert("게시물이 삭제되었습니다.");
        navigate(`/boards/${post.board_type}`);
      });
    }
  };

  const handleLike = async () => {
    try {
      await axios.patch(`/board/posts/${postId}/like/`);
      fetchPostDetail();
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  const handleDislike = async () => {
    try {
      await axios.patch(`/board/posts/${postId}/dislike/`);
      fetchPostDetail();
    } catch (error) {
      console.error("싫어요 처리 실패:", error);
    }
  };

  const handleReport = async () => {
    const reason = prompt("신고 사유를 입력해주세요:");
    if (reason) {
      try {
        await axios.post(`/board/reports/`, { post: postId, reason });
        alert("게시물이 신고되었습니다.");
      } catch (error) {
        console.error("신고 실패:", error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-16">게시물을 불러오는 중...</div>;
  }

  if (!post) {
    return <div className="text-center py-16">게시물을 찾을 수 없습니다.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto px-6 py-8"
    >
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500 dark:text-gray-300">
          {post.author} • {new Date(post.created_at).toLocaleDateString()}
        </span>
        {user && post.author === user.username && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 transition"
          >
            삭제
          </button>
        )}
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-6">{post.content}</p>

      <div className="flex space-x-4 mb-4">
        <button onClick={handleLike} className="text-blue-500">
          👍 {post.like_count}
        </button>
        <button onClick={handleDislike} className="text-red-500">
          👎 {post.dislike_count}
        </button>
        <button onClick={handleReport} className="text-yellow-500">
          🚨 신고
        </button>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        조회수: {post.view_count}
      </div>

      {/* 이미지 섹션 */}
      {post.images.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">이미지</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {post.images.map((image) => (
              <img
                key={image.id}
                src={image.image}
                alt={`Image for ${post.title}`}
                className="w-full h-auto rounded"
              />
            ))}
          </div>
        </div>
      )}

      {/* 댓글 섹션 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">댓글</h2>
        {post.comments.length > 0 ? (
          <ul className="space-y-4">
            {post.comments.map((comment) => (
              <li key={comment.id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{comment.author}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">댓글이 없습니다.</p>
        )}
      </div>

      {/* 댓글 작성 */}
      {user && (
        <div className="mt-8">
          <textarea
            placeholder="댓글을 작성해주세요..."
            className="w-full p-3 border border-gray-300 rounded-md"
          ></textarea>
          <button
            onClick={() => {}}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            댓글 작성
          </button>
        </div>
      )}

      {/* 돌아가기 링크 */}
      <div className="mt-8">
        <Link
          to={`/boards/${post.board_type}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          돌아가기
        </Link>
      </div>
    </motion.div>
  );
};

export default PostDetail;
