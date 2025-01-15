// SocialLoginSection.jsx
import React from "react";
import SocialLoginButton from "./SocialLoginButton.jsx";
import { SOCIAL_LOGIN_PROVIDERS } from "./socialLoginProviders.jsx";

const SocialLoginSection = ({
  handleGoogleLogin,
  handleKakaoLogin,
  handleNaverLogin,
  handleAppleLogin,
}) => {
  const loginHandlers = {
    google: handleGoogleLogin,
    kakao: handleKakaoLogin,
    naver: handleNaverLogin,
    apple: handleAppleLogin,
  };

  return (
    <div className="mt-6">
      <p className="text-sm text-gray-500 text-center mb-6">소셜 계정으로 로그인</p>
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

export default SocialLoginSection;
