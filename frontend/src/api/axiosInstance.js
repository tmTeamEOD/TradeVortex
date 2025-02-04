import axios from "axios";
    const django = import.meta.env.VITE_DJANGO_URL;

// 기본 axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: `${django}/api/`,  // 백엔드 URL
  timeout: 5000,  // 5초 타임아웃 설정
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
axiosInstance.interceptors.response.use(
  async (response) => response,  // 정상 응답 처리
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 에러가 발생한 경우 (액세스 토큰 만료)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 로컬 스토리지에서 리프레시 토큰 가져오기
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // 리프레시 토큰을 사용하여 새로운 액세스 토큰 요청
          const refreshResponse = await axios.post("http://192.168.0.6:8000/api/accounts/refresh-token/", {
            refresh_token: refreshToken,  // 리프레시 토큰
          });

          // 새로운 액세스 토큰을 받아서 로컬 스토리지에 저장
          const { access_token } = refreshResponse.data;
          localStorage.setItem("accessToken", access_token);

          // 원래 요청에 새로운 액세스 토큰을 추가하여 재시도
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
          return axios(originalRequest);  // 원래 요청을 새 토큰으로 재시도
        } catch (refreshError) {
          // 리프레시 토큰이 잘못된 경우 로그아웃 처리
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/";  // 로그인 페이지로 리디렉션
        }
      }
    }

    // 그 외의 오류는 그대로 반환
    return Promise.reject(error);
  }
);

export default axiosInstance;
