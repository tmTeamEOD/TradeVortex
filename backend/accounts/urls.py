from django.urls import path, include
from .views import GoogleLoginView, UserProfileView, NaverLoginView, CustomRegisterView, KakaoLoginView, \
    ActivateAccountView
from .views import CheckEmailAvailability, CheckUsernameAvailability, UserProfileUpdateView
# from .views import set_csrf_token
from .views import refresh_token

from .views import LoginView
urlpatterns = [
    path('signup/', CustomRegisterView.as_view(), name='rest_register'),  # 회원가입
    path('activate/', ActivateAccountView.as_view(), name='activate_email'),

    path('login/', LoginView.as_view(), name='account_login'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),    # path('social/google/', google_login, name='google_login'),  # Google 로그인 API URL 매핑
    path("naver/", NaverLoginView.as_view(), name="naver_login"),
    path('kakao/', KakaoLoginView.as_view(), name='kakao-login'),
    path('user-profile/', UserProfileView.as_view(), name='user-profile'),
    path('check_email/', CheckEmailAvailability.as_view(), name='check_email'),  # 이메일 중복 확인
    path('check_username/', CheckUsernameAvailability.as_view(), name='check_username'),  # 닉네임 중복 확인
    # path('csrf/', set_csrf_token, name='csrf'),
    path('kakao/', KakaoLoginView.as_view(), name='validate-token'),
    path('user-profile/update/', UserProfileUpdateView.as_view(), name='update_profile'),  # 프로필 수정
    path('refresh-token/', refresh_token, name='refresh-token'),

]
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)