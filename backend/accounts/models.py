from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator
from django.utils.timezone import now


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  # 이메일을 사용자 ID로 사용
    username = models.CharField(max_length=150, unique=True)  # 사용자 이름
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        null=True,
        blank=True,
        default='profile_pictures/img.jpg'
    )  # 프로필 사진
    bio = models.TextField(
        max_length=500, blank=True, null=True, verbose_name="자기소개"
    )  # 자기소개
    joined_at = models.DateTimeField(auto_now_add=True, verbose_name="가입일")
    last_activity = models.DateTimeField(default=now, verbose_name="마지막 활동 날짜")  # 마지막 활동
    phone_number = models.CharField(
        max_length=15, blank=True, null=True, verbose_name="휴대폰 번호"
    )  # 휴대폰 번호
    is_verified = models.BooleanField(default=False, verbose_name="이메일 인증 여부")  # 이메일 인증 여부
    followers = models.ManyToManyField(
        "self", symmetrical=False, related_name="following", blank=True
    )  # 팔로워-팔로잉 관계

    # 포인트와 레벨 필드 추가
    points = models.PositiveIntegerField(
        default=0, validators=[MinValueValidator(0)], verbose_name="포인트"
    )  # 사용자 포인트
    level = models.PositiveIntegerField(default=1, verbose_name="레벨")  # 사용자 레벨

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def save(self, *args, **kwargs):
        # 이메일을 소문자로 변환
        if self.email:
            self.email = self.email.lower()

        # 자동으로 username 생성 (중복 방지)
        if not self.username:
            base_username = slugify(self.email.split("@")[0])
            counter = 1
            unique_username = base_username
            while CustomUser.objects.filter(username=unique_username).exists():
                unique_username = f"{base_username}{counter}"
                counter += 1
            self.username = unique_username

        # 레벨 계산: 포인트를 기준으로 레벨 설정
        self.level = self.calculate_level()

        super().save(*args, **kwargs)

    def calculate_level(self):
        """
        포인트를 기준으로 레벨을 계산하는 메서드.
        예: 100 포인트마다 1 레벨 증가
        """
        return max(1, self.points // 100 + 1)

    def add_points(self, amount):
        """
        포인트를 추가하고 레벨을 갱신하는 메서드.
        """
        self.points += amount
        self.level = self.calculate_level()
        self.save()

    def subtract_points(self, amount):
        """
        포인트를 차감하고 레벨을 갱신하는 메서드.
        """
        self.points = max(0, self.points - amount)
        self.level = self.calculate_level()
        self.save()

    def __str__(self):
        return self.username

from django.db import models

class BoardType(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="게시판 이름")
    description = models.TextField(blank=True, null=True, verbose_name="게시판 설명")

    def __str__(self):
        return self.name
