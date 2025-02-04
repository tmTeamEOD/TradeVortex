import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EmailActivate = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    useEffect(() => {
        const activateAccount = async () => {
            try {
                const response = await axios.post("http://192.168.0.6:8000/api/accounts/activate/", {
                    uid,
                    token,
                });
                setSuccess(true);
            } catch (error) {
                console.error("이메일 인증 실패:", error);
                setSuccess(false);
            } finally {
                setLoading(false);
            }
        };

        if (uid && token) {
            activateAccount();
        } else {
            setLoading(false);
            setSuccess(false);
        }
    }, [uid, token]);

    if (loading) return <p className="text-lg text-gray-600 text-center mt-10">이메일 인증 중입니다...</p>;

    return (
        <div className="container mx-auto mt-20 p-6 max-w-lg text-center shadow-lg rounded-lg bg-white">
            {success ? (
                <>
                    <h1 className="text-2xl font-semibold text-green-500 mb-6">이메일 인증이 완료되었습니다! 🎉</h1>
                    <button
                        className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300"
                        onClick={() => navigate("/main")}
                    >
                        메인으로 이동
                    </button>
                </>
            ) : (
                <h1 className="text-2xl font-semibold text-red-500">이메일 인증에 실패했습니다. 다시 시도해주세요.</h1>
            )}
        </div>
    );
};

export default EmailActivate;
