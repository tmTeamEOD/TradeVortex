import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance.js";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";

const BoardPosts = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newPost, setNewPost] = useState({ title: "", content: "", images: [] });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportingPost, setReportingPost] = useState(null);
  const [reportReason, setReportReason] = useState("");


  useEffect(() => {
    fetchPosts();
  }, [boardId]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`/board/posts/?board_type=${boardId}&ordering=-created_at`);
      setPosts(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      const uploadedFiles = Array.from(files);
      setNewPost((prev) => ({ ...prev, images: [...prev.images, ...uploadedFiles] }));
      setImagePreviews((prev) => [...prev, ...uploadedFiles.map((file) => URL.createObjectURL(file))]);
    } else {
      setNewPost((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addPost = async () => {
    if (!newPost.title || !newPost.content) return alert("제목과 내용을 입력해주세요.");
    try {
      const formData = new FormData();
      formData.append("title", newPost.title);
      formData.append("content", newPost.content);
      formData.append("board_type", boardId);
      newPost.images.forEach((image) => formData.append("images", image));

      await axios.post("/board/posts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("게시물이 생성되었습니다.");
      fetchPosts();
      setNewPost({ title: "", content: "", images: [] });
      setImagePreviews([]);
      setShowPostForm(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("게시물 작성에 실패했습니다.");
    }
  };

  return (
    <motion.div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold">게시판</h1>
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="검색..."
          className="w-full p-2 border rounded"
        />
      </div>

      {user && (
        <button onClick={() => setShowPostForm(!showPostForm)} className="bg-blue-600 text-white px-4 py-2 rounded">
          {showPostForm ? "취소" : "글쓰기"}
        </button>
      )}

      {showPostForm && (
        <div className="mt-4 p-4 border rounded">
          <input type="text" name="title" value={newPost.title} onChange={handleInputChange} placeholder="제목" className="w-full mb-2 p-2 border rounded" />
          <textarea name="content" value={newPost.content} onChange={handleInputChange} placeholder="내용" className="w-full mb-2 p-2 border rounded" rows="4"></textarea>
          <input type="file" name="images" multiple accept="image/*" onChange={handleInputChange} className="mb-2" />
          {imagePreviews.map((src, idx) => <img key={idx} src={src} alt="Preview" className="max-h-40 rounded border mb-2" />)}
          <button onClick={addPost} className="bg-green-600 text-white px-4 py-2 rounded">등록</button>
        </div>
      )}

      <div className="mt-4">
        {posts.map((post) => (
          <div key={post.id} className="p-4 border rounded mb-4">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            {post.images && post.images.map((img, idx) => <img key={idx} src={img.image} alt="Post" className="max-h-40 rounded mb-2" />)}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BoardPosts;