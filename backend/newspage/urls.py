from django.urls import path

from . import views
from .views import CrawlNewsView

urlpatterns = [
    # path('newspage/', views.newspage, name='newspage'),
    path('', CrawlNewsView.as_view(), name='llmcrawl'),
]
