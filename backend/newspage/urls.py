from django.urls import path
from . import views

urlpatterns = [
    path('newspage', views.newspage, name='newspage'),
]
