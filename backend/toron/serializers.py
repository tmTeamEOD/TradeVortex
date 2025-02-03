from rest_framework import serializers
from .models import Category, Vote, Comment

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]

class VoteSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=True)

    class Meta:
        model = Vote
        fields = ["id", "category", "user", "vote_type", "opinion", "created_at"]

    def validate_category(self, value):
        """ ✅ 카테고리 필드가 반드시 포함되도록 검증 """
        if not value:
            raise serializers.ValidationError("카테고리 값을 입력해야 합니다.")
        return value

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["id", "category", "user", "text", "created_at"]
