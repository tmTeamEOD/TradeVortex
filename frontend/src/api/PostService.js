import axios from 'axios';

const API_URL = 'http://192.168.0.6:8000/board/posts/'; // Django API URL

export const getPosts = async () => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return response.data;
};

export const createPost = async (post) => {
  const response = await axios.post(API_URL, post, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return response.data;
};

export const updatePost = async (id, post) => {
  const response = await axios.put(`${API_URL}${id}/`, post, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return response.data;
};

export const deletePost = async (id) => {
  await axios.delete(`${API_URL}${id}/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
};
