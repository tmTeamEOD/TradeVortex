import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const NewsList = ({ newsList }) => {
    const defaultImage = "https://img.etnews.com/news/article/2024/11/21/news-p.v1.20241121.41fd203d57504be18766a7a6d2e244fc_P1.png";

    return (
        <div className="space-y-8">
            {newsList.map((news, index) => {
                // image 값을 정제하여 앞뒤 공백 제거
                const imageUrl = news?.image?.trim();
                // 로깅을 통해 데이터 값 확인 (디버그용)
                console.log(`뉴스 id ${news.id}의 이미지:`, imageUrl);

                return (
                    <motion.div
                        key={index}
                        className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <img
                          src={
                            !imageUrl || imageUrl === "http://192.168.0.6:8000null" || imageUrl === ""
                              ? defaultImage
                              : imageUrl
                          }
                          alt={news.title}
                          className="w-full h-52 object-cover"
                        />
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-2">{news.title}</h2>
                            <p className="text-gray-300">{news.content}</p>
                            {news.url && (
                                <a
                                    href={news.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 flex items-center text-blue-400 hover:text-blue-600"
                                >
                                    원본 기사 보기 <ExternalLink className="ml-1 w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default NewsList;
