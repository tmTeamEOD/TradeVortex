from django.conf import settings
from django.db import models

# models.py
from django.conf import settings

class CrewAIRun(models.Model):
    inputs = models.JSONField()  # 입력 데이터
    result = models.JSONField()  # AI 작업 결과
    status = models.CharField(max_length=50, default='pending')  # 상태
    recommendations = models.PositiveIntegerField(default=0)  # 추천 수 필드 추가
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,  # 사용자 필드가 null일 수 있도록 설정
    )  # 작업을 시작한 사용자

    def __str__(self):
        return f"Crew AI Run {self.id}"
