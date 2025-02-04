from rest_framework import serializers
from .models import Category, Vote, Comment

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['category', 'user', 'vote_type', 'opinion', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['category', 'vote', 'user', 'text', 'created_at']
