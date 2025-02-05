from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssetViewSet, OHLCVViewSet, ForecastAPIView

# DefaultRouter를 사용하여 AssetViewSet과 OHLCVViewSet의 URL 자동 등록
router = DefaultRouter()
router.register(r'assets', AssetViewSet)
router.register(r'ohlcv', OHLCVViewSet)

urlpatterns = [
    # AssetViewSet과 OHLCVViewSet에 대한 URL
    path('', include(router.urls)),

    # ForecastAPIView URL 추가
    path('forecast/', ForecastAPIView.as_view(), name='forecast'),
]
