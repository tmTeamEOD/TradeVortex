from rest_framework.pagination import PageNumberPagination

class NewsItemPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'  # 클라이언트에서 페이지 사이즈를 조정 가능
    max_page_size = 100
