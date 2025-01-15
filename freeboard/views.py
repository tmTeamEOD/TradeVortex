# freeboard/views.py
from rest_framework import generics
from .models import FreeBoardPost
from .serializers import FreeBoardPostSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from board.models import BoardType
from rest_framework.exceptions import PermissionDenied

class FreeBoardPostListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = FreeBoardPostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        free_board_type = BoardType.objects.get(name='자유게시판')
        return FreeBoardPost.objects.filter(board_type=free_board_type)

    def perform_create(self, serializer):
        free_board_type = BoardType.objects.get(name='자유게시판')
        serializer.save(author=self.request.user, board_type=free_board_type)

class FreeBoardPostDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FreeBoardPostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        free_board_type = BoardType.objects.get(name='자유게시판')
        return FreeBoardPost.objects.filter(board_type=free_board_type)

    def perform_update(self, serializer):
        post = self.get_object()
        if post.author != self.request.user:
            raise PermissionDenied("작성자만 게시물을 수정할 수 있습니다.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied("작성자만 게시물을 삭제할 수 있습니다.")
        instance.delete()
