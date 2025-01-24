from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import UserDetailsSerializer
from .models import CustomUser
from django.conf import settings
import logging

# Logger 설정
logger = logging.getLogger(__name__)

# **사용자 회원가입 시리얼라이저 (CustomRegisterSerializer)**
class CustomRegisterSerializer(RegisterSerializer):
    email = serializers.EmailField(required=True)  # 이메일 필수
    username = serializers.CharField(required=True, max_length=150)  # 닉네임 필수
    password1 = serializers.CharField(write_only=True)  # 비밀번호 1
    password2 = serializers.CharField(write_only=True)  # 비밀번호 2 (확인용)
    profile_picture = serializers.ImageField(required=False)  # 프로필 사진 (선택)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password1', 'password2', 'profile_picture']

    def validate(self, data):
        """
        사용자 입력값 검증 로직
        """
        # 비밀번호 확인
        if data['password1'] != data['password2']:
            logger.warning("Password mismatch during validation.")
            raise serializers.ValidationError({"password": "비밀번호가 일치하지 않습니다."})

        # 이메일 중복 확인
        if CustomUser.objects.filter(email=data['email']).exists():
            logger.warning(f"Email '{data['email']}' is already in use.")
            raise serializers.ValidationError({"email": "이미 사용 중인 이메일입니다."})

        # 닉네임 중복 확인
        if CustomUser.objects.filter(username=data['username']).exists():
            logger.warning(f"Username '{data['username']}' is already in use.")
            raise serializers.ValidationError({"username": "이미 사용 중인 닉네임입니다."})

        return data

    def save(self, request):
        """
        사용자 데이터를 저장하는 로직
        """
        logger.info("CustomRegisterSerializer is being used to save a new user.")
        try:
            # 기본 User 저장 로직 호출
            user = super().save(request)

            # 프로필 사진 저장
            profile_picture = self.validated_data.get('profile_picture')
            if profile_picture:
                user.profile_picture = profile_picture
                user.save()
                logger.info(f"Profile picture saved for user '{user.username}'.")

            logger.info(f"User '{user.username}' successfully registered.")
            return user
        except Exception as e:
            logger.error(f"Error during user registration: {e}")
            raise serializers.ValidationError({"detail": "사용자 저장 중 오류가 발생했습니다."})


# **사용자 상세 정보 시리얼라이저 (CustomUserDetailsSerializer)**
class CustomUserDetailsSerializer(UserDetailsSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    points = serializers.IntegerField(read_only=True)  # 사용자 포인트 (읽기 전용)
    level = serializers.IntegerField(read_only=True)  # 사용자 레벨 (읽기 전용)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'profile_picture_url', 'bio', 'points', 'level']  # 반환 필드 지정

    def get_profile_picture_url(self, obj):
        """
        사용자 프로필 사진의 전체 URL 반환.
        """
        if obj.profile_picture:
            logger.debug(f"Returning profile picture URL for user '{obj.username}'.")
            return obj.profile_picture.url
        logger.debug(f"No profile picture found for user '{obj.username}'. Returning default avatar.")
        return f"{settings.MEDIA_URL}default-avatar.png"  # 기본 아바타 URL 반환


# **기본 사용자 목록 시리얼라이저 (UserSerializer)**
class UserSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'profile_picture_url', 'points', 'level']  # 반환 필드 지정

    def get_profile_picture_url(self, obj):
        """
        사용자 프로필 사진 URL 반환 로직
        """
        if obj.profile_picture:
            logger.debug(f"Returning profile picture URL for user '{obj.username}'.")
            return obj.profile_picture.url
        logger.debug(f"No profile picture for user '{obj.username}'. Returning default avatar.")
        return f"{settings.MEDIA_URL}default-avatar.png"  # 기본 아바타 반환


# **사용자 포인트 및 레벨 업데이트 시리얼라이저**
class UserPointsSerializer(serializers.ModelSerializer):
    points = serializers.IntegerField()  # 포인트 수정 가능

    class Meta:
        model = CustomUser
        fields = ['points']

    def update(self, instance, validated_data):
        """
        사용자 포인트를 업데이트하고 레벨을 갱신하는 로직
        """
        new_points = validated_data.get('points', instance.points)
        instance.points = max(0, new_points)  # 포인트는 음수가 될 수 없음
        instance.level = instance.calculate_level()  # 레벨 갱신
        instance.save()
        logger.info(f"User '{instance.username}' points updated to {instance.points} with level {instance.level}.")
        return instance
