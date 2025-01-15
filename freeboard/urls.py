# freeboard/urls.py
from django.urls import path
from .views import (
    FreeBoardPostListCreateAPIView,
    FreeBoardPostDetailAPIView,
)

urlpatterns = [
    path('freeposts/', FreeBoardPostListCreateAPIView.as_view(), name='freeboard-post-list-create'),
    path('freeposts/<int:pk>/', FreeBoardPostDetailAPIView.as_view(), name='freeboard-post-detail'),
]
