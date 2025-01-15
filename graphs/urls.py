from django.urls import path
from . import views

urlpatterns = [
    # 초봉 데이터
    path('candles/seconds/<str:symbol>/', views.fetch_seconds_candles, name='fetch_seconds_candles'),

    # 나머지 캔들 데이터 (분봉, 일봉, 주봉, 월봉)
    path('candles/<str:candle_type>/<str:symbol>/', views.fetch_other_candles, name='fetch_other_candles'),
]
