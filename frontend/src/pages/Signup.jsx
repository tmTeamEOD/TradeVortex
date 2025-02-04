import React, {useState, useEffect, useCallback} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import Navigation from "../components/Navigation.jsx";
import {motion} from "framer-motion";
import {FiMail, FiUser, FiLock, FiUpload, FiX} from "react-icons/fi";
import {useDropzone} from "react-dropzone";
import debounce from "lodash.debounce"; // lodash.debounce 설치 필요

const API_BASE_URL = "http://192.168.0.6:8000/api";

const InputField = ({id, label, type, value, onChange, error, icon}) => (
    <div className="mb-6">
        <label htmlFor={id} className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            {label}
        </label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">{icon}</span>
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-300 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-gray-200 ${
                    error ? "border-red-500 focus:ring-red-300" : "border-gray-300 dark:border-gray-600"
                }`}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? `${id}-error` : undefined}
            />
        </div>
        {error && <p id={`${id}-error`} className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
);

const FileUpload = ({onFileSelect, file, setFile}) => {
    const onDrop = useCallback(
        (acceptedFiles, fileRejections) => {
            if (fileRejections && fileRejections.length > 0) {
                alert("유효하지 않은 파일 형식이거나 파일 크기가 너무 큽니다. (최대 5MB)");
                return;
            }
            if (acceptedFiles && acceptedFiles.length > 0) {
                onFileSelect(acceptedFiles[0]);
            }
        },
        [onFileSelect]
    );

    const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
        onDrop,
        accept: "image/*",
        multiple: false,
        noClick: true,
        noKeyboard: true,
        maxSize: 5 * 1024 * 1024, // 최대 5MB
    });

    return (
        <div className="mb-6">
            <label htmlFor="profile_picture"
                   className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                프로필 사진
            </label>
            <div
                {...getRootProps()}
                className={`flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors duration-300 ${
                    isDragActive
                        ? "border-blue-500 bg-blue-50 dark:bg-gray-700"
                        : "border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                }`}
            >
                <input {...getInputProps()} />
                {file ? (
                    <div className="relative">
                        <img
                            src={URL.createObjectURL(file)}
                            alt="프로필 미리보기"
                            className="w-32 h-32 object-cover rounded-full"
                        />
                        <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 focus:outline-none"
                            aria-label="Remove image"
                        >
                            <FiX/>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <FiUpload className="text-3xl text-gray-400 mb-2"/>
                        <p className="text-gray-500">드래그 앤 드롭 또는 클릭하여 파일을 선택하세요.</p>
                        <button
                            type="button"
                            onClick={open}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            파일 선택
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const Signup = () => {
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password1: "",
        password2: "",
        profilePicture: null,
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        email: null,
        username: null,
        password: null,
    });
    const [showEmailAlert, setShowEmailAlert] = useState(false);

    const navigate = useNavigate();

    const debounceCheckEmail = useCallback(
        debounce(async (email) => {
            if (email) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/accounts/check_email/`, {email}, {withCredentials: true});
                    if (response.data.exists) {
                        setFieldErrors((prev) => ({...prev, email: "이미 사용 중인 이메일입니다."}));
                    } else {
                        setFieldErrors((prev) => ({...prev, email: null}));
                    }
                } catch {
                    setFieldErrors((prev) => ({...prev, email: "이메일 중복 확인에 실패했습니다."}));
                }
            }
        }, 500),
        []
    );

    const debounceCheckUsername = useCallback(
        debounce(async (username) => {
            if (username) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/accounts/check_username/`, {username}, {withCredentials: true});
                    if (response.data.exists) {
                        setFieldErrors((prev) => ({...prev, username: "이미 사용 중인 사용자명입니다."}));
                    } else {
                        setFieldErrors((prev) => ({...prev, username: null}));
                    }
                } catch {
                    setFieldErrors((prev) => ({...prev, username: "사용자명 중복 확인에 실패했습니다."}));
                }
            }
        }, 500),
        []
    );

    useEffect(() => {
        debounceCheckEmail(formData.email);
    }, [formData.email, debounceCheckEmail]);

    useEffect(() => {
        debounceCheckUsername(formData.username);
    }, [formData.username, debounceCheckUsername]);

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (name === "password1" || name === "password2") {
            if (name === "password2" && formData.password1 !== value) {
                setFieldErrors((prev) => ({...prev, password: "비밀번호가 일치하지 않습니다."}));
            } else if (name === "password1" && formData.password2 && value !== formData.password2) {
                setFieldErrors((prev) => ({...prev, password: "비밀번호가 일치하지 않습니다."}));
            } else {
                setFieldErrors((prev) => ({...prev, password: null}));
            }
        }
    };

    const handleFileSelect = (file) => {
        setFormData((prevData) => ({
            ...prevData,
            profilePicture: file,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password1 !== formData.password2) {
            setFieldErrors((prev) => ({...prev, password: "비밀번호가 일치하지 않습니다."}));
            return;
        }

        setIsLoading(true);
        setError(null);

        const formDataToSubmit = new FormData();
        Object.keys(formData).forEach((key) => {
            if (key === "profilePicture" && formData[key]) {
                formDataToSubmit.append("profile_picture", formData[key]);
            } else if (key !== "profilePicture") {
                formDataToSubmit.append(key, formData[key]);
            }
        });

        try {
            await axios.post(`${API_BASE_URL}/accounts/signup/`, formDataToSubmit, {withCredentials: true});
            setShowEmailAlert(true);
        } catch {
            setError("회원가입에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200">
            <Navigation/>
            <div className="flex justify-center items-center py-16 px-4">
                <motion.div
                    className="max-w-lg w-full bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg"
                    initial={{opacity: 0, y: -50}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, ease: "easeOut"}}
                >
                    <h2 className="text-3xl font-bold text-center mb-6 text-indigo-600 dark:text-indigo-400">회원가입</h2>
                    {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                    {showEmailAlert ? (
                        <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 relative">
                            회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화하세요.
                            <button
                                onClick={() => setShowEmailAlert(false)}
                                className="absolute top-2 right-2 text-green-800 bg-transparent hover:text-red-500 transition-colors"
                            >
                                <FiX/>
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <InputField
                                id="email"
                                label="이메일"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={fieldErrors.email}
                                icon={<FiMail className="text-xl"/>}
                            />
                            <InputField
                                id="username"
                                label="사용자명"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                error={fieldErrors.username}
                                icon={<FiUser className="text-xl"/>}
                            />
                            <InputField
                                id="password1"
                                label="비밀번호"
                                type="password"
                                value={formData.password1}
                                onChange={handleChange}
                                error={fieldErrors.password}
                                icon={<FiLock className="text-xl"/>}
                            />
                            <InputField
                                id="password2"
                                label="비밀번호 확인"
                                type="password"
                                value={formData.password2}
                                onChange={handleChange}
                                error={fieldErrors.password}
                                icon={<FiLock className="text-xl"/>}
                            />
                            <FileUpload onFileSelect={handleFileSelect} file={formData.profilePicture}
                                        setFile={handleFileSelect}/>
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                className={`w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center ${
                                    isLoading ? "cursor-not-allowed opacity-50" : ""
                                }`}
                            >
                                {isLoading ? "회원가입 중..." : "회원가입"}
                            </motion.button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );

};

export default Signup;
