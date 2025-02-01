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
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  }
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
};

/**
 * **일반 로그인 Thunk**
 * 이메일과 비밀번호를 이용하여 /accounts/login/ 엔드포인트에 요청합니다.
 * 백엔드 응답은 "access_token"과 "refresh_token"을 반환합니다.
 */
export const loginAsync = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // 로그인 요청
      const response = await axios.post("/accounts/login/", { email, password });
      const { access_token, refresh_token } = response.data; // 서버에서 반환한 토큰 이름 확인

      // 로그인 후 사용자 프로필 정보 가져오기
      const userResponse = await axios.get("/accounts/user-profile/", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const user = userResponse.data;

      // 로컬 스토리지에 토큰과 유저 정보 저장
      saveAuthData({ user, accessToken: access_token, refreshToken: refresh_token });

      return { user, accessToken: access_token, refreshToken: refresh_token };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

/**
 * **소셜 로그인 Thunk (통합)**
 * provider(google, naver, kakao)에 따라 엔드포인트를 선택하여 요청합니다.
 * 백엔드 응답은 "access_token"과 "refresh_token"을 반환합니다.
 */
export const socialLoginAsync = createAsyncThunk(
  "auth/socialLogin",
  async ({ provider, accessToken }, { rejectWithValue }) => {
    try {
      // 소셜 로그인 시에도 기존 토큰 헤더 제거
      delete axios.defaults.headers.common["Authorization"];

      // 소셜 로그인 엔드포인트 맵핑
      const endpointMap = {
        google: "/accounts/google/",
        naver: "/accounts/naver/",
        kakao: "/accounts/kakao/",
      };

      const endpoint = endpointMap[provider];
      if (!endpoint) {
        throw new Error("Invalid provider");
      }

      // 소셜 로그인 API 요청
      const response = await axios.post(endpoint, { access_token: accessToken });

      // 서버에서 반환한 토큰 및 유저 정보 처리
      const { access_token, refresh_token } = response.data;
      const userResponse = await axios.get("/accounts/user-profile/", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const user = userResponse.data;

      // 로컬 스토리지에 토큰과 유저 정보 저장
      saveAuthData({ user, accessToken: access_token, refreshToken: refresh_token });

      return { user, accessToken: access_token, refreshToken: refresh_token };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Social login failed"
      );
    }
  }
);

// 토큰이 만료되었는지 확인하는 함수 (JWT 토큰)
function isTokenExpired(token) {
  const decoded = JSON.parse(atob(token.split('.')[1]));
  const expirationTime = decoded.exp * 1000; // exp는 초 단위, 밀리초로 변환
  return Date.now() > expirationTime;
}

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

      // 로컬 스토리지에서 토큰 및 유저 정보 제거
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
