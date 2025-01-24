// src/redux/slices/boardSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axiosInstance.js";

// 게시판 목록을 가져오는 비동기 Thunk
export const fetchBoards = createAsyncThunk(
  "board/fetchBoards",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/board/boardtypes/");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const boardSlice = createSlice({
  name: "board",
  initialState: {
    boards: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default boardSlice.reducer;
