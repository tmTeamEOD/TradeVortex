from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import BoardType, Post, Image, Comment, Tag, Report
from .serializers import (
    BoardTypeSerializer, PostSerializer, ImageSerializer,
    CommentSerializer, TagSerializer, ReportSerializer, UserSerializer
)
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser, IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import viewsets  # viewsets 가져오기

class BoardTypeViewSet(viewsets.ModelViewSet):
    queryset = BoardType.objects.all()
    serializer_class = BoardTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'like_count', 'view_count']
    filterset_fields = ['board_type', 'tags__name']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["patch"])
    def like(self, request, pk=None):
        post = self.get_object()
        post.like_count += 1
        post.save()
        return Response({"like_count": post.like_count}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"])
    def dislike(self, request, pk=None):
        post = self.get_object()
        post.dislike_count += 1
        post.save()
        return Response({"dislike_count": post.dislike_count}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"])
    def increase_view_count(self, request, pk=None):
        post = self.get_object()
        post.view_count += 1
        post.save()
        return Response({"view_count": post.view_count}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def report(self, request, pk=None):
        post = self.get_object()
        reason = request.data.get('reason', '')
        details = request.data.get('details', '')
        if reason:
            report = Report.objects.create(
                post=post,
                reporter=request.user,
                reason=reason,
                details=details
            )
            return Response({"message": "게시물이 신고되었습니다."}, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": "신고 사유가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)


class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        post_id = self.request.data.get("post")  # 요청 데이터에서 post ID 가져오기
        if not post_id:
            raise serializers.ValidationError({"post": "게시물 ID가 필요합니다."})

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            raise serializers.ValidationError({"post": "해당 게시물을 찾을 수 없습니다."})

        serializer.save(post=post)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('created_at')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['content']
    ordering_fields = ['created_at']
    ordering = ['created_at']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
    ordering = ['name']


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all().order_by('-created_at')
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from .models import Post
from .serializers import PostSerializer

class LikeDislikeViewSet(viewsets.ViewSet):
    """
    좋아요 및 싫어요 처리하는 뷰셋
    """
    @action(detail=True, methods=['patch'])
    def like(self, request, pk=None):
        post = self.get_object()
        post.like_count += 1
        post.save()
        return Response({"like_count": post.like_count}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def dislike(self, request, pk=None):
        post = self.get_object()
        post.dislike_count += 1
        post.save()
        return Response({"dislike_count": post.dislike_count}, status=status.HTTP_200_OK)


class ViewCountViewSet(viewsets.ViewSet):
    """
    게시물 조회수 증가를 처리하는 뷰셋
    """
    @action(detail=True, methods=['patch'])
    def increase_view_count(self, request, pk=None):
        post = self.get_object()
        post.view_count += 1
        post.save()
        return Response({"view_count": post.view_count}, status=status.HTTP_200_OK)
