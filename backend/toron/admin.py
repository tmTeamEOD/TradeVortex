from django.contrib import admin
from .models import Category, Vote, Comment

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")  # 리스트에서 표시할 필드
    search_fields = ("name",)  # 검색 가능 필드
    ordering = ("id",)  # 정렬 기준

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ("id", "category", "user", "vote_type", "created_at")
    list_filter = ("vote_type", "created_at")  # 필터 기능 추가
    search_fields = ("category__name", "user__username", "opinion")  # 검색 기능 추가
    ordering = ("-created_at",)  # 최신 투표가 위에 오도록 정렬

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "category", "user", "text", "created_at")
    search_fields = ("category__name", "user__username", "text")  # 댓글 내용 및 카테고리 검색 가능
    list_filter = ("created_at",)  # 필터 기능 추가
    ordering = ("-created_at",)  # 최신 댓글이 위에 오도록 정렬
