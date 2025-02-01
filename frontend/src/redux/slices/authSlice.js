// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axiosInstance.js"; // axiosInstance 설정 필요

// 초기 상태
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  loading: false,
  error: null,
};

// 공통 저장 함수: 로그인 성공 시 로컬 스토리지에 저장합니다.
const saveAuthData = ({ user, accessToken, refreshToken }) => {
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
  localStorage.setItem("user", JSON.stringify(user));
};

/**
 * **일반 로그인 Thunk**
 * 이메일과 비밀번호를 이용하여 /accounts/login/ 엔드포인트에 요청합니다.
 * 백엔드 응답은 "access"와 "refresh"라는 키로 토큰을 반환합니다.
 */
export const loginAsync = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // 로그인 시에는 기존에 설정된 토큰 헤더가 있으면 제거합니다.
      delete axios.defaults.headers.common["Authorization"];

      const response = await axios.post("/accounts/login/", { email, password });
      // 백엔드에서는 "access"라는 키로 액세스 토큰을 반환합니다.
      const { access, refresh } = response.data;

      // 사용자 프로필을 별도 엔드포인트에서 가져옵니다.
      const userResponse = await axios.get("/accounts/user-profile/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      const user = userResponse.data;
      saveAuthData({ user, accessToken: access, refreshToken: refresh });
      return { user, accessToken: access, refreshToken: refresh };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

/**
 * **소셜 로그인 Thunk (통합)**
 * provider(google, naver, kakao)에 따라 엔드포인트를 선택하여 요청합니다.
 * 백엔드 응답은 "access"와 "refresh"라는 키로 토큰을 반환합니다.
 */
export const socialLoginAsync = createAsyncThunk(
  "auth/socialLogin",
  async ({ provider, accessToken }, { rejectWithValue }) => {
    try {
      // 소셜 로그인 시에도 기존 토큰 헤더 제거
      delete axios.defaults.headers.common["Authorization"];

      const endpointMap = {
        google: "/accounts/google/",
        naver: "/accounts/naver/",
        kakao: "/accounts/kakao/",
      };

      const endpoint = endpointMap[provider];
      if (!endpoint) {
        throw new Error("Invalid provider");
      }

      const response = await axios.post(endpoint, { access_token: accessToken });
      // 백엔드 응답에서 "access"와 "refresh"라는 키를 반환합니다.
      const { access, refresh, user } = response.data;
      saveAuthData({ user, accessToken: access, refreshToken: refresh });
      return { user, accessToken: access, refreshToken: refresh };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Social login failed"
      );
    }
  }
);

// Slice 생성
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
    setAuth: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // **일반 로그인 처리**
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // **소셜 로그인 처리**
      .addCase(socialLoginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(socialLoginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(socialLoginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setAuth } = authSlice.actions;
export default authSlice.reducer;
