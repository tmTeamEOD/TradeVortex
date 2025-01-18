# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.core.files.base import ContentFile
from django.shortcuts import redirect
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import requests
from datetime import datetime, timedelta
import jwt

from accounts.serializers import CustomRegisterSerializer
from dj_rest_auth.registration.views import RegisterView

User = get_user_model()



from django.core.mail import send_mail
from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

from dj_rest_auth.registration.views import RegisterView
from .tokens import email_activation_token

@method_decorator(csrf_exempt, name='dispatch')  # 개발 환경에서만 사용
class CustomRegisterView(RegisterView):
    """
    dj-rest-auth의 RegisterView를 상속하지만,
    이메일 인증 로직을 직접 삽입하기 위해 perform_create 오버라이드.
    """

    def perform_create(self, serializer):
        user = serializer.save(self.request)  # User 생성
        user.is_active = False  # 활성화 전까지 로그인 불가
        user.save()

        # 1) 토큰 생성
        token = email_activation_token.make_token(user)

        # 2) 링크 구성 (uidb64 + token)
        #    allauth/dj-rest-auth의 기본 confirm 링크를 안 쓰고,
        #    우리가 직접 activate 뷰를 만든다고 가정
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        # 예: /accounts/activate/?uid=...&token=...
        # 도메인은 django.contrib.sites.get_current_site를 활용
        current_site = get_current_site(self.request)
        domain = current_site.domain  # 개발 환경이면 "localhost:8000" 등
        activate_url = f"http://{domain}/accounts/activate/?uid={uidb64}&token={token}"

        # 3) 이메일 전송
        subject = "이메일 인증 안내"
        message = f"아래 링크를 클릭하여 회원가입을 완료해주세요:\n{activate_url}"

        # settings.py에서 DEFAULT_FROM_EMAIL, EMAIL_BACKEND 설정 필요
        send_mail(
            subject,
            message,
            from_email=None,  # None이면 DEFAULT_FROM_EMAIL 사용
            recipient_list=[user.email],
            fail_silently=False,
        )

        # user 객체 리턴
        return user


from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from .tokens import email_activation_token


class ActivateEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        uidb64 = request.GET.get('uid')
        token = request.GET.get('token')
        if not uidb64 or not token:
            return Response({"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # uidb64를 원래 user pk로 디코딩
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and email_activation_token.check_token(user, token):
            # 토큰이 유효하면 활성화 처리
            user.is_active = True
            user.save()
            return Response({"message": "이메일 인증이 완료되었습니다."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "유효하지 않은 토큰이거나 이미 인증이 완료되었습니다."},
                            status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {"error": "이메일과 비밀번호를 모두 입력해야 합니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = authenticate(username=email, password=password)
            if user is not None:
                if user.is_active:
                    refresh = RefreshToken.for_user(user)
                    user.last_login = datetime.now()
                    user.save()
                    return Response({
                        "access_token": str(refresh.access_token),
                        "refresh_token": str(refresh),
                        "user": {
                            "id": user.id,
                            "username": user.username,
                            "email": user.email,
                            "profile_picture_url": user.profile_picture.url if hasattr(user, 'profile_picture') and user.profile_picture else None,
                        }
                    }, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {"error": "비활성화된 계정입니다."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                return Response(
                    {"error": "이메일 또는 비밀번호가 잘못되었습니다."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except Exception as e:
            return Response(
                {"error": "인증 과정에서 문제가 발생했습니다.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get("access_token")
        if not access_token:
            return Response({"error": "Access Token is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Google API에서 사용자 정보 가져오기
        response = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        if response.status_code != 200:
            return Response({"error": "Failed to retrieve user info from Google."}, status=status.HTTP_400_BAD_REQUEST)

        user_info = response.json()
        email = user_info.get("email")
        name = user_info.get("name", "")
        picture = user_info.get("picture", "")

        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        # 사용자 생성 또는 조회
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": name or email.split('@')[0]}
        )

        # 프로필 사진 저장
        if created and picture:
            self.save_profile_picture(user, picture)

        # JWT 토큰 발급
        refresh = RefreshToken.for_user(user)

        return Response({
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "profile_picture_url": user.profile_picture.url if hasattr(user, 'profile_picture') and user.profile_picture else None,
            },
            "isNewUser": created,
        }, status=status.HTTP_200_OK)

    def save_profile_picture(self, user, picture_url):
        try:
            response = requests.get(picture_url)
            if response.status_code == 200:
                user.profile_picture.save(
                    f"profile_{user.email}.jpg",
                    ContentFile(response.content),
                    save=True
                )
        except Exception as e:
            print(f"Error saving profile picture: {e}")

class NaverLoginView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get("code")
        state = request.GET.get("state")

        if not code or not state:
            return Response({"error": "Naver authentication failed"}, status=status.HTTP_400_BAD_REQUEST)

        # Naver API 토큰 요청
        token_url = (
            f"https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id={settings.NAVER_CLIENT_ID}"
            f"&client_secret={settings.NAVER_CLIENT_SECRET}&code={code}&state={state}"
        )
        token_response = requests.get(token_url)
        token_data = token_response.json()

        access_token = token_data.get("access_token")
        if not access_token:
            return Response({"error": "Failed to retrieve access token from Naver"}, status=status.HTTP_400_BAD_REQUEST)

        # 사용자 프로필 요청
        profile_url = "https://openapi.naver.com/v1/nid/me"
        headers = {"Authorization": f"Bearer {access_token}"}
        profile_response = requests.get(profile_url, headers=headers)
        profile_data = profile_response.json()

        if profile_data.get("resultcode") != "00":
            return Response({"error": "Failed to retrieve user info from Naver"}, status=status.HTTP_400_BAD_REQUEST)

        profile = profile_data.get("response")
        email = profile.get("email")
        username = profile.get("nickname")
        profile_picture_url = profile.get("profile_image")

        if not email or not username:
            return Response({"error": "Incomplete user information from Naver"}, status=status.HTTP_400_BAD_REQUEST)

        # 사용자 생성 또는 조회
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": username}
        )

        # 프로필 사진 저장
        if created and profile_picture_url:
            self.save_profile_picture(user, profile_picture_url)

        # JWT 토큰 발급
        refresh = RefreshToken.for_user(user)

        # 리다이렉트 URL
        redirect_url = f"{settings.FRONTEND_URL}/login?token={refresh.access_token}&email={email}&username={username}"
        return redirect(redirect_url)

    def save_profile_picture(self, user, picture_url):
        try:
            response = requests.get(picture_url)
            if response.status_code == 200:
                user.profile_picture.save(
                    f"profile_{user.email}.jpg",
                    ContentFile(response.content),
                    save=True
                )
        except Exception as e:
            print(f"Error saving profile picture: {e}")

class KakaoLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get("access_token")
        if not access_token:
            return Response({"error": "Access Token이 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

        # 카카오 API를 통해 사용자 정보 가져오기
        kakao_response = requests.get(
            "https://kapi.kakao.com/v2/user/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        if kakao_response.status_code != 200:
            return Response({"error": "카카오에서 사용자 정보를 가져오는데 실패했습니다."}, status=status.HTTP_400_BAD_REQUEST)

        kakao_data = kakao_response.json()
        kakao_account = kakao_data.get("kakao_account", {})
        email = kakao_account.get("email")
        profile = kakao_account.get("profile", {})
        nickname = profile.get("nickname", "")
        profile_image_url = profile.get("profile_image_url", "")

        if not email:
            return Response({"error": "카카오 계정에 등록된 이메일이 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

        # 사용자 생성 또는 조회
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": nickname or email.split('@')[0]}
        )

        # 프로필 사진 저장
        if created and profile_image_url:
            self.save_profile_picture(user, profile_image_url)

        # JWT 토큰 발급
        refresh = RefreshToken.for_user(user)

        return Response({
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "profile_picture_url": user.profile_picture.url if hasattr(user, 'profile_picture') and user.profile_picture else None,
            },
            "isNewUser": created,
        }, status=status.HTTP_200_OK)

    def save_profile_picture(self, user, picture_url):
        try:
            response = requests.get(picture_url)
            if response.status_code == 200:
                user.profile_picture.save(
                    f"profile_{user.email}.jpg",
                    ContentFile(response.content),
                    save=True
                )
        except Exception as e:
            print(f"프로필 사진 저장 중 에러 발생: {e}")

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_picture_url": user.profile_picture.url if user.profile_picture else None,
        })

# 이메일 중복 확인
class CheckEmailAvailability(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        exists = User.objects.filter(email=email).exists()
        return Response({"exists": exists})

# 닉네임 중복 확인
class CheckUsernameAvailability(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({"detail": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

        exists = User.objects.filter(username=username).exists()
        return Response({"exists": exists})
