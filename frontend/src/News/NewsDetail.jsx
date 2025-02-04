// NewsDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axiosInstance.js'; // 기존 인스턴스를 사용

const NewsDetail = () => {
  const { id } = useParams(); // URL 파라미터에서 뉴스 ID 추출
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

// NewsDetail.js (뉴스 상세 컴포넌트 예시)
useEffect(() => {
  // 뉴스 상세 정보를 가져오는 API 호출
  axios
    .get(`http://192.168.0.6:8000/api/news/news/${id}`)
    .then((response) => {
      console.log('뉴스 상세 정보:', response.data); // 응답을 콘솔에 출력
      setNews(response.data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching news detail", err); // 에러를 콘솔에 출력
      setError("뉴스 상세 정보를 불러오는 중 오류가 발생했습니다.");
      setLoading(false);
    });
}, [id]);

  if (loading) {
    return <p>로딩 중...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!news) {
    return <p>뉴스를 찾을 수 없습니다.</p>;
  }

  return (
    <div>
      <h1>{news.title}</h1>
      <p>{news.content}</p>
      <a href={news.url} target="_blank" rel="noopener noreferrer">원본 기사 보기</a>
      <p><strong>자산:</strong> {news.asset}</p>
      <p><strong>작성일:</strong> {news.created_at}</p>
    </div>
  );
};

export default NewsDetail;
