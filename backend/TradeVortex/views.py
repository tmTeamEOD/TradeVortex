# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from rest_framework_simplejwt.tokens import RefreshToken
import requests

User = get_user_model()



class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]  # 인증된 사용자만 접근 가능

    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "profile_picture": user.profile_picture.url if hasattr(user, 'profile_picture') and user.profile_picture else None,
        }
        return Response(data, status=200)

# accounts/views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

class LoginView(APIView):
    """
    로그인 뷰 - 이메일 또는 비밀번호 인증
    """
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "이메일과 비밀번호는 필수 입력값입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            User = get_user_model()
            user = User.objects.filter(email=email).first()
            if user is None:
                return Response(
                    {"error": "이메일 또는 비밀번호가 올바르지 않습니다."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            # 비밀번호 확인
            if not user.check_password(password):
                return Response(
                    {"error": "이메일 또는 비밀번호가 올바르지 않습니다."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            # 인증 성공 - 토큰 생성
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)