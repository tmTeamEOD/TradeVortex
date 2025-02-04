# models.py
from django.db import models

class NewsItem(models.Model):
    title = models.CharField(max_length=500)
    content = models.TextField()
    url = models.URLField(unique=True,max_length=500)
    asset = models.CharField(max_length=100, blank=True, null=True)
    image = models.CharField(max_length=255, blank=True, null=True)  # 로컬 이미지 경로 (예: /media/news_images/xxx.jpg)
    sentiment = models.CharField(max_length=50, blank=True, null=True)  # 예: "긍정", "중립", "부정"
    is_duplicate = models.BooleanField(default=False)  # 중복 여부
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
