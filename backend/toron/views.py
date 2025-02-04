from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Vote, Comment
from .serializers import CategorySerializer, VoteSerializer, CommentSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class VoteViewSet(viewsets.ModelViewSet):
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)

    @action(detail=False, methods=["get"], url_path="summary")
    def vote_summary(self, request):
        """ 카테고리별 투표 개수 및 의견 가져오기 """
        data = []
        categories = Category.objects.all()

        for category in categories:
            up_count = Vote.objects.filter(category=category, vote_type="up").count()
            down_count = Vote.objects.filter(category=category, vote_type="down").count()

            # 각 투표에 대한 의견(opinion)을 가져오며, `vote_type`을 함께 전달
            votes_with_opinions = Vote.objects.filter(category=category)
            opinions = [
                {"text": vote.opinion, "type": vote.vote_type}  # 의견과 vote_type 함께 반환
                for vote in votes_with_opinions
            ]

            data.append({
                "category_id": category.id,
                "category_name": category.name,
                "up": up_count,
                "down": down_count,
                "opinions": opinions,  # opinions는 이제 "type"도 포함됨
            })

        return Response(data)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        """ 댓글 생성 시 투표와 연결 """
        vote_id = self.request.data.get('vote')  # 요청에서 vote ID를 받음
        vote = Vote.objects.get(id=vote_id)
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(vote=vote, user=user)
