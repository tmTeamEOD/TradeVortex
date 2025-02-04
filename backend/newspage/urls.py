# urls.py
from django.urls import path
from .views import NewsListView, CrawlControlView, NewsStatsView, WordCloudDataView, NewsDetailAPIView

urlpatterns = [
    path('crawl/', CrawlControlView.as_view(), name='crawl-control'),
    path('', NewsListView.as_view(), name='news-list'),
    path('news-stats/', NewsStatsView.as_view(), name='news-stats'),
    path('wordcloud/', WordCloudDataView.as_view(), name='wordcloud-data'),
    path('news/<int:pk>/', NewsDetailAPIView.as_view(), name='news-detail'),

]
