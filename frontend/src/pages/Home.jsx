// components/Home.js
import React from "react";
import {motion} from "framer-motion";
import {useNavigate} from "react-router-dom"; // useNavigate 임포트

const Home = () => {
    const navigate = useNavigate(); // navigate 함수 사용

    const handleSignUp = () => {
        navigate("/main"); // /main으로 네비게이션
    };

    return (
        <div>
            {/* Hero Section */}
            <section
                className="relative h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white px-4">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <motion.h1
                        className="text-6xl md:text-8xl font-extrabold tracking-wide"
                        initial={{opacity: 0, y: -50}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 1.5}}
                    >
                        <div className="relative w-[300px] h-[300px] ">
                                                        {/*<img src="bg.jpg" alt="React Logo" className="w-[300px] h-[200px] ml-[200px] mb-[300px]"/>*/}

                            <img src="icons/TV.svg" alt="React Logo" className="w-[300px] h-[200px] ml-[200px] mb-[300px]"/>
                            <span
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold ">
    TradeVortex
  </span>
                        </div>
                    </motion.h1>
                    <motion.p
                        className="text-xl md:text-2xl font-semibold"
                        initial={{opacity: 0, y: 50}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 1.5, delay: 0.5}}
                    >
                        금융 커뮤니티의 중심에서
                    </motion.p>
                    <motion.p
                        className="text-lg md:text-xl max-w-2xl"
                        initial={{opacity: 0, y: 50}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 1.5, delay: 1}}
                    >
                        실시간 시장 동향, 전문가 분석, 그리고 커뮤니티의 힘을 경험하세요. TradeVortex와 함께 금융의 미래를 만들어 나가세요.
                    </motion.p>
                    <motion.button
                        className="mt-8 px-6 py-3 bg-indigo-600 text-lg font-bold rounded-full shadow-lg hover:bg-indigo-500 transform hover:scale-105 transition"
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        onClick={handleSignUp} // 클릭 시 handleSignUp 함수 호출
                    >
                        시작하기
                    </motion.button>
                    <motion.div
                        className="absolute bottom-10 flex flex-col items-center"
                        initial={{opacity: 0, y: 10}}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            y: [0, 10, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop",
                        }}
                    >
                        <div className="w-10 h-10 flex justify-center items-center">
                            <motion.div
                                className="w-6 h-6 border-b-4 border-r-4 border-white transform rotate-45"
                                style={{marginBottom: "-8px"}}
                            />
                        </div>
                        <p className="text-sm font-semibold mt-2 text-white">제발 스크롤을 내려다오</p>
                    </motion.div>

                </div>
            </section>

            {/* About Section */}
            <section className="relative bg-gray-900 text-white py-32 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.h2
                        className="text-5xl md:text-7xl font-bold mb-8"
                        initial={{opacity: 0, y: 50}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true}}
                        transition={{duration: 1}}
                    >
                        커뮤니티 소개
                    </motion.h2>
                    <motion.p
                        className="text-lg md:text-xl leading-relaxed"
                        initial={{opacity: 0, y: 50}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true}}
                        transition={{duration: 1.2}}
                    >
                        가장 혁신적이고 역동적인 금융 커뮤니티에 오신 것을 환영합니다. 이곳은 전문가, 취미 투자자, 학습자들이 함께 모여 금융의 미래를 논의하고 탐구하며 함께 만들어가는
                        공간입니다. 경험이 풍부한 투자자, 성장하는 트레이더, 혹은 금융에 대한 호기심을 가진 누구든지, 저희 플랫폼은 탁월한 통찰력, 유용한 도구, 그리고 같은 생각을 가진
                        사람들과 연결될 수 있는 기회를 제공합니다.
                    </motion.p>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative bg-black text-white py-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            title: "실시간 시장 인사이트",
                            desc: "최신 시장 데이터, 뉴스, 트렌드로 앞서 나가세요.",
                        },
                        {
                            title: "전문가 분석",
                            desc: "최고의 금융 전문가로부터 심층 보고서와 의견을 배워보세요.",
                        },
                        {
                            title: "인터랙티브 포럼",
                            desc: "토론에 참여하고, 질문을 하며, 아이디어를 공유하세요.",
                        },
                        {
                            title: "학습 자료",
                            desc: "튜토리얼, 가이드, 강좌를 통해 지식을 심화하세요.",
                        },
                        {
                            title: "고급 도구",
                            desc: "강력한 금융 도구를 사용하여 시장 행동을 분석하고 예측하세요.",
                        },
                        {
                            title: "독점 이벤트",
                            desc: "웨비나, 라이브 세션, 네트워킹 이벤트에 참여하세요.",
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="p-6 bg-gray-800 text-center rounded-lg shadow-lg hover:scale-105 transition-transform"
                            initial={{opacity: 0, y: 50}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.6, delay: index * 0.2}}
                        >
                            <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-lg text-gray-300">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Community Testimonials */}
            <section className="relative bg-gray-900 text-white py-32 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.h2
                        className="text-5xl md:text-7xl font-bold mb-8"
                        initial={{opacity: 0, y: 50}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true}}
                        transition={{duration: 1}}
                    >
                        회원들의 소리
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                name: "김지미",
                                feedback:
                                    "이 플랫폼은 제가 투자하는 방식을 혁신적으로 변화시켰습니다. 도구와 통찰력은 비할 데 없습니다.",
                            },
                            {
                                name: "박지미",
                                feedback:
                                    "교육, 분석, 커뮤니티 지원이 완벽하게 조화를 이루고 있습니다. 저는 더 큰 자신감과 정보력을 얻었습니다.",
                            },
                            {
                                name: "이지미",
                                feedback:
                                    "이런 지미 이 사이트 추천만 믿고 투자했다가 집문서 날렸어요 고소한다 진짜.",
                            },
                        ].map((testimonial, index) => (
                            <motion.div
                                key={index}
                                className="p-6 bg-gray-800 rounded-lg shadow-lg"
                                initial={{opacity: 0, y: 50}}
                                whileInView={{opacity: 1, y: 0}}
                                viewport={{once: true}}
                                transition={{duration: 0.6, delay: index * 0.2}}
                            >
                                <p className="text-lg italic text-gray-300 mb-4">
                                    "{testimonial.feedback}"
                                </p>
                                <h4 className="text-xl font-bold">{testimonial.name}</h4>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="relative bg-gradient-to-b from-gray-900 to-black text-white text-center py-32 px-4">
                <h2 className="text-6xl md:text-8xl font-extrabold mb-8">
                    커뮤니티에 가입하세요
                </h2>
                <motion.button
                    className="px-8 py-4 bg-indigo-600 text-lg font-bold rounded-full shadow-lg hover:bg-indigo-500 transform hover:scale-105 transition"
                    whileHover={{scale: 1.1}}
                    whileTap={{scale: 0.9}}
                    onClick={handleSignUp} // 클릭 시 handleSignUp 함수 호출
                >
                    가즈아
                </motion.button>
            </section>
        </div>
    );
};

export default Home;
