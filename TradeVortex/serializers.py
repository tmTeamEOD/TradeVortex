# accounts/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        username = attrs.get('username')
        password = attrs.get('password')

        if email and username and password:
            user = authenticate(
                request=self.context.get('request'),
                email=email,
                username=username,
                password=password
            )
            if not user:
                raise serializers.ValidationError('이메일, 유저네임 또는 비밀번호가 잘못되었습니다.')
        else:
            raise serializers.ValidationError('이메일, 유저네임, 비밀번호는 필수 입력 사항입니다.')

        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # 토큰에 이메일과 유저네임 추가
        token['email'] = user.email
        token['username'] = user.username

        return token
