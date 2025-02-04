from rest_framework import serializers
from .models import NewsItem

class NewsItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsItem
        fields = [
            "id",
            "title",
            "content",
            "url",
            "asset",
            "image",
            "created_at",
        ]
