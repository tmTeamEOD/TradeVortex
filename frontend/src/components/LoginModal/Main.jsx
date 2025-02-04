// src/components/Main.jsx
import React, { useState, useEffect, useRef } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync, socialLoginAsync } from "../../redux/slices/authSlice.js";
import { Link, useNavigate } from "react-router-dom";
import { SOCIAL_LOGIN_PROVIDERS } from "./socialLoginProviders.jsx";
import { motion } from "framer-motion";

const BACKEND_URL = "http://127.0.0.1:8000";
const GOOGLE_CLIENT_ID =
  "984280779923-a9lns1v2lqa2uk516q0r2eh0p1eivkgj.apps.googleusercontent.com";
const KAKAO_JAVASCRIPT_KEY = "5f0118791b31473828c288fdf0bbe9a0";
const NAVER_CLIENT_ID = "6FCM6gjsZc50se9DNYRp"; // 실제 Naver Client ID로 교체

// 소셜 로그인 버튼 컴포넌트
const SocialLoginButton = ({
  provider,
  iconSrc,
  onClick,
  bgColor,
  textColor,
  label,
}) => (
  <motion.button
    onClick={onClick}
    className={`flex items-center justify-center w-full h-12 px-4 ${bgColor} ${textColor} rounded-md shadow-md border border-gray-300 hover:opacity-80 transition duration-200 transform hover:scale-105`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <img src={iconSrc} alt={`${provider} Logo`} className="w-6 h-6 mr-3" />
    <span className="font-semibold">{label}</span>
  </motion.button>
);

// 소셜 로그인 섹션 컴포넌트
const SocialLoginSection = ({
  handleGoogleLogin,
  handleKakaoLogin,
  handleNaverLogin,
}) => {
  const loginHandlers = {
    google: handleGoogleLogin,
    kakao: handleKakaoLogin,
    naver: handleNaverLogin,
  };

  return (
    <div className="mt-6">
      <p className="text-sm text-gray-500 text-center mb-6">
        소셜 계정으로 로그인
      </p>
      <div className="flex flex-col space-y-3">
        {SOCIAL_LOGIN_PROVIDERS.map((provider) => (
          <SocialLoginButton
            key={provider.provider}
            {...provider}
            onClick={loginHandlers[provider.provider]}
          />
        ))}
      </div>
    </div>
  );
};

const Main = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isClosing, setIsClosing] = useState(false);
  // 로그인 실패 메시지를 모달 내부에 표시하기 위한 state
  const [errorMsg, setErrorMsg] = useState("");

  // auth slice 에서 loading 상태를 구독 (error는 별도로 처리)
  const { loading } = useSelector((state) => state.auth);

  // 모달 애니메이션 종료 후 onClose 실행
  const closeWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      // 모달 닫힐 때 에러 메시지 초기화
      setErrorMsg("");
    }, 300);
  };

  // Kakao SDK 초기화
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JAVASCRIPT_KEY);
      console.log("Kakao SDK initialized");
    }
  }, []);

  // 백엔드 에러 메시지를 그대로 출력하기 위한 헬퍼 함수
  const getErrorMessage = (err) => {
    if (typeof err === "string") return err;
    if (typeof err === "object" && err.error) return err.error;
    return "오류가 발생했습니다.";
  };

  // Google 로그인 훅 설정
  const googleLogin = useGoogleLogin({
    onSuccess: (response) => {
      const accessToken = response.access_token;
      dispatch(socialLoginAsync({ provider: "google", accessToken }))
        .unwrap()
        .then(() => {
          closeWithAnimation();
          navigate("/main");
        })
        .catch((err) => {
          console.error("Google 로그인 실패:", err);
          setErrorMsg(getErrorMessage(err));
        });
    },
    onError: (error) => {
      console.error("Google 로그인 에러:", error);
      setErrorMsg(getErrorMessage(error));
    },
  });

  // 네이버 로그인 처리
  const handleNaverLogin = () => {
    const REDIRECT_URI = `${BACKEND_URL}/api/accounts/naver/`;
    const state =
      Math.random().toString(36).substring(2) + new Date().getTime();
    localStorage.setItem("naver_state", state);

    const naverAuthURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&state=${state}`;

    window.location.href = naverAuthURL;
  };

  // 카카오 로그인 처리
  const handleKakaoLogin = () => {
    const Kakao = window.Kakao;

    if (!Kakao) {
      setErrorMsg("Kakao SDK가 로드되지 않았습니다.");
      return;
    }

    Kakao.Auth.login({
      scope: "profile_nickname, account_email",
      success: (authObj) => {
        const accessToken = authObj.access_token;
        dispatch(socialLoginAsync({ provider: "kakao", accessToken }))
          .unwrap()
          .then(() => {
            closeWithAnimation();
            navigate("/main");
          })
          .catch((err) => {
            console.error("Kakao 로그인 실패:", err);
            setErrorMsg(getErrorMessage(err));
          });
      },
      fail: (err) => {
        console.error("Kakao 로그인 실패:", err);
        setErrorMsg(getErrorMessage(err));
      },
    });
  };

  // 일반 로그인 처리
  const handleFormSubmit = (e) => {
    e.preventDefault();
    dispatch(loginAsync(formData))
      .unwrap()
      .then(() => {
        closeWithAnimation();
        navigate("/main");
      })
      .catch((err) => {
        console.error("로그인 실패:", err);
        setErrorMsg(getErrorMessage(err));
      });
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        closeWithAnimation();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  // 외부 클릭으로 모달 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeWithAnimation();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
      >
        <div
          ref={modalRef}
          className={`bg-white text-black rounded-xl shadow-2xl w-96 p-8 border border-gray-200 transform transition-transform duration-300 ${
            isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <h2 className="text-3xl font-semibold mb-6 text-center text-blue-600">
            로그인
          </h2>
          {/* 실패 메시지가 있을 경우 모달 내부에 표시 */}
          {errorMsg && (
            <p className="mb-4 text-center text-red-500">{errorMsg}</p>
          )}
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <input
              type="email"
              name="email"
              placeholder="이메일"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <SocialLoginSection
            handleGoogleLogin={googleLogin}
            handleNaverLogin={handleNaverLogin}
            handleKakaoLogin={handleKakaoLogin}
          />

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              회원이 아니신가요?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:underline font-semibold"
                onClick={closeWithAnimation}
              >
                회원 가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Main;
