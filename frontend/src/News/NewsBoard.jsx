// NewsBoard.js
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';

const NewsBoard = () => {
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 하드코딩된 API 엔드포인트 사용
        axios
            .get('http://127.0.0.1:8000/api/news/')
            .then((response) => {
                setNewsList(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching news list", err);
                setError("뉴스 목록을 불러오는 중 오류가 발생했습니다.");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p>로딩 중...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>뉴스 목록</h1>
            <ul>
                {newsList.map((news) => (
                    <li key={news.id}>
                        <Link to={`/news/${news.id}`}>{news.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NewsBoard;
