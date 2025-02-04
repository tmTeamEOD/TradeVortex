from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Vote(models.Model):
    VOTE_TYPES = [("up", "오른다"), ("down", "내린다")]

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="votes")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="toron_votes")  # 익명 사용자 가능
    vote_type = models.CharField(max_length=10, choices=VOTE_TYPES)
    opinion = models.TextField()  # 의견 필드 추가
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # 최신 투표가 먼저 오도록 정렬

    def __str__(self):
        return f"{self.category} - {self.user} - {self.vote_type}"

class Comment(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="comments")
    vote = models.ForeignKey(Vote, on_delete=models.CASCADE, related_name="comments", null=True, blank=True)  # 댓글이 어떤 투표에 속하는지 연결
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="toron_comments")  # 익명 사용자 가능
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # 최신 댓글이 먼저 오도록 정렬

    def __str__(self):
        return f"{self.category} - {self.user}: {self.text}"
