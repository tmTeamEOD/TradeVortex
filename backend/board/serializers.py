from rest_framework import serializers
from .models import BoardType, Post, Image, Comment, Tag, Report
from django.contrib.auth.models import User

class BoardTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardType
        fields = ['id', 'name', 'description']


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image', 'uploaded_at']


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)  # 작성자 이름 표시

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at', 'updated_at']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class PostSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)  # 작성자 이름 표시
    images = ImageSerializer(many=True, required=False)
    comments = CommentSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    board_type = serializers.PrimaryKeyRelatedField(queryset=BoardType.objects.all())

    class Meta:
        model = Post
        fields = [
            'id', 'board_type', 'title', 'content', 'author',
            'view_count', 'like_count', 'created_at', 'updated_at',
            'images', 'comments', 'tags'
        ]

    def create(self, validated_data):
        images_data = self.context['request'].FILES.getlist('images')  # 여러 이미지 처리
        post = Post.objects.create(**validated_data)  # 게시물 생성

        for image_data in images_data:
            Image.objects.create(post=post, image=image_data)  # 이미지 저장

        return post


class ReportSerializer(serializers.ModelSerializer):
    reporter = serializers.StringRelatedField(read_only=True)
    post = serializers.StringRelatedField(read_only=True)
    comment = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'post', 'comment', 'reporter',
            'reason', 'details', 'created_at'
        ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name']
