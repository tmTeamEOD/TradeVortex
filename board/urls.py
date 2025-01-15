from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BoardTypeViewSet, PostViewSet, ImageViewSet,
    CommentViewSet, TagViewSet, ReportViewSet, UserViewSet,
    LikeDislikeViewSet, ViewCountViewSet
)

router = DefaultRouter()
router.register(r'boardtypes', BoardTypeViewSet, basename='boardtype')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'images', ImageViewSet, basename='image')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'users', UserViewSet, basename='user')

# 추가된 LikeDislikeViewSet 및 ViewCountViewSet
router.register(r'like_dislike', LikeDislikeViewSet, basename='like_dislike')
router.register(r'view_count', ViewCountViewSet, basename='view_count')

urlpatterns = [
    path('', include(router.urls)),
]
