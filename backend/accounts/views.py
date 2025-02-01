# accounts/views.py
from django.contrib.auth.tokens import default_token_generator
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
from datetime import datetime
import jwt

from accounts.serializers import CustomRegisterSerializer
from dj_rest_auth.registration.views import RegisterView

User = get_user_model()

from django.core.mail import send_mail
from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from dj_rest_auth.registration.views import RegisterView
from .tokens import email_activation_token

# 프로필 사진 저장 유틸 함수 임포트 (이미 사용 중인 save_profile_picture는 URL 기반 다운로드용)
from accounts.utils import save_profile_picture


# =============================================================================
# 회원가입 및 이메일 인증 관련 뷰
# =============================================================================

@method_decorator(csrf_exempt, name='dispatch')  # 개발 환경에서만 사용
class CustomRegisterView(RegisterView):
    """
    회원가입 시 사용자를 생성하고, 계정을 비활성화한 상태로 이메일 인증 링크를 발송합니다.
    추가로, 프론트엔드에서 'profile_picture' 파일이 함께 전송된 경우 해당 파일을 저장합니다.
    """

    def perform_create(self, serializer):
        # 사용자 생성 (serializer는 일반 필드(email, username, password 등)를 처리)
        user = serializer.save(self.request)

        # 파일 업로드 처리: request.FILES에서 'profile_picture' 키가 존재하면 저장합니다.
        profile_picture = self.request.FILES.get("profile_picture")
        if profile_picture:
            # 파일을 바로 할당하면 Django가 기본 FileSystemStorage를 통해 저장합니다.
            user.profile_picture = profile_picture
            user.save()
            # 또는, 만약 외부 URL을 통한 다운로드 및 저장 방식이 필요하다면
            # save_profile_picture(user, <URL>) 처럼 호출하면 되지만,
            # 일반 회원가입의 경우 클라이언트에서 업로드한 파일 객체를 그대로 사용합니다.

        # 계정 활성화를 위해 is_active=False로 설정
        user.is_active = False
        user.save()

        # 1) 이메일 인증 토큰 생성
        token = email_activation_token.make_token(user)
        # 2) uid와 토큰을 포함한 인증 링크 구성
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        frontend_url = settings.FRONTEND_URL  # 예: "https://your-frontend.com"
        activate_url = f"{frontend_url}/activate?uid={uidb64}&token={token}"

        # 3) 이메일 템플릿 렌더링
        subject = "이메일 인증을 완료해주세요! 🚀"
        context = {
            "user": user,
            "activate_url": activate_url
        }
        html_message = render_to_string("email_verification.html", context)
        plain_message = strip_tags(html_message)

        # 4) 이메일 전송
        email_obj = EmailMultiAlternatives(
            subject,
            plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email_obj.attach_alternative(html_message, "text/html")
        email_obj.send()

        return user


class ActivateAccountView(APIView):
    """
    이메일 인증 링크를 통해 계정을 활성화합니다.
    uid와 token이 모두 필요하며, 토큰 검증에 실패하면 오류 메시지를 반환합니다.
    """

    def post(self, request, *args, **kwargs):
        uid = request.data.get("uid")
        token = request.data.get("token")

        if not uid or not token:
            return Response(
                {"error": "잘못된 요청입니다. uid와 token이 모두 필요합니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            uid_decoded = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid_decoded)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response(
                {"error": "입력하신 uid에 해당하는 사용자를 찾을 수 없습니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if email_activation_token.check_token(user, token):
            user.is_active = True
            user.is_verified = True  # 이메일 인증 완료 처리
            user.save()
            return Response(
                {"message": "계정이 성공적으로 활성화되었습니다."},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "인증 링크가 유효하지 않거나 만료되었습니다."},
                status=status.HTTP_400_BAD_REQUEST
            )


# =============================================================================
# 로그인 및 소셜 로그인 관련 뷰
# =============================================================================

class LoginView(APIView):
    """
    로그인 뷰 - 이메일과 비밀번호를 사용하여 인증하고,
    이메일 인증이 완료되지 않은 경우 토큰 발행 없이 오류 메시지를 반환합니다.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {"error": "이메일과 비밀번호는 필수 입력값입니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = authenticate(username=email, password=password)
            if user is None:
                return Response(
                    {"error": "이메일 또는 비밀번호가 올바르지 않습니다."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # 이메일 인증 여부 검사
            if not getattr(user, "is_verified", False):
                return Response(
                    {"error": "이메일 인증이 완료되지 않았습니다. 인증 메일을 확인해주세요."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # 인증이 완료된 경우에만 토큰 발행
            refresh = RefreshToken.for_user(user)
            user.last_login = datetime.now()
            user.save()
            return Response({
                "access": str(refresh.access_token),  # 클라이언트가 기대하는 키 이름
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "profile_picture_url": user.profile_picture.url if hasattr(user,
                                                                               'profile_picture') and user.profile_picture else None,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"로그인 처리 중 문제가 발생했습니다: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GoogleLoginView(APIView):
    """
    Google 소셜 로그인을 처리합니다.
    액세스 토큰이 없거나, 사용자 정보를 가져오는데 실패하면 적절한 오류 메시지를 반환합니다.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get("access_token")
        if not access_token:
            return Response(
                {"error": "Google 액세스 토큰이 필요합니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Google API를 통해 사용자 정보 가져오기
        response = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        if response.status_code != 200:
            return Response(
                {"error": "Google 사용자 정보를 가져오는데 실패했습니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_info = response.json()
        email = user_info.get("email")
        name = user_info.get("name", "")
        picture = user_info.get("picture", "")

        if not email:
            return Response(
                {"error": "Google 사용자 이메일 정보가 누락되었습니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": name or email.split('@')[0]}
        )

        # 프로필 사진 저장 (필요한 경우)
        if created and picture:
            save_profile_picture(user, picture)

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "profile_picture_url": user.profile_picture.url if hasattr(user,
                                                                           'profile_picture') and user.profile_picture else None,
            },
            "isNewUser": created,
        }, status=status.HTTP_200_OK)


class NaverLoginView(APIView):
    """
    Naver 소셜 로그인을 처리합니다.
    필요한 정보(코드, state 등)가 누락되었거나 토큰/프로필 정보를 가져오지 못하면 오류 메시지를 반환합니다.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get("code")
        state = request.GET.get("state")

        if not code or not state:
            return Response(
                {"error": "네이버 인증에 필요한 정보가 누락되었습니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        token_url = (
            f"https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id={settings.NAVER_CLIENT_ID}"
            f"&client_secret={settings.NAVER_CLIENT_SECRET}&code={code}&state={state}"
        )
        token_response = requests.get(token_url)
        token_data = token_response.json()

        access_token = token_data.get("access_token")
        if not access_token:
            return Response(
                {"error": "네이버 액세스 토큰을 가져오는데 실패했습니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile_url = "https://openapi.naver.com/v1/nid/me"
        headers = {"Authorization": f"Bearer {access_token}"}
        profile_response = requests.get(profile_url, headers=headers)
        profile_data = profile_response.json()

        if profile_data.get("resultcode") != "00":
            return Response(
                {"error": "네이버 사용자 정보를 가져오는데 실패했습니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = profile_data.get("response")
        email = profile.get("email")
        username = profile.get("nickname")
        profile_picture_url = profile.get("profile_image")

        if not email or not username:
            return Response(
                {"error": "네이버에서 제공한 사용자 정보가 불완전합니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": username}
        )

        if created and profile_picture_url:
            save_profile_picture(user, profile_picture_url)

        refresh = RefreshToken.for_user(user)
        redirect_url = f"{settings.FRONTEND_URL}/login?token={refresh.access_token}&email={email}&username={username}"
        return redirect(redirect_url)


class KakaoLoginView(APIView):
    """
    Kakao 소셜 로그인을 처리합니다.
    액세스 토큰 및 사용자 정보가 누락되었거나 오류가 발생하면 오류 메시지를 반환합니다.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get("access_token")
        if not access_token:
            return Response(
                {"error": "Kakao 액세스 토큰이 필요합니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        kakao_response = requests.get(
            "https://kapi.kakao.com/v2/user/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        if kakao_response.status_code != 200:
            return Response(
                {"error": "카카오에서 사용자 정보를 가져오는데 실패했습니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        kakao_data = kakao_response.json()
        kakao_account = kakao_data.get("kakao_account", {})
        email = kakao_account.get("email")
        profile = kakao_account.get("profile", {})
        nickname = profile.get("nickname", "")
        profile_image_url = profile.get("profile_image_url", "")

        if not email:
            return Response(
                {"error": "카카오 계정에 등록된 이메일 정보가 누락되었습니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": nickname or email.split('@')[0]}
        )

        if created and profile_image_url:
            save_profile_picture(user, profile_image_url)

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "profile_picture_url": user.profile_picture.url if hasattr(user,
                                                                           'profile_picture') and user.profile_picture else None,
            },
            "isNewUser": created,
        }, status=status.HTTP_200_OK)


# =============================================================================
# 사용자 프로필 및 중복 확인 관련 뷰
# =============================================================================

class UserProfileView(APIView):
    """
    인증된 사용자의 프로필 정보를 반환합니다.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_picture_url": user.profile_picture.url if user.profile_picture else None,
        })


class CheckEmailAvailability(APIView):
    """
    이메일 중복 여부를 확인합니다.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {"detail": "이메일은 필수 입력 항목입니다."},
                status=status.HTTP_400_BAD_REQUEST
            )
        exists = User.objects.filter(email=email).exists()
        return Response({"exists": exists})


class CheckUsernameAvailability(APIView):
    """
    닉네임 중복 여부를 확인합니다.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response(
                {"detail": "닉네임은 필수 입력 항목입니다."},
                status=status.HTTP_400_BAD_REQUEST
            )
        exists = User.objects.filter(username=username).exists()
        return Response({"exists": exists})
