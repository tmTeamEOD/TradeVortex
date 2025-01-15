# freeboard/models.py
from board.models import Post, BoardType

class FreeBoardPost(Post):
    # 자유게시판에 특화된 필드 추가 가능
    # 예: 자유게시판만 사용할 수 있는 추가 옵션
    pass

    class Meta:
        proxy = True  # 실제 데이터베이스 테이블을 생성하지 않음
        verbose_name = "자유게시판 게시물"
        verbose_name_plural = "자유게시판 게시물들"
