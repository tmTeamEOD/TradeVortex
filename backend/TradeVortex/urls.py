# urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserDetailView, CustomTokenObtainPairView, LoginView

urlpatterns = [
    path('api/', include('board.urls')),  # 게시판 앱의 URL 포함
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # 표준 로그인
    path('api/token2/', LoginView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user/', UserDetailView.as_view(), name='user-detail'),  # 사용자 정보
    path('api/accounts/', include('accounts.urls')),
    path('api/aiassist/', include('aiassist.urls')),  # aiassist 앱의 URL 포함
    path('api/board/', include('board.urls')),
    path('api/fetch/', include('graphs.urls')),
    path('api/calender/', include('calender.urls')),
    path('api/news/', include('newspage.urls')),
    path('api/toron/', include('toron.urls')),
    path('api/finance/', include('financedata.urls')),

]

from django.conf import settings
from django.conf.urls.static import static


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
