// src/pages/Login.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuth } from "../redux/slices/authSlice.js"; // setAuth 액션 추가

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleLogin = () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get("token") || queryParams.get("access_token");
      const refreshToken = queryParams.get("refresh_token");
      const email = queryParams.get("email");
      const username = queryParams.get("username");

      // 디버깅용 로그 추가
      console.log("Received query params:", { token, refreshToken, email, username });

      if (!token || !email || !username) {
        alert("로그인 정보가 올바르지 않습니다.");
        navigate("/"); // 홈으로 리다이렉트
        return;
      }

      // 로컬 스토리지에 토큰 및 사용자 정보 저장
      localStorage.setItem("accessToken", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      localStorage.setItem("user", JSON.stringify({ email, username }));

      // Redux 상태 업데이트
      dispatch(
        setAuth({
          user: { email, username },
          accessToken: token,
          refreshToken: refreshToken || null,
        })
      );

      // 메인 페이지로 이동
      navigate("/main");
    };

    handleLogin();
  }, [location, navigate, dispatch]);

  return <div>로그인 처리 중... 잠시만 기다려 주세요.</div>;
};

export default Login;
