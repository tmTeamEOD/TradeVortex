from django_filters import rest_framework as filters
from .models import Post

class PostFilter(filters.FilterSet):
    board_type = filters.CharFilter(field_name='board_type__name')
    tags = filters.CharFilter(field_name='tags__name')

    class Meta:
        model = Post
        fields = ['board_type', 'tags']
