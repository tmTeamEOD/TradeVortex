import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance.js";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";

const BoardPosts = () => {
  const { boardId } = useParams(); // Dynamic routing
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newPost, setNewPost] = useState({ title: "", content: "", image: null });
  const [imagePreview, setImagePreview] = useState(null); // For image preview
  const [showPostForm, setShowPostForm] = useState(false); // Toggle for post form
  const [loading, setLoading] = useState(true);
  const [boardName, setBoardName] = useState("");

  // Function to fetch posts from the backend
  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        `/board/posts/?board_type=${boardId}&limit=10&ordering=-created_at`
      );
      setPosts(response.data || []);
      setFilteredPosts(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  // Function to fetch board name
  const fetchBoardName = async () => {
    try {
      const response = await axios.get(`/board/boardtypes/${boardId}/`);
      setBoardName(response.data.name);
    } catch (error) {
      console.error("Error fetching board name:", error);
    }
  };

  // useEffect to load posts and board name
  useEffect(() => {
    fetchPosts();
    fetchBoardName();
  }, [boardId]);

  // Search handler
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter((post) =>
        post.title.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setNewPost((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file)); // Show image preview
    } else {
      setNewPost((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Add a new post
  const addPost = async () => {
    if (!newPost.title || !newPost.content) {
      return alert("Please enter both a title and content.");
    }
    try {
      const formData = new FormData();
      formData.append("title", newPost.title);
      formData.append("content", newPost.content);
      formData.append("board_type", boardId);
      if (newPost.image) formData.append("image", newPost.image);

      await axios.post("/board/posts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Post has been created.");
      fetchPosts(); // Fetch latest posts
      setNewPost({ title: "", content: "", image: null });
      setImagePreview(null); // Reset image preview
      setShowPostForm(false); // Close post form
    } catch (error) {
      console.error("Error creating post:", error);
      if (error.response && error.response.status === 401) {
        alert("You are not authorized. Please log in.");
        navigate("/");
      } else {
        alert("Failed to create post.");
      }
    }
  };

  // Loading state
  if (loading) {
    return <div className="text-center py-16">Loading posts...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="max-w-6xl mx-auto px-6 py-8"
    >
      {/* Back to main button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{boardName} Board</h1>
        <Link
          to="/"
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Back to Main
        </Link>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search posts..."
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      {/* Post Creation Section */}
      {user && (
        <div className="mb-8">
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showPostForm ? "Cancel" : "Create New Post"}
          </button>

          {showPostForm && (
            <div className="mt-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <input
                type="text"
                name="title"
                value={newPost.title}
                onChange={handleInputChange}
                placeholder="Title"
                className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <textarea
                name="content"
                value={newPost.content}
                onChange={handleInputChange}
                placeholder="Content"
                className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                rows="4"
              ></textarea>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                className="mb-4"
              />
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-40 rounded border"
                  />
                </div>
              )}
              <button
                onClick={addPost}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Submit Post
              </button>
            </div>
          )}
        </div>
      )}

      {/* Displaying Posts */}
      <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg shadow">
        <AnimatePresence>
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
                >
                  <h2 className="text-xl font-semibold mb-2 truncate">{post.title}</h2>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="mb-4 max-h-40 rounded-lg"
                    />
                  )}
                  <p className="text-gray-500 dark:text-gray-400 mb-4 truncate">
                    {post.content}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>
                      Author: {post.author.username} | {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">No posts found.</div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BoardPosts;