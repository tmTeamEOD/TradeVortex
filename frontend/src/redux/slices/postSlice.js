// src/redux/slices/postSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axiosInstance.js";

// 게시물 목록을 가져오는 비동기 Thunk
export const fetchPosts = createAsyncThunk(
  "post/fetchPosts",
  async ({ boardId, search }, { rejectWithValue }) => {
    try {
      let url = `/board/posts/?board_type=${boardId}&limit=10`;
      if (search) {
        url += `&search=${search}`;
      }
      const response = await axios.get(url);
      return response.data.results; // Pagination 사용 시 'results' 키
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 게시물 생성 비동기 Thunk
export const createPost = createAsyncThunk(
  "post/createPost",
  async ({ boardId, title, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/board/posts/", {
        board_type: boardId,
        title,
        content,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 게시물 삭제 비동기 Thunk
export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      await axios.delete(`/board/posts/${postId}/`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 게시물 업데이트 비동기 Thunk
export const updatePost = createAsyncThunk(
  "post/updatePost",
  async ({ postId, title, content }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/board/posts/${postId}/`, {
        title,
        content,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetPostState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = [action.payload, ...state.posts];
        state.success = true;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter(post => post.id !== action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPostState } = postSlice.actions;
export default postSlice.reducer;
