from django.db import models
from django.conf import settings  # CustomUser 모델 사용
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


# 게시판 유형 모델
class BoardType(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="게시판 이름")
    description = models.TextField(blank=True, null=True, verbose_name="게시판 설명")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "게시판 유형"
        verbose_name_plural = "게시판 유형들"


# 게시물 모델
class Post(models.Model):
    board_type = models.ForeignKey(
        BoardType,
        on_delete=models.PROTECT,
        related_name="posts",
        verbose_name="게시판 유형",
        null=False,  # 반드시 지정해야 함
        blank=False,
        default=1  # 초기 기본값. Migration 시 설정된 기본 유형.
    )
    title = models.CharField(max_length=255, verbose_name="제목")
    content = models.TextField(verbose_name="내용")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
        verbose_name="작성자"
    )
    view_count = models.PositiveIntegerField(default=0, verbose_name="조회수")
    like_count = models.PositiveIntegerField(default=0, verbose_name="좋아요 수")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")

    def __str__(self):
        return f"[{self.board_type.name}] {self.title}"

    class Meta:
        verbose_name = "게시물"
        verbose_name_plural = "게시물들"


# 게시물 이미지 모델
class Image(models.Model):
    post = models.ForeignKey(
        Post,
        related_name="images",
        on_delete=models.CASCADE,
        verbose_name="게시물"
    )
    image = models.ImageField(upload_to="post_images/%Y/%m/%d/", verbose_name="이미지")
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="업로드 날짜")

    def __str__(self):
        return f"Image for {self.post.title}"

    def clean(self):
        """
        이미지가 최대 5개를 초과할 수 없도록 유효성 검사.
        """
        if self.post.images.count() >= 5:
            raise ValidationError("한 게시물에 이미지는 최대 5개까지만 추가할 수 있습니다.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "게시물 이미지"
        verbose_name_plural = "게시물 이미지들"


# 댓글 모델
class Comment(models.Model):
    post = models.ForeignKey(
        Post,
        related_name="comments",
        on_delete=models.CASCADE,
        verbose_name="게시물"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
        verbose_name="작성자"
    )
    content = models.TextField(verbose_name="댓글 내용")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="작성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"

    class Meta:
        verbose_name = "댓글"
        verbose_name_plural = "댓글들"


# 태그 모델
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="태그 이름")
    posts = models.ManyToManyField(Post, related_name="tags", verbose_name="게시물")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "태그"
        verbose_name_plural = "태그들"


# 신고 모델
class Report(models.Model):
    REPORT_CHOICES = [
        ("spam", "스팸"),
        ("abuse", "악성 내용"),
        ("other", "기타"),
    ]

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="신고 대상 게시물"
    )
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="신고 대상 댓글"
    )
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="신고자"
    )
    reason = models.CharField(max_length=50, choices=REPORT_CHOICES, verbose_name="신고 사유")
    details = models.TextField(blank=True, null=True, verbose_name="추가 설명")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="신고일")

    def __str__(self):
        target = self.post.title if self.post else f"Comment {self.comment.id}"
        return f"Report by {self.reporter.username} on {target}"

    class Meta:
        verbose_name = "신고"
        verbose_name_plural = "신고들"
#하하하하