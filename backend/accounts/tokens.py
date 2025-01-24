# accounts/tokens.py
from django.contrib.auth.tokens import PasswordResetTokenGenerator
import six  # python 2/3 호환을 위한 유틸, 토큰 생성 시 문자열 변환용

class EmailActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        # user의 pk, timestamp, is_active 상태 등을 조합해 해시를 만듦
        return (
            str(user.pk) +
            str(timestamp) +
            str(user.is_active)
        )

email_activation_token = EmailActivationTokenGenerator()