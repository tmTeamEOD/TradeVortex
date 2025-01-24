# freeboard/serializers.py
from board.serializers import PostSerializer
from .models import FreeBoardPost

class FreeBoardPostSerializer(PostSerializer):
    class Meta(PostSerializer.Meta):
        model = FreeBoardPost
        # 필요한 경우 추가 필드 설정
