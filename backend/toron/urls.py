from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, VoteViewSet, CommentViewSet

app_name = "toron"

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename="category")
router.register(r'votes', VoteViewSet, basename="vote")
router.register(r'comments', CommentViewSet, basename="comment")

urlpatterns = [
    path('', include(router.urls)),
]
